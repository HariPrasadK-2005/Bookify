using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace backend.Services
{
    public class MatchingService
    {
        private readonly AppDbContext _context;

        public MatchingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MatchResponseDto>> FindMatchesForUser(int userId)
        {
            var myBooks = await _context.Books
                .Where(b => b.OwnerId == userId && b.Status == BookStatus.Available)
                .ToListAsync();

            var myWantedBooks = await _context.WantedBooks
                .Where(w => w.UserId == userId && w.Status == WantedBookStatus.Active)
                .ToListAsync();

            var matches = new List<MatchResponseDto>();

            // Find users who have what I want AND want what I have
            // To do this efficiently in memory (for MVP):
            var allOtherAvailableBooks = await _context.Books
                .Include(b => b.Owner)
                .Where(b => b.OwnerId != userId && b.Status == BookStatus.Available)
                .ToListAsync();

            var allOtherWantedBooks = await _context.WantedBooks
                .Where(w => w.UserId != userId && w.Status == WantedBookStatus.Active)
                .ToListAsync();

            foreach (var myWant in myWantedBooks)
            {
                // Who has what I want?
                var potentialProviders = allOtherAvailableBooks
                    .Where(b => IsMatch(b.Title, myWant.Title) || (b.Subject == myWant.Subject && b.Department == myWant.Department))
                    .ToList();

                foreach (var providerBook in potentialProviders)
                {
                    int providerId = providerBook.OwnerId;

                    // Does this provider want anything I have?
                    var providerWants = allOtherWantedBooks.Where(w => w.UserId == providerId).ToList();

                    foreach (var providerWant in providerWants)
                    {
                        var myMatchingBook = myBooks.FirstOrDefault(b => 
                            IsMatch(b.Title, providerWant.Title) || 
                            (b.Subject == providerWant.Subject && b.Department == providerWant.Department));

                        if (myMatchingBook != null)
                        {
                            // We found a 2-way match!
                            matches.Add(new MatchResponseDto
                            {
                                MatchedUserId = providerId,
                                MatchedUserName = providerBook.Owner!.FullName,
                                MatchedUserCollege = providerBook.Owner.College,
                                IWillGiveBookId = myMatchingBook.Id,
                                IWillGiveBookTitle = myMatchingBook.Title,
                                IWillReceiveBookId = providerBook.Id,
                                IWillReceiveBookTitle = providerBook.Title
                            });
                        }
                    }
                }
            }

            // Deduplicate matches based on (IWillGiveBookId, IWillReceiveBookId)
            return matches
                .GroupBy(m => new { m.IWillGiveBookId, m.IWillReceiveBookId })
                .Select(g => g.First())
                .ToList();
        }

        private bool IsMatch(string title1, string title2)
        {
            if (string.IsNullOrEmpty(title1) || string.IsNullOrEmpty(title2)) return false;
            
            var t1 = NormalizeTitle(title1);
            var t2 = NormalizeTitle(title2);

            return t1.Contains(t2) || t2.Contains(t1);
        }

        private string NormalizeTitle(string title)
        {
            var lower = title.ToLower().Trim();
            // Remove punctuation
            return Regex.Replace(lower, @"[^\w\s]", "");
        }
    }
}
