import React from 'react';
import './VoteResults.css';

const VoteResults = ({ vote, onBack }) => {
  const getPercentage = (count) => {
    if (vote.totalVotes === 0) return 0;
    return Math.round((count / vote.totalVotes) * 100);
  };

  const getWinner = () => {
    if (vote.totalVotes === 0) return null;
    return vote.options.reduce((prev, current) => 
      (prev.count > current.count) ? prev : current
    );
  };

  const winner = getWinner();

  return (
    <div className="vote-results">
      <div className="results-header">
        <h2>Vote Results: {vote.subject}</h2>
        <button onClick={onBack} className="back-btn">
          Back to Main
        </button>
      </div>

      <div className="results-summary">
        <div className="summary-card">
          <h3>Total Votes</h3>
          <p className="summary-number">{vote.totalVotes}</p>
        </div>
        <div className="summary-card">
          <h3>Options</h3>
          <p className="summary-number">{vote.options.length}</p>
        </div>
        {winner && (
          <div className="summary-card winner">
            <h3>Winner</h3>
            <p className="winner-text">{winner.text}</p>
            <p className="winner-votes">{winner.count} votes ({getPercentage(winner.count)}%)</p>
          </div>
        )}
      </div>

      <div className="vote-breakdown">
        {vote.options.map((option, index) => (
          <div key={option.id} className="option-result">
            <div className="option-header">
              <span className="option-label">{option.text}</span>
              <span className="option-stats">
                {option.count} votes ({getPercentage(option.count)}%)
              </span>
            </div>
            <div className="vote-bar">
              <div 
                className="vote-fill"
                style={{ width: `${getPercentage(option.count)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {vote.totalVotes === 0 && (
        <div className="no-votes">
          <p>No votes have been cast yet.</p>
        </div>
      )}
    </div>
  );
};

export default VoteResults;
