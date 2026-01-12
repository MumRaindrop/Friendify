using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Friendify.Api.Dtos
{
    public class SpotifyTopTracksDto
    {
        [JsonPropertyName("items")]
        public List<Item> Items { get; set; }

        public class Item
        {
            [JsonPropertyName("id")]
            public string Id { get; set; }

            [JsonPropertyName("name")]
            public string Name { get; set; }

            [JsonPropertyName("popularity")]
            public int Popularity { get; set; }

            [JsonPropertyName("preview_url")]
            public string PreviewUrl { get; set; }

            [JsonPropertyName("album")]
            public Album Album { get; set; }

            [JsonPropertyName("artists")]
            public List<Artist> Artists { get; set; }
        }

        public class Album
        {
            [JsonPropertyName("name")]
            public string Name { get; set; }

            [JsonPropertyName("images")]
            public List<Image> Images { get; set; }
        }

        public class Artist
        {
            [JsonPropertyName("name")]
            public string Name { get; set; }
        }

        public class Image
        {
            [JsonPropertyName("url")]
            public string Url { get; set; }
        }
    }
}
