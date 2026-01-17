using Supabase;
using System;
using System.Text.Json.Serialization;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Friendify.Api.Models; // Model of row from friend request table in Supabase

[Table("friend_requests")]
public class FriendRequestRow : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; }

    [Column("sender_spotify_id")]
    public string SenderSpotifyId { get; set; } = string.Empty;

    [Column("receiver_spotify_id")]
    public string ReceiverSpotifyId { get; set; } = string.Empty;

    [Column("status")]
    public string Status { get; set; } = "pending";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
