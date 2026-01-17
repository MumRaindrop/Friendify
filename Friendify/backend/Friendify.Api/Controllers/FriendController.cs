using Microsoft.AspNetCore.Mvc;
using Friendify.Api.Services;
using Friendify.Api.Models;

namespace Friendify.Api.Controllers;

[ApiController]
[Route("api/friends")]
public class FriendController : ControllerBase
{
    private readonly SupabaseService _supabase;

    public FriendController(SupabaseService supabase)
    {
        _supabase = supabase;
    }

    // -------------------------
    // Send Friend Request
    // -------------------------
    [HttpPost("request")]
    public async Task<IActionResult> SendFriendRequest([FromQuery] string senderSpotifyId, [FromQuery] string receiverSpotifyId)
    {
        if (string.IsNullOrWhiteSpace(senderSpotifyId) || string.IsNullOrWhiteSpace(receiverSpotifyId))
            return BadRequest("Both sender and receiver Spotify IDs are required.");

        if (senderSpotifyId == receiverSpotifyId)
            return BadRequest("You cannot add yourself.");

        try
        {
            await _supabase.Client
                .From<FriendRequestRow>()
                .Insert(new FriendRequestRow
                {
                    SenderSpotifyId = senderSpotifyId,
                    ReceiverSpotifyId = receiverSpotifyId,
                    Status = "pending"
                });

            return Ok("Friend request sent.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] SendFriendRequest failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }

    // -------------------------
    // Get Incoming Requests
    // -------------------------
    [HttpGet("requests")]
    public async Task<IActionResult> GetIncomingRequests([FromQuery] string spotifyUserId)
    {
        if (string.IsNullOrWhiteSpace(spotifyUserId))
            return BadRequest("SpotifyUserId is required.");

        try
        {
            var requests = await _supabase.Client
                .From<FriendRequestRow>()
                .Where(r => r.ReceiverSpotifyId == spotifyUserId)
                .Get();

            var result = new List<object>();

            foreach (var req in requests.Models)
            {
                var user = await _supabase.Client
                    .From<UserRow>()
                    .Where(u => u.SpotifyUserId == req.SenderSpotifyId)
                    .Get();

                result.Add(new
                {
                    req.Id,
                    SenderSpotifyId = req.SenderSpotifyId,
                    SenderDisplayName = user.Models.FirstOrDefault()?.DisplayName ?? req.SenderSpotifyId,
                    req.CreatedAt
                });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] GetIncomingRequests failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }

    // -------------------------
    // Accept Friend Request
    // -------------------------
    [HttpPost("accept")]
    public async Task<IActionResult> AcceptRequest([FromQuery] string requestId)
    {
        if (string.IsNullOrWhiteSpace(requestId))
            return BadRequest("RequestId is required.");

        var request = await _supabase.Client
            .From<FriendRequestRow>()
            .Where(r => r.Id == requestId)
            .Single();

        if (request == null) return NotFound("Friend request not found.");

        try
        {
            await _supabase.Client
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

            await _supabase.Client
                .From<FriendRequestRow>()
                .Where(r => r.Id == requestId)
                .Delete();

            return Ok("Friend request accepted.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] AcceptRequest failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }

    // -------------------------
    // Reject Friend Request
    // -------------------------
    [HttpPost("reject")]
    public async Task<IActionResult> RejectRequest([FromQuery] string requestId)
    {
        if (string.IsNullOrWhiteSpace(requestId))
            return BadRequest("RequestId is required.");

        try
        {
            await _supabase.Client
                .From<FriendRequestRow>()
                .Where(r => r.Id == requestId)
                .Delete();

            return Ok("Friend request rejected.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] RejectRequest failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }

    // -------------------------
    // Get Friend List
    // -------------------------
    [HttpGet]
    public async Task<IActionResult> GetFriends([FromQuery] string spotifyUserId)
    {
        if (string.IsNullOrWhiteSpace(spotifyUserId))
            return BadRequest("SpotifyUserId is required.");

        try
        {
            var friendsResult = await _supabase.Client
                .From<FriendRow>()
                .Where(f => f.UserSpotifyId == spotifyUserId)
                .Get();

            var friendSpotifyIds = friendsResult.Models.Select(f => f.FriendSpotifyId).ToList();

            var friendsWithNames = new List<object>();
            foreach (var id in friendSpotifyIds)
            {
                var userResult = await _supabase.Client
                    .From<UserRow>()
                    .Where(u => u.SpotifyUserId == id)
                    .Get();

                friendsWithNames.Add(new
                {
                    SpotifyId = id,
                    DisplayName = userResult.Models.FirstOrDefault()?.DisplayName ?? id
                });
            }

            return Ok(friendsWithNames);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] GetFriends failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }

    // -------------------------
    // Search Users by Display Name
    // -------------------------
    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string displayName)
    {
        if (string.IsNullOrWhiteSpace(displayName))
            return BadRequest("Display name is required.");

        try
        {
            var result = await _supabase.Client
                .From<UserRow>()
                .Where(u => u.DisplayName == displayName)
                .Get();

            var users = result.Models.Select(u => new
            {
                u.Id,
                u.SpotifyUserId,
                u.DisplayName
            });

            return Ok(users);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] SearchUsers failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }

    // -------------------------
    // Get User by Spotify ID
    // -------------------------
    [HttpGet("user")]
    public async Task<IActionResult> GetUserById([FromQuery] string spotifyUserId)
    {
        if (string.IsNullOrWhiteSpace(spotifyUserId))
            return BadRequest("SpotifyUserId is required.");

        try
        {
            var result = await _supabase.Client
                .From<UserRow>()
                .Where(u => u.SpotifyUserId == spotifyUserId)
                .Get();

            var user = result.Models.FirstOrDefault();
            if (user == null) return NotFound();

            return Ok(new { user.DisplayName, user.SpotifyUserId });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] GetUserById failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }

    // -------------------------
    // Remove Friend
    // -------------------------
    [HttpDelete("remove")]
    public async Task<IActionResult> RemoveFriend([FromQuery] string spotifyUserId, [FromQuery] string friendSpotifyId)
    {
        if (string.IsNullOrWhiteSpace(spotifyUserId) || string.IsNullOrWhiteSpace(friendSpotifyId))
            return BadRequest("Both SpotifyUserId and FriendSpotifyId are required.");

        try
        {
            // Delete friendship in both directions
            await _supabase.Client
                .From<FriendRow>()
                .Where(f => f.UserSpotifyId == spotifyUserId && f.FriendSpotifyId == friendSpotifyId)
                .Delete();

            await _supabase.Client
                .From<FriendRow>()
                .Where(f => f.UserSpotifyId == friendSpotifyId && f.FriendSpotifyId == spotifyUserId)
                .Delete();

            return Ok("Friend removed.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] RemoveFriend failed: {ex}");
            return StatusCode(500, ex.Message);
        }
    }
}
