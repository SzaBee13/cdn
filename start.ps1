#!/usr/bin/env pwsh
# Startup script for PocketBase CDN

Write-Host "🚀 Starting PocketBase CDN..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Create directories if they don't exist
Write-Host "📁 Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "pb_data" | Out-Null
New-Item -ItemType Directory -Force -Path "pb_public" | Out-Null

# Start Docker Compose
Write-Host "🐳 Starting Docker containers..." -ForegroundColor Yellow
docker-compose up -d

# Wait for PocketBase to be ready
Write-Host "⏳ Waiting for PocketBase to start..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9111/api/health" -Method GET -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $ready = $true
        }
    } catch {
        Start-Sleep -Seconds 1
        $attempt++
    }
}

if ($ready) {
    Write-Host "✅ PocketBase is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Access points:" -ForegroundColor Cyan
    Write-Host "   Admin Panel: http://localhost:9111/_/" -ForegroundColor White
    Write-Host "   Flask App:   http://localhost:911" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Create admin account at http://localhost:9111/_/" -ForegroundColor White
    Write-Host "   2. Follow POCKETBASE_SETUP.md to configure collections" -ForegroundColor White
    Write-Host "   3. Copy files to pb_public or use Flask frontend" -ForegroundColor White
    Write-Host ""
    Write-Host "📜 View logs: docker-compose logs -f" -ForegroundColor Gray
    Write-Host "🛑 Stop:      docker-compose down" -ForegroundColor Gray
} else {
    Write-Host "❌ PocketBase failed to start. Check logs with: docker-compose logs pocketbase" -ForegroundColor Red
    exit 1
}
