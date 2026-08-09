using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/wanted-books")]
    [ApiController]
    [Authorize]
    public class WantedBooksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WantedBooksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyWantedBooks()
        {
            var userId = GetCurrentUserId();
            var wantedBooks = await _context.WantedBooks
                .Where(w => w.UserId == userId && w.Status != WantedBookStatus.Cancelled)
                .ToListAsync();

            return Ok(wantedBooks);
        }

        [HttpPost]
        public async Task<IActionResult> AddWantedBook([FromBody] WantedBookCreateDto dto)
        {
            var userId = GetCurrentUserId();

            var wantedBook = new WantedBook
            {
                Title = dto.Title,
                Author = dto.Author,
                Subject = dto.Subject,
                Department = dto.Department,
                Semester = dto.Semester,
                Description = dto.Description,
                UserId = userId
            };

            _context.WantedBooks.Add(wantedBook);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMyWantedBooks), new { id = wantedBook.Id }, wantedBook);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWantedBook(int id)
        {
            var userId = GetCurrentUserId();
            var wantedBook = await _context.WantedBooks.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (wantedBook == null) return NotFound();

            wantedBook.Status = WantedBookStatus.Cancelled;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Wanted book removed." });
        }
        
        [HttpPut("{id}/fulfill")]
        public async Task<IActionResult> FulfillWantedBook(int id)
        {
            var userId = GetCurrentUserId();
            var wantedBook = await _context.WantedBooks.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (wantedBook == null) return NotFound();

            wantedBook.Status = WantedBookStatus.Fulfilled;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Wanted book marked as fulfilled." });
        }

        private int GetCurrentUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(userIdStr!);
        }
    }
}
