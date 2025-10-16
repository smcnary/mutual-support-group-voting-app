import React from 'react';
import './VoteList.css';

const VoteList = ({ votes, onSelectVote, onCreateNew, voteStatus }) => {
  return (
    <div className="vote-list">
      <div className="vote-list-header">
        <h2>Group Votes</h2>
        <button onClick={onCreateNew} className="create-vote-btn">
          Create New Vote
        </button>
      </div>

      {votes.length === 0 ? (
        <div className="no-votes">
          <p>No group votes available yet.</p>
          <button onClick={onCreateNew} className="create-first-vote">
            Create Your First Group Vote
          </button>
        </div>
      ) : (
        <div className="votes-grid">
          {votes.map(vote => (
            <div key={vote.id} className="vote-card">
              <h3>{vote.subject}</h3>
              <p className="option-count">
                {vote.options.length} option{vote.options.length !== 1 ? 's' : ''}
              </p>
              <p className="vote-count">
                {vote.totalVotes} vote{vote.totalVotes !== 1 ? 's' : ''}
              </p>
              <p className="created-date">
                Created: {new Date(vote.createdAt).toLocaleDateString()}
              </p>
              <div className="vote-status-info">
                {vote.isActive ? (
                  <div className="status-active">
                    <span className="status-badge active">🟢 Active</span>
                    <p className="expires-info">
                      Expires: {new Date(vote.expiresAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="status-closed">
                    <span className="status-badge closed">🔴 Closed</span>
                    {vote.closedAt && (
                      <p className="closed-info">
                        Closed: {new Date(vote.closedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {voteStatus[vote.id] && (
                <div className="vote-status">
                  <span className="status-badge voted">✓ Voted</span>
                </div>
              )}
              <button 
                onClick={() => onSelectVote(vote)}
                className={`take-vote-btn ${voteStatus[vote.id] ? 'view-results' : ''} ${!vote.isActive ? 'closed' : ''}`}
                disabled={!vote.isActive && !voteStatus[vote.id]}
              >
                {!vote.isActive ? 'View Results' : voteStatus[vote.id] ? 'View Results' : 'Vote Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoteList;
