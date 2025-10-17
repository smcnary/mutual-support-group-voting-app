const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store votes in memory (in production, use a database)
const votes = new Map();

// Store user votes to prevent duplicates (in production, use a database)
const userVotes = new Map(); // voteId -> Set of user identifiers

// Helper function to check if vote is still active
const isVoteActive = (vote) => {
  if (!vote.isActive) return false;
  if (vote.expiresAt && new Date() > vote.expiresAt) {
    vote.isActive = false; // Mark as inactive
    return false;
  }
  return true;
};

// Voting API Routes
app.get('/api/votes', (req, res) => {
  res.json(Array.from(votes.values()));
});

app.post('/api/votes', (req, res) => {
  const { subject, options, durationHours = 24 } = req.body;
  
  // Calculate expiration date
  const expiresAt = new Date(Date.now() + (durationHours * 60 * 60 * 1000));
  
  const vote = {
    id: uuidv4(),
    subject,
    options: options.map(option => ({
      id: uuidv4(),
      text: option,
      count: 0
    })),
    totalVotes: 0,
    createdAt: new Date(),
    expiresAt,
    durationHours,
    isActive: true
  };
  votes.set(vote.id, vote);
  res.json(vote);
});

app.get('/api/votes/:id', (req, res) => {
  const vote = votes.get(req.params.id);
  if (!vote) {
    return res.status(404).json({ error: 'Vote not found' });
  }
  res.json(vote);
});

app.get('/api/votes/:id/vote-status', (req, res) => {
  const vote = votes.get(req.params.id);
  if (!vote) {
    return res.status(404).json({ error: 'Vote not found' });
  }
  
  const userIdentifier = req.ip;
  const hasVoted = userVotes.has(req.params.id) && 
                  userVotes.get(req.params.id).has(userIdentifier);
  
  res.json({ hasVoted });
});

app.post('/api/votes/:id/vote', (req, res) => {
  const vote = votes.get(req.params.id);
  if (!vote) {
    return res.status(404).json({ error: 'Vote not found' });
  }
  
  // Check if vote is still active
  if (!isVoteActive(vote)) {
    return res.status(410).json({ 
      error: 'This vote has expired and is no longer active',
      isExpired: true 
    });
  }
  
  const userIdentifier = req.ip;
  
  // Check if user has already voted
  if (!userVotes.has(req.params.id)) {
    userVotes.set(req.params.id, new Set());
  }
  
  const voteUserVotes = userVotes.get(req.params.id);
  if (voteUserVotes.has(userIdentifier)) {
    return res.status(409).json({ 
      error: 'You have already voted on this subject',
      hasVoted: true 
    });
  }
  
  const { optionId } = req.body;
  const option = vote.options.find(opt => opt.id === optionId);
  if (!option) {
    return res.status(400).json({ error: 'Invalid option' });
  }
  
  // Update vote counts
  option.count += 1;
  vote.totalVotes += 1;
  votes.set(vote.id, vote);
  
  // Mark user as having voted
  voteUserVotes.add(userIdentifier);
  userVotes.set(req.params.id, voteUserVotes);
  
  // Emit real-time update to all connected clients
  io.emit('vote_update', { voteId: req.params.id, vote });
  
  res.json({ success: true, vote });
});

// Close a vote manually
app.post('/api/votes/:id/close', (req, res) => {
  const vote = votes.get(req.params.id);
  if (!vote) {
    return res.status(404).json({ error: 'Vote not found' });
  }
  
  vote.isActive = false;
  vote.closedAt = new Date();
  votes.set(vote.id, vote);
  
  // Emit real-time update
  io.emit('vote_closed', { voteId: req.params.id, vote });
  
  res.json({ success: true, vote });
});

// Cleanup expired votes (run every hour)
setInterval(() => {
  const now = new Date();
  let expiredCount = 0;
  
  votes.forEach((vote, id) => {
    if (vote.expiresAt && vote.expiresAt < now && vote.isActive) {
      vote.isActive = false;
      expiredCount++;
    }
  });
  
  if (expiredCount > 0) {
    console.log(`Auto-expired ${expiredCount} votes`);
  }
}, 60 * 60 * 1000); // Run every hour

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_survey', (surveyId) => {
    socket.join(surveyId);
    console.log(`User ${socket.id} joined survey ${surveyId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
