# AbuBeast MongoDB Viewer

A graphical Python application to view and explore your AbuBeast MongoDB database.

## Features

- 🔍 Browse all collections in your database
- 📊 View document counts for each collection
- 📄 Inspect individual documents with a tree view
- 📋 Copy selected data or entire collections to clipboard
- 🖱️ User-friendly GUI with mouse wheel scrolling support

## Installation

### 1. Install Python Dependencies

**Option A: Using the installer script**

```bash
python scripts/install_python_deps.py
```

**Option B: Manual installation**

```bash
pip install -r requirements.txt
```

**Option C: Individual packages**

```bash
pip install pymongo python-dotenv pyperclip
```

### 2. Set up Environment Variables

Make sure your `.env.local` file contains:

```env
MONGODB_URI=your_mongodb_connection_string
```

## Usage

### Using npm script (recommended)

```bash
npm run check
```

### Direct Python execution

```bash
python scripts/check.py
```

## GUI Controls

- **Left Panel**: List of collections with document counts
- **Right Panel**: Tree view of documents in the selected collection
- **Copy Selected**: Copy the selected row to clipboard
- **Copy Full Collection**: Copy all documents from the current collection as JSON
- **Mouse Wheel**: Scroll through collections or documents

## Troubleshooting

### "MONGODB_URI environment variable not found"

Make sure your `.env.local` file exists and contains the MONGODB_URI variable.

### "No module named 'pymongo'"

Install the Python dependencies using one of the installation methods above.

### "tkinter not found" (Linux users)

Install tkinter:

```bash
# Ubuntu/Debian
sudo apt-get install python3-tk

# CentOS/RHEL
sudo yum install tkinter
```

### Connection Issues

- Verify your MongoDB URI is correct
- Check if your MongoDB server is running
- Ensure your IP is whitelisted (for cloud databases like MongoDB Atlas)

## Database Information

The viewer will automatically connect to your AbuBeast database and show:

- **users**: User accounts and authentication data
- **tokens**: Token information and market data
- **portfoliohistories**: Portfolio tracking data
- **tradingpermissions**: Trading permission settings

## Security Note

Sensitive data like passwords will be displayed as `[HIDDEN]` in the interface for security purposes.
