using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MatchesController : ControllerBase
    {
        private readonly MatchingService _matchingService;

        public MatchesController(MatchingService matchingService)
        {
            _matchingService = matchingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMatches()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var matches = await _matchingService.FindMatchesForUser(userId);
            return Ok(matches);
        }
    }
}
