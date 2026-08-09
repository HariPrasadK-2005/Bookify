# Stage 1: Build stage using Microsoft .NET 8 SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["backend.csproj", "./"]
RUN dotnet restore "backend.csproj"

# Copy source code and publish in Release mode
COPY . .
RUN dotnet publish "backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Final runtime image using Microsoft ASP.NET Core 8 Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy published binaries from build stage
COPY --from=build /app/publish .

# Set default fallback PORT (Render / Cloud hosting will override PORT)
ENV PORT=8080
EXPOSE 8080

# Run the ASP.NET Core Web API
ENTRYPOINT ["dotnet", "backend.dll"]
