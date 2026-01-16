using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;
using Friendify.Api.Services;
using Friendify.Api.Models;
using Friendify.Api.Dtos;

namespace Friendify.Api.Controllers;

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

    // ==============================
    // Spotify Login Redirect
    // ==============================
    [HttpGet("login")]
    public IActionResult Login()
    {
        var clientId = _config["Spotify:ClientId"];
        var redirectUri = _config["Spotify:RedirectUri"];

        // ✅ REQUIRED SCOPES
        var scopes = string.Join(" ", new[]
        {
            "user-read-email",
            "user-read-private",
            "user-top-read"
        });

        var url =
            "https://accounts.spotify.com/authorize" +
            $"?response_type=code" +
            $"&client_id={clientId}" +
            $"&scope={Uri.EscapeDataString(scopes)}" +
            $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
            $"&show_dialog=true"; // ✅ FORCE RE-CONSENT

        return Redirect(url);
    }

    // ==============================
    // Spotify Callback Redirect
    // ==============================
    [HttpGet("callback")]
    public async Task<IActionResult> Callback([FromQuery] string code)
    {
        if (string.IsNullOrEmpty(code))
            return BadRequest("Missing code");

        // 1️⃣ Exchange code → access token
        var accessToken = await ExchangeCodeForToken(code);

        // 2️⃣ Fetch Spotify profile
        var profile = await GetSpotifyProfile(accessToken);
        if (string.IsNullOrEmpty(profile?.Id))
            return BadRequest("Spotify profile missing ID.");

        // 3️⃣ Upsert user in Supabase
        await _supabase.Client
            .From<UserRow>()
            .Upsert(new UserRow
            {
                SpotifyUserId = profile.Id,
                DisplayName = profile.DisplayName,
                ProfileImageUrl = profile.Images?.FirstOrDefault()?.Url,
                LastLoginAt = DateTime.UtcNow
            });

        // 4️⃣ Fetch & store top tracks for all time ranges
        var timeRanges = new[] { "short_term", "medium_term", "long_term" };

        foreach (var timeRange in timeRanges)
        {
            // Fetch top 10 tracks for this time range
            var topTracks = await GetTopTracks(accessToken, timeRange);

            // Clear existing tracks for this user + time range
            await _supabase.Client
                .From<TopTrackRow>()
                .Filter("spotify_user_id", Supabase.Postgrest.Constants.Operator.Equals, profile.Id)
                .Filter("time_range", Supabase.Postgrest.Constants.Operator.Equals, timeRange)
                .Delete();

            // Insert new tracks
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

            if (rows.Count > 0)
            {
                await _supabase.Client
                    .From<TopTrackRow>()
                    .Insert(rows);
            }
        }

        // 5️⃣ Redirect to frontend HOME
        return Redirect($"http://localhost:5173/home?spotifyUserId={profile.Id}");
    }

    // ==============================
    // Get User Top Tracks
    // ==============================
    [HttpGet("me/top-tracks")]
    public async Task<IActionResult> GetMyTopTracks(
        [FromQuery] string spotifyUserId,
        [FromQuery] string timeRange = "medium_term"
    )
    {
        if (string.IsNullOrEmpty(spotifyUserId))
            return BadRequest("Missing Spotify user ID");

        var result = await _supabase.Client
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
        });

        return Ok(tracks);
    }

    // ==============================
    // Helper Methods
    // ==============================
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
        );

        response.EnsureSuccessStatusCode();

        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return json.RootElement.GetProperty("access_token").GetString()!;
    }

    private async Task<SpotifyProfileDto> GetSpotifyProfile(string token)
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var json = await client.GetStringAsync("https://api.spotify.com/v1/me");
        return JsonSerializer.Deserialize<SpotifyProfileDto>(json)!;
    }

    private async Task<SpotifyTopTracksDto> GetTopTracks(string token, string timeRange)
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
