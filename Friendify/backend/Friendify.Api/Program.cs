using System.Security.Authentication.ExtendedProtection;
using Friendify.Api.Services;

var builder = WebApplication.CreateBuilder(args); // Program file to make everything work with the HTTP and HTTPS

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(FileOptions =>
{
    FileOptions.AddPolicy("Frontend",
        policy => policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithOrigins("http://localhost:5173"));
});

builder.Services.AddSingleton<SupabaseService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("Frontend");

app.UseAuthorization();

app.MapControllers();

app.Run();

var controllerTypes = typeof(Program).Assembly
    .GetTypes()
    .Where(t => t.IsSubclassOf(typeof(Microsoft.AspNetCore.Mvc.ControllerBase)));

foreach (var c in controllerTypes) // Log to test read controllers
{
    Console.WriteLine("Loaded controller: " + c.FullName);
}

