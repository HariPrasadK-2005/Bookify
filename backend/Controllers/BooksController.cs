using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BooksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyBooks()
        {
            var userId = GetCurrentUserId();
            var books = await _context.Books
                .Where(b => b.OwnerId == userId && b.Status != BookStatus.Removed)
                .ToListAsync();

            return Ok(books);
        }

        [HttpPost]
        public async Task<IActionResult> AddBook([FromBody] BookCreateDto dto)
        {
            var userId = GetCurrentUserId();

            var book = new Book
            {
                Title = dto.Title,
                Author = dto.Author,
                Subject = dto.Subject,
                Department = dto.Department,
                Semester = dto.Semester,
                Condition = dto.Condition,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                Value = dto.Value,
                OwnerId = userId
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBook(int id)
        {
            var book = await _context.Books
                .Include(b => b.Owner)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null) return NotFound();

            var response = new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                Subject = book.Subject,
                Department = book.Department,
                Semester = book.Semester,
                Condition = book.Condition,
                Description = book.Description,
                ImageUrl = book.ImageUrl,
                Value = book.Value,
                Status = book.Status,
                OwnerId = book.OwnerId,
                OwnerCollege = book.Owner!.College,
                OwnerName = book.Owner!.FullName,
                OwnerEmail = book.Owner!.Email,
                OwnerPhone = book.Owner!.PhoneNumber,
                OwnerAverageRating = book.Owner!.AverageRating,
                OwnerRatingCount = book.Owner!.RatingCount
            };

            return Ok(response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] BookCreateDto dto)
        {
            var userId = GetCurrentUserId();
            var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == id && b.OwnerId == userId);

            if (book == null) return NotFound();

            book.Title = dto.Title;
            book.Author = dto.Author;
            book.Subject = dto.Subject;
            book.Department = dto.Department;
            book.Semester = dto.Semester;
            book.Condition = dto.Condition;
            book.Description = dto.Description;
            book.ImageUrl = dto.ImageUrl;
            book.Value = dto.Value;

            await _context.SaveChangesAsync();

            return Ok(book);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var userId = GetCurrentUserId();
            var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == id && b.OwnerId == userId);

            if (book == null) return NotFound();

            book.Status = BookStatus.Removed;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Book deleted successfully." });
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchBooks([FromQuery] string? query, [FromQuery] string? subject, [FromQuery] string? department)
        {
            var booksQuery = _context.Books
                .Include(b => b.Owner)
                .Where(b => b.Status == BookStatus.Available);

            if (!string.IsNullOrEmpty(query))
            {
                booksQuery = booksQuery.Where(b => b.Title.ToLower().Contains(query.ToLower()) || b.Author.ToLower().Contains(query.ToLower()));
            }

            if (!string.IsNullOrEmpty(subject))
            {
                booksQuery = booksQuery.Where(b => b.Subject.ToLower().Contains(subject.ToLower()));
            }

            if (!string.IsNullOrEmpty(department))
            {
                booksQuery = booksQuery.Where(b => b.Department.ToLower() == department.ToLower());
            }

            var books = await booksQuery.Select(b => new BookResponseDto
            {
                Id = b.Id,
                Title = b.Title,
                Author = b.Author,
                Subject = b.Subject,
                Department = b.Department,
                Semester = b.Semester,
                Condition = b.Condition,
                Description = b.Description,
                ImageUrl = b.ImageUrl,
                Value = b.Value,
                Status = b.Status,
                OwnerId = b.OwnerId,
                OwnerCollege = b.Owner!.College,
                OwnerName = b.Owner!.FullName,
                OwnerEmail = b.Owner!.Email,
                OwnerPhone = b.Owner!.PhoneNumber,
                OwnerAverageRating = b.Owner!.AverageRating,
                OwnerRatingCount = b.Owner!.RatingCount
            }).ToListAsync();

            return Ok(books);
        }

        private int GetCurrentUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(userIdStr!);
        }
    }
}
