using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;
using Friendify.Api.Services;
using Friendify.Api.Models;
using Friendify.Api.Dtos;

namespace Friendify.Api.Controllers; // Controller for interacting with Spotify API and supabase related tables

[ApiController]
[Route("api/spotify")]
public class SpotifyController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly SupabaseService _supabase;

    public SpotifyController(IConfiguration config, SupabaseService supabase)
    {
        _config = config;
        _supabase = supabase;
    }

    [HttpGet("login")] // Redirect to spotify login
    public IActionResult Login()
    {
        var clientId = _config["Spotify:ClientId"];
        var redirectUri = _config["Spotify:RedirectUri"];

        // ✅ REQUIRED SCOPES
        var scopes = string.Join(" ", new[] // Scopes to request on authentication
        {
            "user-read-email",
            "user-read-private",
            "user-top-read"
        });

        var url = // Redirect url, for requesting information from spotify
            "https://accounts.spotify.com/authorize" +
            $"?response_type=code" +
            $"&client_id={clientId}" +
            $"&scope={Uri.EscapeDataString(scopes)}" +
            $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
            $"&show_dialog=true"; // ✅ FORCE RE-CONSENT

        return Redirect(url);
    }

    [HttpGet("callback")] // redirect after login
    public async Task<IActionResult> Callback([FromQuery] string code)
    {
        if (string.IsNullOrEmpty(code)) 
            return BadRequest("Missing code");

        var accessToken = await ExchangeCodeForToken(code); // Get access token using auth code

        var profile = await GetSpotifyProfile(accessToken); // Get a user spotify profile
        if (string.IsNullOrEmpty(profile?.Id))
            return BadRequest("Spotify profile missing ID.");

        await _supabase.Client // get the information to save the user to the user table in supabase
            .From<UserRow>()
            .Upsert(new UserRow
            {
                SpotifyUserId = profile.Id,
                DisplayName = profile.DisplayName,
                ProfileImageUrl = profile.Images?.FirstOrDefault()?.Url,
                LastLoginAt = DateTime.UtcNow
            });

        var timeRanges = new[] { "short_term", "medium_term", "long_term" }; // time ranges for top tracks

        foreach (var timeRange in timeRanges) // for each of the time ranges
        {
            // Get the top 10 tracks for that time range using the access token
            var topTracks = await GetTopTracks(accessToken, timeRange);

            // Remove existing tracks to be replaced
            await _supabase.Client
                .From<TopTrackRow>()
                .Filter("spotify_user_id", Supabase.Postgrest.Constants.Operator.Equals, profile.Id)
                .Filter("time_range", Supabase.Postgrest.Constants.Operator.Equals, timeRange)
                .Delete();

            // Add the new top tracks to top tracks table
            var rows = topTracks.Items
                .Where(t => !string.IsNullOrEmpty(t.Id))
                .Select((track, index) => new TopTrackRow
                {
                    SpotifyUserId = profile.Id,
                    SpotifyTrackId = track.Id,
                    TrackName = track.Name,
                    ArtistName = string.Join(", ", track.Artists.Select(a => a.Name)),
                    AlbumName = track.Album.Name,
                    AlbumImageUrl = track.Album.Images?.FirstOrDefault()?.Url,
                    PreviewUrl = track.PreviewUrl,
                    Popularity = track.Popularity,
                    Rank = index + 1,
                    TimeRange = timeRange
                })
                .ToList();

            if (rows.Count > 0) // Insert the new rows
            {
                await _supabase.Client
                    .From<TopTrackRow>()
                    .Insert(rows);
            }
        }

        return Redirect($"http://localhost:5173/home?spotifyUserId={profile.Id}"); // Redirect to the home page
    }

    [HttpGet("me/top-tracks")] // Get a user's top tracks
    public async Task<IActionResult> GetMyTopTracks(
        [FromQuery] string spotifyUserId,
        [FromQuery] string timeRange = "medium_term" // Default time range
    )
    {
        if (string.IsNullOrEmpty(spotifyUserId)) // Valid id check
            return BadRequest("Missing Spotify user ID");

        var result = await _supabase.Client // Ask for the top rows for the user and time range
            .From<TopTrackRow>()
            .Where(t => t.SpotifyUserId == spotifyUserId)
            .Where(t => t.TimeRange == timeRange)
            .Order(t => t.Rank, Supabase.Postgrest.Constants.Ordering.Ascending)
            .Get();

        var tracks = result.Models.Select(t => new
        {
            t.Rank,
            t.TrackName,
            t.ArtistName,
            t.AlbumName,
            t.AlbumImageUrl,
            t.PreviewUrl,
            t.Popularity
        }); // Get the tracks as a useable model

        return Ok(tracks); // return the tracks
    }

    // Methods to make it all work
    private async Task<string> ExchangeCodeForToken(string code)
    {
        using var client = new HttpClient();

        var response = await client.PostAsync(
            "https://accounts.spotify.com/api/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "grant_type", "authorization_code" },
                { "code", code },
                { "redirect_uri", _config["Spotify:RedirectUri"] },
                { "client_id", _config["Spotify:ClientId"] },
                { "client_secret", _config["Spotify:ClientSecret"] }
            })
        ); // using the auth code request an access token from spotify using the apps keys

        response.EnsureSuccessStatusCode();

        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return json.RootElement.GetProperty("access_token").GetString()!; // return the access token
    }

    private async Task<SpotifyProfileDto> GetSpotifyProfile(string token) // Get the profile
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var json = await client.GetStringAsync("https://api.spotify.com/v1/me");
        return JsonSerializer.Deserialize<SpotifyProfileDto>(json)!; // Return the spotify profile from the token
    }

    private async Task<SpotifyTopTracksDto> GetTopTracks(string token, string timeRange) // Get tracks from access token and time range
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var json = await client.GetStringAsync(
            $"https://api.spotify.com/v1/me/top/tracks?limit=10&time_range={timeRange}"
        );

        return JsonSerializer.Deserialize<SpotifyTopTracksDto>(json)!;
    }

}
