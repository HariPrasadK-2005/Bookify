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
    public class ExchangesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExchangesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateExchangeRequest([FromBody] ExchangeRequestCreateDto dto)
        {
            var senderId = GetCurrentUserId();

            // Validate requested book exists and is available
            Book? offeredBook = null;
            if (dto.OfferedBookId.HasValue)
            {
                offeredBook = await _context.Books.FirstOrDefaultAsync(b => b.Id == dto.OfferedBookId.Value && b.OwnerId == senderId);
                if (offeredBook == null || offeredBook.Status != BookStatus.Available)
                {
                    return BadRequest(new { message = "The offered book is not available or does not exist." });
                }
            }

            var requestedBook = await _context.Books.FirstOrDefaultAsync(b => b.Id == dto.RequestedBookId && b.OwnerId == dto.ReceiverId);

            if (requestedBook == null || requestedBook.Status != BookStatus.Available)
            {
                return BadRequest(new { message = "The requested book is currently not available for lending." });
            }

            // Check if pending request already exists
            bool exists = await _context.ExchangeRequests.AnyAsync(e => 
                e.SenderId == senderId && e.ReceiverId == dto.ReceiverId &&
                e.RequestedBookId == dto.RequestedBookId &&
                e.Status == ExchangeStatus.Pending);

            if (exists)
            {
                return BadRequest(new { message = "A request already exists for this book." });
            }

            var request = new ExchangeRequest
            {
                SenderId = senderId,
                ReceiverId = dto.ReceiverId,
                OfferedBookId = dto.OfferedBookId,
                RequestedBookId = dto.RequestedBookId
            };

            _context.ExchangeRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Borrowing request sent successfully to lender!" });
        }

        [HttpGet("incoming")]
        public async Task<IActionResult> GetIncomingRequests()
        {
            var userId = GetCurrentUserId();
            var requests = await _context.ExchangeRequests
                .Include(e => e.Sender)
                .Include(e => e.OfferedBook)
                .Include(e => e.RequestedBook)
                .Where(e => e.ReceiverId == userId)
                .Select(e => new ExchangeRequestResponseDto
                {
                    Id = e.Id,
                    SenderId = e.SenderId,
                    SenderName = e.Sender!.FullName,
                    SenderEmail = e.Sender!.Email,
                    SenderPhone = e.Sender!.PhoneNumber,
                    ReceiverId = e.ReceiverId,
                    ReceiverName = "Me",
                    ReceiverEmail = e.Receiver!.Email,
                    ReceiverPhone = e.Receiver!.PhoneNumber,
                    OfferedBookId = e.OfferedBookId,
                    OfferedBookTitle = e.OfferedBook != null ? e.OfferedBook.Title : "Free Lending Request (No swap offered)",
                    RequestedBookId = e.RequestedBookId,
                    RequestedBookTitle = e.RequestedBook!.Title,
                    Status = e.Status.ToString(),
                    CreatedAt = e.CreatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpGet("outgoing")]
        public async Task<IActionResult> GetOutgoingRequests()
        {
            var userId = GetCurrentUserId();
            var requests = await _context.ExchangeRequests
                .Include(e => e.Receiver)
                .Include(e => e.OfferedBook)
                .Include(e => e.RequestedBook)
                .Where(e => e.SenderId == userId)
                .Select(e => new ExchangeRequestResponseDto
                {
                    Id = e.Id,
                    SenderId = e.SenderId,
                    SenderName = "Me",
                    SenderEmail = e.Sender!.Email,
                    SenderPhone = e.Sender!.PhoneNumber,
                    ReceiverId = e.ReceiverId,
                    ReceiverName = e.Receiver!.FullName,
                    ReceiverEmail = e.Receiver!.Email,
                    ReceiverPhone = e.Receiver!.PhoneNumber,
                    OfferedBookId = e.OfferedBookId,
                    OfferedBookTitle = e.OfferedBook != null ? e.OfferedBook.Title : "Free Lending Request (No swap offered)",
                    RequestedBookId = e.RequestedBookId,
                    RequestedBookTitle = e.RequestedBook!.Title,
                    Status = e.Status.ToString(),
                    CreatedAt = e.CreatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPut("{id}/accept")]
        public async Task<IActionResult> AcceptRequest(int id)
        {
            var userId = GetCurrentUserId();
            var request = await _context.ExchangeRequests
                .Include(e => e.OfferedBook)
                .Include(e => e.RequestedBook)
                .FirstOrDefaultAsync(e => e.Id == id && e.ReceiverId == userId);

            if (request == null) return NotFound();
            if (request.Status != ExchangeStatus.Pending) return BadRequest(new { message = "Request is not pending." });

            request.Status = ExchangeStatus.Accepted;
            request.UpdatedAt = DateTime.UtcNow;

            // Mark books as pending exchange so they can't be requested by others
            if (request.OfferedBook != null) request.OfferedBook.Status = BookStatus.ExchangePending;
            if (request.RequestedBook != null) request.RequestedBook.Status = BookStatus.ExchangePending;

            // Reject all other pending requests involving these books
            var otherRequests = await _context.ExchangeRequests
                .Where(e => e.Id != id && e.Status == ExchangeStatus.Pending &&
                            (e.OfferedBookId == request.OfferedBookId || e.RequestedBookId == request.RequestedBookId ||
                             e.OfferedBookId == request.RequestedBookId || e.RequestedBookId == request.OfferedBookId))
                .ToListAsync();

            foreach (var r in otherRequests)
            {
                r.Status = ExchangeStatus.Rejected;
                r.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Exchange request accepted." });
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectRequest(int id)
        {
            var userId = GetCurrentUserId();
            var request = await _context.ExchangeRequests.FirstOrDefaultAsync(e => e.Id == id && e.ReceiverId == userId);

            if (request == null) return NotFound();
            if (request.Status != ExchangeStatus.Pending) return BadRequest(new { message = "Request is not pending." });

            request.Status = ExchangeStatus.Rejected;
            request.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Exchange request rejected." });
        }

        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteRequest(int id)
        {
            var userId = GetCurrentUserId();
            var request = await _context.ExchangeRequests
                .Include(e => e.OfferedBook)
                .Include(e => e.RequestedBook)
                .FirstOrDefaultAsync(e => e.Id == id && (e.ReceiverId == userId || e.SenderId == userId));

            if (request == null) return NotFound();
            if (request.Status != ExchangeStatus.Accepted) return BadRequest(new { message = "Request must be accepted first." });

            request.Status = ExchangeStatus.Completed;
            request.UpdatedAt = DateTime.UtcNow;

            // Swap owners and mark as exchanged, or just mark as exchanged. Requirements say "Mark books as Exchanged"
            if (request.OfferedBook != null) request.OfferedBook.Status = BookStatus.Exchanged;
            if (request.RequestedBook != null) request.RequestedBook.Status = BookStatus.Exchanged;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Exchange completed successfully." });
        }

        private int GetCurrentUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(userIdStr!);
        }
    }
}
