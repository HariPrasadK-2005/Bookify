using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Security.Claims;

namespace backend.Controllers
{
    public class RatingCreateDto
    {
        public int RatedUserId { get; set; }
        public int Score { get; set; } // 1 - 5
        public string Comment { get; set; } = string.Empty;
    }

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RatingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RatingsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(userIdClaim!.Value);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRating([FromBody] RatingCreateDto dto)
        {
            var raterId = GetCurrentUserId();

            if (raterId == dto.RatedUserId)
            {
                return BadRequest(new { message = "You cannot rate yourself." });
            }

            if (dto.Score < 1 || dto.Score > 5)
            {
                return BadRequest(new { message = "Score must be between 1 and 5." });
            }

            var ratedUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.RatedUserId);
            if (ratedUser == null)
            {
                return NotFound(new { message = "User to rate not found." });
            }

            var rating = new UserRating
            {
                RaterId = raterId,
                RatedUserId = dto.RatedUserId,
                Score = dto.Score,
                Comment = dto.Comment
            };

            _context.UserRatings.Add(rating);

            // Update user rating summary
            ratedUser.RatingCount += 1;
            ratedUser.RatingSum += dto.Score;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Rating submitted successfully!", averageRating = ratedUser.AverageRating, totalRatings = ratedUser.RatingCount });
        }

        [HttpGet("user/{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserRatings(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound();

            var ratings = await _context.UserRatings
                .Include(r => r.Rater)
                .Where(r => r.RatedUserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.RaterId,
                    RaterName = r.Rater!.FullName,
                    r.Score,
                    r.Comment,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                userId = user.Id,
                userName = user.FullName,
                averageRating = user.AverageRating,
                ratingCount = user.RatingCount,
                reviews = ratings
            });
        }
    }
}
