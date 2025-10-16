import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import VoteList from './components/VoteList';
import VoteForm from './components/VoteForm';
import VoteResponse from './components/VoteResponse';
import VoteResults from './components/VoteResults';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const [votes, setVotes] = useState([]);
  const [currentView, setCurrentView] = useState('main'); // 'main', 'votes', 'create-vote', 'vote-respond', 'vote-results'
  const [selectedVote, setSelectedVote] = useState(null);
  const [socket, setSocket] = useState(null);
  const [voteStatus, setVoteStatus] = useState({});

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);

    // Listen for real-time vote updates
    newSocket.on('vote_update', (data) => {
      setVotes(prevVotes => 
        prevVotes.map(vote => 
          vote.id === data.voteId 
            ? data.vote
            : vote
        )
      );
    });

    // Listen for vote closure
    newSocket.on('vote_closed', (data) => {
      setVotes(prevVotes => 
        prevVotes.map(vote => 
          vote.id === data.voteId 
            ? data.vote
            : vote
        )
      );
    });

    // Load existing votes
    fetchVotes();

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchVotes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/votes`);
      const data = await response.json();
      setVotes(data);
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  const createVote = async (voteData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });
      
      if (response.ok) {
        const newVote = await response.json();
        setVotes(prev => [...prev, newVote]);
        setCurrentView('votes');
      }
    } catch (error) {
      console.error('Error creating vote:', error);
    }
  };


  const submitVote = async (optionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/votes/${selectedVote.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId }),
      });
      
      if (response.ok) {
        console.log('Vote submitted successfully');
        setVoteStatus(prev => ({
          ...prev,
          [selectedVote.id]: true
        }));
      } else if (response.status === 409) {
        const errorData = await response.json();
        alert(errorData.error);
        setVoteStatus(prev => ({
          ...prev,
          [selectedVote.id]: true
        }));
        setCurrentView('vote-results');
      } else if (response.status === 410) {
        const errorData = await response.json();
        alert(errorData.error);
        setCurrentView('vote-results');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  const handleCreateNewVote = () => {
    setCurrentView('create-vote');
    setSelectedVote(null);
  };

  const handleSelectVote = async (vote) => {
    setSelectedVote(vote);
    
    // Check if user has already voted
    try {
      const response = await fetch(`${API_BASE_URL}/votes/${vote.id}/vote-status`);
      const data = await response.json();
      setVoteStatus(prev => ({
        ...prev,
        [vote.id]: data.hasVoted
      }));
      
      if (data.hasVoted) {
        setCurrentView('vote-results');
      } else {
        setCurrentView('vote-respond');
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
      setCurrentView('vote-respond');
    }
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedVote(null);
  };

  const handleBackToVotes = () => {
    setCurrentView('votes');
    setSelectedVote(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'main':
        return (
          <div className="main-menu">
            <div className="menu-cards">
              <div className="menu-card" onClick={() => setCurrentView('votes')}>
                <h3>🗳️ Group Voting</h3>
                <p>Create votes on subjects and see real-time results for your support group</p>
                <div className="menu-stats">
                  <span>{votes.length} active votes</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'votes':
        return (
          <VoteList 
            votes={votes}
            onSelectVote={handleSelectVote}
            onCreateNew={handleCreateNewVote}
            voteStatus={voteStatus}
          />
        );
      case 'create-vote':
        return (
          <VoteForm 
            onSubmit={createVote}
            onBack={handleBackToVotes}
          />
        );
      case 'vote-respond':
        return (
          <VoteResponse 
            vote={selectedVote}
            onSubmit={submitVote}
            onBack={handleBackToVotes}
            onViewResults={() => setCurrentView('vote-results')}
          />
        );
      case 'vote-results':
        return (
          <VoteResults 
            vote={selectedVote}
            onBack={handleBackToVotes}
          />
        );
      default:
        return (
          <div className="main-menu">
            <div className="menu-cards">
              <div className="menu-card" onClick={() => setCurrentView('votes')}>
                <h3>🗳️ Group Voting</h3>
                <p>Create votes on subjects and see real-time results for your support group</p>
                <div className="menu-stats">
                  <span>{votes.length} active votes</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mutual Support Group Voting App</h1>
        <p>Create votes on subjects and see real-time results</p>
        {currentView !== 'main' && (
          <button onClick={handleBackToMain} className="home-btn">
            🏠 Home
          </button>
        )}
      </header>
      <main className="App-main">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;
