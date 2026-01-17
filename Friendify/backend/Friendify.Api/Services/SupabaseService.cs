using Supabase;
using Microsoft.Extensions.Configuration;

namespace Friendify.Api.Services;

public class SupabaseService
{
    public Client Client { get; }

    public SupabaseService(IConfiguration config)
    {
        // Try to read from configuration first, fallback to environment variables
        var url = config["Supabase:Url"] ?? Environment.GetEnvironmentVariable("SUPABASE_URL");
        var key = config["Supabase:ServiceRoleKey"] ?? Environment.GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY");

        if (string.IsNullOrWhiteSpace(url) || string.IsNullOrWhiteSpace(key))
        {
            throw new Exception("Supabase URL or Service Role Key is missing. Make sure they are set in Render as SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
        }

        Client = new Client(url, key, new SupabaseOptions
        {
            AutoConnectRealtime = false
        });
    }

    public async Task InitializeAsync()
    {
        await Client.InitializeAsync();
    }
}
