using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class UserRating
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int RaterId { get; set; }

        [ForeignKey("RaterId")]
        public User? Rater { get; set; }

        [Required]
        public int RatedUserId { get; set; }

        [ForeignKey("RatedUserId")]
        public User? RatedUser { get; set; }

        [Required]
        [Range(1, 5)]
        public int Score { get; set; }

        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
