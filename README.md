# DataSheet AI — Setup Guide

## Prerequisites
- Node.js 18+
- Python 3.10+ with: `pip install pandas openpyxl matplotlib`
- **MongoDB** running locally

## Start MongoDB

**Mac (Homebrew):**
```bash
brew services start mongodb-community
```

**Windows:**
```powershell
# Option 1 — as a service (if installed via installer)
net start MongoDB

# Option 2 — manual
mkdir C:\data\db
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
```

**Linux:**
```bash
sudo systemctl start mongod
```

## Backend Setup

```bash
cd backend
npm install
# Copy .env.example → .env (already done, edit if needed)
cp .env.example .env
npm run dev    # starts on port 4000
```

### Backend .env
```
MONGODB_URI=mongodb://127.0.0.1:27017/datasheet_ai
JWT_SECRET=change-this-in-production
PYTHON_CMD=python3        # Windows: use "python"
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev    # starts on port 5173
```

Open: http://localhost:5173

## What's Stored in MongoDB

| Collection | What's stored |
|------------|---------------|
| `users`    | name, email, bcrypt password hash, plan |
| `reports`  | all report metadata, columns, chart summary |

Reports are **permanently linked to your user account**. Log out and log back in — your reports are there.

Guest users get temporary in-memory storage (cleared on server restart).

## Windows Python Note
In `backend/.env` set:
```
PYTHON_CMD=python
```

Reports are **permanently linked to your user account**. Log out and log back in — your reports are there.

Guest users get temporary in-memory storage (cleared on server restart).

