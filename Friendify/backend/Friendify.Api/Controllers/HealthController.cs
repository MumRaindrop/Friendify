using System.Runtime.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace Friendify.Api.Controllers; // First controller made, for testing and learning making an endpoint

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow
        });
    }
}