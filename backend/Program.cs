using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configure binding port for Render / production hosting
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Configure DbContext with PostgreSQL (Neon or local)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.
builder.Services.AddScoped<backend.Services.MatchingService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure JWT Authentication (overridden by JWT_SECRET env var if set)
var jwtSecret = builder.Configuration["JWT_SECRET"] 
    ?? builder.Configuration["Jwt:Key"] 
    ?? "this_is_a_very_secret_key_that_should_be_replaced_in_production_environments_12345!";

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "BookExchangeApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "BookExchangeClients";

var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Configure CORS for production & local development
var allowedOrigins = new List<string> { "http://localhost:5173", "http://localhost:3000" };
var frontendUrl = builder.Configuration["FRONTEND_URL"];
if (!string.IsNullOrEmpty(frontendUrl))
{
    allowedOrigins.Add(frontendUrl.TrimEnd('/'));
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(allowedOrigins.ToArray())
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Ensure Database is created and updated
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();
    
    // Auto-migrate schema updates for MVP
    try
    {
        dbContext.Database.ExecuteSqlRaw(@"ALTER TABLE ""Books"" ADD COLUMN IF NOT EXISTS ""ImageUrl"" text;");
        dbContext.Database.ExecuteSqlRaw(@"ALTER TABLE ""Books"" ADD COLUMN IF NOT EXISTS ""Value"" numeric(18,2) DEFAULT 0;");
        dbContext.Database.ExecuteSqlRaw(@"ALTER TABLE ""ExchangeRequests"" ALTER COLUMN ""OfferedBookId"" DROP NOT NULL;");
        dbContext.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""PhoneNumber"" text;");
        dbContext.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""RatingCount"" integer DEFAULT 0;");
        dbContext.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""RatingSum"" integer DEFAULT 0;");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration note: {ex.Message}");
    }
}

// Enable Swagger UI in both dev and production for easy API inspection
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
