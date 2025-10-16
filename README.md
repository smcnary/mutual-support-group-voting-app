# Mutual Support Group Voting App

A real-time voting application designed for mutual support groups to make collaborative decisions through anonymous voting.

## Features

- **Anonymous Voting**: Secure, anonymous voting system
- **Real-time Updates**: Live vote counting with Socket.io
- **Voting Periods**: Configurable voting durations (1 hour to 1 week)
- **Modern UI**: Clean, responsive interface
- **Group-focused**: Designed specifically for support group decision-making

## Tech Stack

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: React, CSS3
- **Real-time**: WebSocket connections for live updates

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```

3. Start the development servers:
   ```bash
   # Backend (Port 8000)
   npm start
   
   # Frontend (Port 3000) - in another terminal
   cd client && npm start
   ```

### Usage

1. **Create a Vote**: Set up a group vote with options and duration
2. **Vote**: Anonymous voting with real-time updates
3. **View Results**: See live statistics and winner announcements

## API Endpoints

- `GET /api/votes` - List all votes
- `POST /api/votes` - Create new vote
- `GET /api/votes/:id` - Get specific vote
- `POST /api/votes/:id/vote` - Submit vote
- `GET /api/votes/:id/vote-status` - Check vote status
- `POST /api/votes/:id/close` - Close vote manually

## Deployment

The app is configured for deployment on Vercel with automatic builds from the main branch.

## License

MIT License
