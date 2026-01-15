using Supabase;
using System;
using System.Text.Json.Serialization;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Friendify.Api.Models;

[Table("friends")]
public class FriendRow : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; }

    [Column("user_spotify_id")]
    public string UserSpotifyId { get; set; } = string.Empty;

    [Column("friend_spotify_id")]
    public string FriendSpotifyId { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
