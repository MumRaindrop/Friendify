using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Friendify.Api.Models;

[Table("users")]
public class UserRow : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("spotify_user_id")]
    public string SpotifyUserId { get; set; }

    [Column("display_name")]
    public string? DisplayName { get; set; }

    [Column("profile_image_url")]
    public string? ProfileImageUrl { get; set; }

    [Column("last_login_at")]
    public DateTime LastLoginAt { get; set; }
}
