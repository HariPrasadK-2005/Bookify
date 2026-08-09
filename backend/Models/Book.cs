using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public enum BookStatus
    {
        Available,
        ExchangePending,
        Exchanged,
        Removed
    }

    public class Book
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Author { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Department { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Semester { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Condition { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public int OwnerId { get; set; }

        [ForeignKey("OwnerId")]
        [JsonIgnore]
        public User? Owner { get; set; }

        public string? ImageUrl { get; set; }

        public decimal Value { get; set; } = 0;

        public BookStatus Status { get; set; } = BookStatus.Available;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
