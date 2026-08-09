namespace backend.DTOs
{
    public class RegisterDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string College { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int Year { get; set; }
        public string? PhoneNumber { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string College { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int Year { get; set; }
        public string? PhoneNumber { get; set; }
        public double AverageRating { get; set; } = 5.0;
        public int RatingCount { get; set; } = 0;
    }
}
