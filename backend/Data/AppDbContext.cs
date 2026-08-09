using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<WantedBook> WantedBooks { get; set; }
        public DbSet<ExchangeRequest> ExchangeRequests { get; set; }
        public DbSet<UserRating> UserRatings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Book>()
                .HasIndex(b => b.Title);
            modelBuilder.Entity<Book>()
                .HasIndex(b => b.Subject);
            modelBuilder.Entity<Book>()
                .HasIndex(b => b.OwnerId);

            modelBuilder.Entity<WantedBook>()
                .HasIndex(w => w.Title);
            modelBuilder.Entity<WantedBook>()
                .HasIndex(w => w.UserId);

            // Configure ExchangeRequest relationships to avoid cascade delete cycles
            modelBuilder.Entity<ExchangeRequest>()
                .HasOne(e => e.Sender)
                .WithMany()
                .HasForeignKey(e => e.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ExchangeRequest>()
                .HasOne(e => e.Receiver)
                .WithMany()
                .HasForeignKey(e => e.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ExchangeRequest>()
                .HasOne(e => e.OfferedBook)
                .WithMany()
                .HasForeignKey(e => e.OfferedBookId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ExchangeRequest>()
                .HasOne(e => e.RequestedBook)
                .WithMany()
                .HasForeignKey(e => e.RequestedBookId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
