# Setup script for Swappers2 JavaScript project (Windows)

Write-Host "=== Swappers2 JavaScript Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check npm installation
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Copy environment file if it doesn't exist
if (-not (Test-Path .env)) {
    if (Test-Path .env.example) {
        Write-Host ""
        Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
        Copy-Item .env.example .env
        Write-Host "✅ .env file created. Please edit it with your credentials." -ForegroundColor Green
    }
}

# Check for config files
Write-Host ""
Write-Host "📋 Checking configuration files..." -ForegroundColor Yellow

if (-not (Test-Path account_config.ini)) {
    Write-Host "⚠️  account_config.ini not found. Please create it in the project root." -ForegroundColor Yellow
}

if (-not (Test-Path config.ini)) {
    Write-Host "⚠️  config.ini not found. Please create it in the project root." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Edit .env with your Helius API key and private key"
Write-Host "2. Configure account_config.ini with your trading accounts"
Write-Host "3. Configure config.ini with your trading parameters"
Write-Host "4. Run 'npm start' to begin trading"
Write-Host ""
