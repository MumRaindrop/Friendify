using Supabase;
using Microsoft.Extensions.Configuration;

namespace Friendify.Api.Services; // Supabase service using secret and database url

public class SupabaseService
{
    public Client Client { get; }

    public SupabaseService(IConfiguration config)
    {
        var url = config["Supabase:Url"];
        var key = config["Supabase:ServiceRoleKey"];

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
