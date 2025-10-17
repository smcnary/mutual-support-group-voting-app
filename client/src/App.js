import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import VoteList from './components/VoteList';
import VoteForm from './components/VoteForm';
import VoteResponse from './components/VoteResponse';
import VoteResults from './components/VoteResults';
import './App.css';

// Use environment variable or fallback to production URL pattern
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api');

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 
  (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:8000');

function App() {
  const [votes, setVotes] = useState([]);
  const [currentView, setCurrentView] = useState('main'); // 'main', 'votes', 'create-vote', 'vote-respond', 'vote-results'
  const [selectedVote, setSelectedVote] = useState(null);
  const [voteStatus, setVoteStatus] = useState({});

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL);

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

    // Listen for vote deletion
    newSocket.on('vote_deleted', (data) => {
      setVotes(prevVotes => 
        prevVotes.filter(vote => vote.id !== data.voteId)
      );
      // If currently viewing the deleted vote, go back to votes list
      if (selectedVote && selectedVote.id === data.voteId) {
        setCurrentView('votes');
        setSelectedVote(null);
      }
    });

    // Load existing votes
    fetchVotes();

    return () => {
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const responseData = await response.json();
        console.log('Vote submitted successfully');
        
        // Update the selectedVote with the latest vote data
        setSelectedVote(responseData.vote);
        
        // Update the votes list with the new data
        setVotes(prevVotes => 
          prevVotes.map(vote => 
            vote.id === selectedVote.id 
              ? responseData.vote
              : vote
          )
        );
        
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

  const deleteVote = async (voteId) => {
    if (!window.confirm('Are you sure you want to delete this vote? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/votes/${voteId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        console.log('Vote deleted successfully');
        // The real-time update via socket will handle removing it from the list
        // If we're viewing this vote, go back to votes list
        if (selectedVote && selectedVote.id === voteId) {
          setCurrentView('votes');
          setSelectedVote(null);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete vote');
      }
    } catch (error) {
      console.error('Error deleting vote:', error);
      alert('Failed to delete vote');
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
            onDeleteVote={deleteVote}
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
            onDeleteVote={deleteVote}
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
        <h1>Group Conscience Voting</h1>
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
