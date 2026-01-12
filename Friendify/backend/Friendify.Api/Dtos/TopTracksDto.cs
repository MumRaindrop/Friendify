namespace Friendify.Api.Dtos;

public class TopTrackDto
{
    public int Rank { get; set; }
    public string TrackName { get; set; } = string.Empty;
    public string ArtistName { get; set; } = string.Empty;
    public string AlbumName { get; set; } = string.Empty;
    public string AlbumImageUrl { get; set; } = string.Empty;
    public string? PreviewUrl { get; set; }
    public int Popularity { get; set; }
}
