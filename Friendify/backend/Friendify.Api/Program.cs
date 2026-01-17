using Friendify.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// -------------------------
// Services
// -------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// -------------------------
// CORS - allow frontend
// -------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "https://friendify-frontend-h3qi.onrender.com",
                "http://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// -------------------------
// Supabase Service
// -------------------------
builder.Services.AddSingleton<SupabaseService>();

var app = builder.Build();

// -------------------------
// Middleware
// -------------------------
app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthorization();
app.MapControllers();

// -------------------------
// Bind to Render port
// -------------------------
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Urls.Add($"http://*:{port}");

// -------------------------
// Log loaded controllers
// -------------------------
var controllerTypes = typeof(Program).Assembly
    .GetTypes()
    .Where(t => t.IsSubclassOf(typeof(Microsoft.AspNetCore.Mvc.ControllerBase)));

foreach (var c in controllerTypes)
{
    Console.WriteLine("Loaded controller: " + c.FullName);
}

app.Run();
