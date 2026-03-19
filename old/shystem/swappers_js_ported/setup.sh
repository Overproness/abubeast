#!/bin/bash

# Setup script for Swappers2 JavaScript project

echo "=== Swappers2 JavaScript Setup ==="
echo

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check npm installation
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo
        echo "📝 Creating .env file from .env.example..."
        cp .env.example .env
        echo "✅ .env file created. Please edit it with your credentials."
    fi
fi

# Check for config files
echo
echo "📋 Checking configuration files..."

if [ ! -f account_config.ini ]; then
    echo "⚠️  account_config.ini not found. Please create it in the project root."
fi

if [ ! -f config.ini ]; then
    echo "⚠️  config.ini not found. Please create it in the project root."
fi

echo
echo "=== Setup Complete ==="
echo
echo "Next steps:"
echo "1. Edit .env with your Helius API key and private key"
echo "2. Configure account_config.ini with your trading accounts"
echo "3. Configure config.ini with your trading parameters"
echo "4. Run 'npm start' to begin trading"
echo
