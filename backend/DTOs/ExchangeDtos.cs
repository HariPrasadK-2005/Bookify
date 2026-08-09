namespace backend.DTOs
{
    public class MatchResponseDto
    {
        public int MatchedUserId { get; set; }
        public string MatchedUserName { get; set; } = string.Empty;
        public string MatchedUserCollege { get; set; } = string.Empty;
        
        public int IWillGiveBookId { get; set; }
        public string IWillGiveBookTitle { get; set; } = string.Empty;

        public int IWillReceiveBookId { get; set; }
        public string IWillReceiveBookTitle { get; set; } = string.Empty;
    }
    
    public class ExchangeRequestCreateDto
    {
        public int ReceiverId { get; set; }
        public int? OfferedBookId { get; set; }
        public int RequestedBookId { get; set; }
    }

    public class ExchangeRequestResponseDto
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;
        public string? SenderPhone { get; set; }
        public double SenderAverageRating { get; set; } = 5.0;
        public int SenderRatingCount { get; set; } = 0;
        public int ReceiverId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverEmail { get; set; } = string.Empty;
        public string? ReceiverPhone { get; set; }
        public double ReceiverAverageRating { get; set; } = 5.0;
        public int ReceiverRatingCount { get; set; } = 0;
        public int? OfferedBookId { get; set; }
        public string OfferedBookTitle { get; set; } = string.Empty;
        public int RequestedBookId { get; set; }
        public string RequestedBookTitle { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
