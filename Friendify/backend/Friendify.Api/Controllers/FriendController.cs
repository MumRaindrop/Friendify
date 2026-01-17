using Microsoft.AspNetCore.Mvc;
using Friendify.Api.Services;
using Friendify.Api.Models;

namespace Friendify.Api.Controllers;

[ApiController] //Controller for all api enpoints for dealing with the friends page and tables
[Route("api/friends")]
public class FriendController : ControllerBase
{
    private readonly SupabaseService _supabase;

    public FriendController(SupabaseService supabase)
    {
        _supabase = supabase;
    }

    [HttpPost("request")] //Endpoint to send a friend request to a user
    public async Task<IActionResult> SendFriendRequest(
        [FromQuery] string senderSpotifyId,
        [FromQuery] string receiverSpotifyId) // Properties necessary to send a request
    {
        if (senderSpotifyId == receiverSpotifyId) // Cannot send a request to yourself
            return BadRequest("You cannot add yourself.");

        try // Attempt to add a new row to the FriendRequest table in supabase
        {
            await _supabase.Client
                .From<FriendRequestRow>()
                .Insert(new FriendRequestRow
                {
                    SenderSpotifyId = senderSpotifyId,
                    ReceiverSpotifyId = receiverSpotifyId,
                    Status = "pending"
                });

            return Ok("Friend request sent."); // Request Successful
        }
        catch (Exception ex) // Catch exception when request fails
        {
            Console.WriteLine($"[ERROR] SendFriendRequest failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("requests")] // Endpoint to display requests for a user
    public async Task<IActionResult> GetIncomingRequests([FromQuery] string spotifyUserId) // Takes the user's spotify Id
    {
        try // Attempt to get all entries where the receiver is the current user
        {
            var requests = await _supabase.Client
                .From<FriendRequestRow>()
                .Where(r => r.ReceiverSpotifyId == spotifyUserId)
                .Get();

            var result = new List<object>(); // Save the results as a list of requests

            foreach (var req in requests.Models) // Get the display name for the sender for each of the incoming requests
            {
                var user = await _supabase.Client
                    .From<UserRow>()
                    .Where(u => u.SpotifyUserId == req.SenderSpotifyId)
                    .Get();

                result.Add(new // adjust the results list with the new info
                {
                    req.Id,
                    SenderSpotifyId = req.SenderSpotifyId,
                    SenderDisplayName = user.Models.FirstOrDefault()?.DisplayName ?? req.SenderSpotifyId,
                    req.CreatedAt
                });
            }

            return Ok(result); // Return the list of results with the senders display names
        }
        catch (Exception ex) // Catch if getting the requests failed
        {
            Console.WriteLine($"[ERROR] GetIncomingRequests failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("accept")] // Endpoint for accepting a friend request
    public async Task<IActionResult> AcceptRequest([FromQuery] string requestId)
    {
        var request = await _supabase.Client // Get the request being accepted
            .From<FriendRequestRow>()
            .Where(r => r.Id == requestId)
            .Single();

        if (request == null) // request doesnt exist in the database
            return NotFound("Friend request not found.");

        await _supabase.Client // Add the friendship relation to the friends table
            .From<FriendRow>()
            .Insert(new[]
            {
                new FriendRow
                {
                    UserSpotifyId = request.SenderSpotifyId,
                    FriendSpotifyId = request.ReceiverSpotifyId
                },
                new FriendRow
                {
                    UserSpotifyId = request.ReceiverSpotifyId,
                    FriendSpotifyId = request.SenderSpotifyId
                }
            });

        await _supabase.Client // Delete the processed request
            .From<FriendRequestRow>()
            .Where(r => r.Id == requestId)
            .Delete();

        return Ok("Friend request accepted.");
    }

    [HttpPost("reject")] // Endpoint to reject a friend request
    public async Task<IActionResult> RejectRequest([FromQuery] string requestId)
    {
        await _supabase.Client // Get the request being rejected and delete it
            .From<FriendRequestRow>()
            .Where(r => r.Id == requestId)
            .Delete();

        return Ok("Friend request rejected.");
    }

    [HttpGet] // Return the list of friends as display name
    public async Task<IActionResult> GetFriends([FromQuery] string spotifyUserId)
    {
        try
        {
            // Get the spotify ids of all friends 
            var friendsResult = await _supabase.Client
                .From<FriendRow>()
                .Where(f => f.UserSpotifyId == spotifyUserId)
                .Get();

            var friendSpotifyIds = friendsResult.Models.Select(f => f.FriendSpotifyId).ToList();

            // For each of the friends spotify ids get their display names from the user table
            var friendsWithNames = new List<object>();
            foreach (var id in friendSpotifyIds)
            {
                var userResult = await _supabase.Client
                    .From<UserRow>()
                    .Where(u => u.SpotifyUserId == id)
                    .Get();

                if (userResult.Models.Count > 0)
                    friendsWithNames.Add(new
                    {
                        SpotifyId = id,
                        DisplayName = userResult.Models[0].DisplayName ?? id
                    });
                else
                    friendsWithNames.Add(new
                    {
                        SpotifyId = id,
                        DisplayName = id
                    });
            }

            return Ok(friendsWithNames); // Return the set of friends with display names
        }
        catch (Exception ex) // If getting the friends list fails
        {
            Console.WriteLine($"[ERROR] GetFriends failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("search")] // Search for a Friendify user based on display name
    public async Task<IActionResult> SearchUsers([FromQuery] string displayName)
    {
        if (string.IsNullOrWhiteSpace(displayName)) // Chech valid search
            return BadRequest("Display name is required.");

        try // Get the users from users table with display name equal to the search
        {
            var result = await _supabase.Client
                .From<UserRow>()
                .Where(u => u.DisplayName == displayName)
                .Get();

            var users = result.Models.Select(u => new // Get the following columns from the table
            {
                u.Id,
                u.SpotifyUserId,
                u.DisplayName
            });

            return Ok(users); // Return the results
        }
        catch (Exception ex) // If search failed
        {
            Console.WriteLine($"[ERROR] SearchUsers failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("user")] // Get a user by spotify id rather than display name
    public async Task<IActionResult> GetUser([FromQuery] string spotifyUserId)
    {
        if (string.IsNullOrWhiteSpace(spotifyUserId)) // Valid search
            return BadRequest("SpotifyUserId is required");

        try // Get from the user table where ids match
        {
            var result = await _supabase.Client
                .From<UserRow>()
                .Where(u => u.SpotifyUserId == spotifyUserId)
                .Get();

            var user = result.Models.FirstOrDefault(); // Get the first match
            if (user == null) return NotFound();

            return Ok(new { user.DisplayName, user.SpotifyUserId }); // return users display and id name
        }
        catch (Exception ex) // On failed search
        {
            Console.WriteLine($"[ERROR] GetUser failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("remove")] // Endpoint for removing a friend
    public async Task<IActionResult> RemoveFriend(
        [FromQuery] string spotifyUserId, // Current user and friend ids
        [FromQuery] string friendSpotifyId)
    {
        if (string.IsNullOrWhiteSpace(spotifyUserId) || string.IsNullOrWhiteSpace(friendSpotifyId)) // If inputs are not valid
            return BadRequest("Both spotifyUserId and friendSpotifyId are required.");

        try
        {
            // remove friend relationship
            await _supabase.Client
                .From<FriendRow>()
                .Where(f =>
                    f.UserSpotifyId == spotifyUserId &&
                    f.FriendSpotifyId == friendSpotifyId
                )
                .Delete();

            // remove friend relationship (inverse)
            await _supabase.Client
                .From<FriendRow>()
                .Where(f =>
                    f.UserSpotifyId == friendSpotifyId &&
                    f.FriendSpotifyId == spotifyUserId
                )
                .Delete();

            return Ok("Friend removed.");
        }
        catch (Exception ex) // If remove friend failed
        {
            Console.WriteLine($"[ERROR] RemoveFriend failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }
}
