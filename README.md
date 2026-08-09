# BookExchange

BookExchange is an exchange-only textbook platform for college students. Instead of buying and selling textbooks, students can trade the books they have for the books they need, leveraging a two-way matching algorithm.

## Features
- **User Authentication**: Secure registration and login using JWT.
- **My Books**: List textbooks you own and are willing to exchange.
- **Books I Need**: Create a wishlist of textbooks you need for your courses.
- **Two-way Matchmaking**: The system automatically finds potential matches where you and another student can fulfill each other's textbook needs.
- **Exchange Requests**: Send, accept, and reject exchange requests securely.
- **Dashboard**: Track your books, needs, matches, and pending requests in one place.

## Architecture & Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Tooling**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Framework**: ASP.NET Core 8.0 Web API
- **Language**: C#
- **ORM**: Entity Framework Core
- **Database**: PostgreSQL
- **Security**: JWT Authentication & BCrypt Password Hashing

### Infrastructure
- **Containerization**: Docker & Docker Compose

## Folder Structure
```
BookExchange/
├── frontend/             # React application (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context (Auth)
│   │   ├── pages/        # Route pages
│   │   └── services/     # API clients
├── backend/              # ASP.NET Core Web API
│   ├── Controllers/      # API Endpoints
│   ├── Data/             # EF Core DbContext
│   ├── DTOs/             # Data Transfer Objects
│   ├── Models/           # Database Entities
│   └── Services/         # Business Logic (MatchingService)
└── README.md
```

## API Documentation

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current authenticated user
- `GET /api/books` - Get books owned by current user
- `POST /api/books` - Add a new book to inventory
- `GET /api/books/search` - Search available books globally
- `GET /api/wanted-books` - Get wishlist books for current user
- `POST /api/wanted-books` - Add a book to wishlist
- `GET /api/matches` - Find potential 2-way exchanges
- `POST /api/exchanges` - Send an exchange request
- `PUT /api/exchanges/{id}/accept` - Accept request
- `PUT /api/exchanges/{id}/reject` - Reject request

## Local Setup (Native)

This project requires running the components directly on your machine.

### Prerequisites
- Node.js v20+
- .NET 8.0 SDK
- PostgreSQL 15+ (Running locally on port 5432)

### Backend
1. Navigate to the `backend` folder.
2. Update `appsettings.json` with your local PostgreSQL connection string.
3. Run the API:
   ```bash
   dotnet run
   ```

### Frontend
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Test Credentials (Sample Data)
You can register new users to test the platform. To test the matching algorithm:
1. Register **Alice** (alice@edu.com). Add "Database System Concepts" to her inventory and "Operating System Concepts" to her wishlist.
2. Register **Bob** (bob@edu.com). Add "Operating System Concepts" to his inventory and "Database System Concepts" to his wishlist.
3. Check the "Matches" page on either account to see the two-way match!

## Azure Deployment Instructions
1. **Database**: Provision an Azure Database for PostgreSQL flexible server. Update connection strings in Azure App Service configurations.
2. **Backend**: Deploy the ASP.NET Core Docker image to Azure App Service (Web App for Containers) or Azure Container Apps.
3. **Frontend**: Build the Vite React app (`npm run build`) and deploy the static files to Azure Static Web Apps. Ensure `VITE_API_URL` is set to your backend URL during the build.
