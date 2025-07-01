#!/usr/bin/env python3

"""
AbuBeast Python Dependencies Installer
This script installs the required Python packages for the MongoDB viewer.
"""

import subprocess
import sys
import os

def install_packages():
    """Install required Python packages"""
    
    # Check if pip is available
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "--version"])
    except subprocess.CalledProcessError:
        print("❌ pip is not available. Please install Python and pip first.")
        return False
    
    print("🔍 Installing Python dependencies for AbuBeast MongoDB Viewer...")
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    requirements_file = os.path.join(script_dir, "..", "requirements.txt")
    
    try:
        # Install packages from requirements.txt
        result = subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", requirements_file
        ])
        
        print("✅ Successfully installed Python dependencies!")
        print("\nYou can now run the MongoDB viewer with:")
        print("  npm run check")
        print("  or")
        print("  python scripts/check.py")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        print("\nYou can try installing manually:")
        print("  pip install pymongo python-dotenv pyperclip")
        return False
    except FileNotFoundError:
        print(f"❌ requirements.txt not found at: {requirements_file}")
        print("\nYou can install manually:")
        print("  pip install pymongo python-dotenv pyperclip")
        return False

if __name__ == "__main__":
    print("🐍 AbuBeast Python Setup")
    print("=" * 50)
    install_packages()
