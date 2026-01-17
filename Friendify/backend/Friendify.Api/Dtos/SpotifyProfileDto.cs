using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Friendify.Api.Dtos // Dto for getting a spotify profile
{
    public class SpotifyProfileDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("display_name")]
        public string DisplayName { get; set; }

        [JsonPropertyName("images")]
        public List<ImageDto> Images { get; set; }

        public class ImageDto
        {
            [JsonPropertyName("url")]
            public string Url { get; set; }
        }
    }
}
