import React, { useState } from 'react';
import './VoteResponse.css';

const VoteResponse = ({ vote, onSubmit, onBack, onViewResults }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleVote = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOption) {
      onSubmit(selectedOption);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="vote-response">
        <div className="submission-success">
          <h2>Thank you for your vote!</h2>
          <p>Your vote has been recorded successfully.</p>
          <div className="success-actions">
            <button onClick={onBack} className="back-btn">
              Back to Main
            </button>
            <button onClick={onViewResults} className="view-results-btn">
              View Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vote-response">
      <div className="response-header">
        <h2>{vote.subject}</h2>
        <button onClick={onBack} className="back-btn">
          Back to Main
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="vote-options">
          {vote.options.map((option) => (
            <label key={option.id} className="vote-option">
              <input
                type="radio"
                name="vote"
                value={option.id}
                onChange={() => handleVote(option.id)}
                required
              />
              <div className="option-content">
                <span className="option-text">{option.text}</span>
              </div>
            </label>
          ))}
        </div>

        <button 
          type="submit" 
          className="submit-vote"
          disabled={!selectedOption}
        >
          Submit Vote
        </button>
      </form>
    </div>
  );
};

export default VoteResponse;
