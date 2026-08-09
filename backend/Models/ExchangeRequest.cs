using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public enum ExchangeStatus
    {
        Pending,
        Accepted,
        Rejected,
        Cancelled,
        Completed
    }

    public class ExchangeRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SenderId { get; set; }

        [ForeignKey("SenderId")]
        public User? Sender { get; set; }

        [Required]
        public int ReceiverId { get; set; }

        [ForeignKey("ReceiverId")]
        public User? Receiver { get; set; }

        public int? OfferedBookId { get; set; }

        [ForeignKey("OfferedBookId")]
        public Book? OfferedBook { get; set; }

        [Required]
        public int RequestedBookId { get; set; }

        [ForeignKey("RequestedBookId")]
        public Book? RequestedBook { get; set; }

        public ExchangeStatus Status { get; set; } = ExchangeStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
