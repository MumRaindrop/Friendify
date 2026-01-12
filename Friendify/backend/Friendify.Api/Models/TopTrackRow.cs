using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Friendify.Api.Models;

[Table("top_tracks")]
public class TopTrackRow : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("spotify_user_id")]
    public string SpotifyUserId { get; set; }

    [Column("spotify_track_id")]
    public string SpotifyTrackId { get; set; }

    [Column("track_name")]
    public string TrackName { get; set; }

    [Column("artist_name")]
    public string ArtistName { get; set; }

    [Column("album_name")]
    public string AlbumName { get; set; }

    [Column("album_image_url")]
    public string AlbumImageUrl { get; set; }

    [Column("preview_url")]
    public string? PreviewUrl { get; set; }

    [Column("popularity")]
    public int Popularity { get; set; }

    [Column("rank")]
    public int Rank { get; set; }

    [Column("time_range")]
    public string TimeRange { get; set; }
}
