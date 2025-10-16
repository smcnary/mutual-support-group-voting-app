import React, { useState } from 'react';
import './VoteForm.css';

const VoteForm = ({ onSubmit, onBack }) => {
  const [subject, setSubject] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [durationHours, setDurationHours] = useState(24);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter(option => option.trim() !== '');
    
    if (subject.trim() && validOptions.length >= 2) {
      onSubmit({ subject, options: validOptions, durationHours });
    }
  };

  return (
    <div className="vote-form">
      <h2>Create Group Vote</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Voting Subject</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What topic should the group vote on?"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">Voting Duration</label>
          <select
            id="duration"
            value={durationHours}
            onChange={(e) => setDurationHours(parseInt(e.target.value))}
          >
            <option value={1}>1 Hour</option>
            <option value={6}>6 Hours</option>
            <option value={12}>12 Hours</option>
            <option value={24}>24 Hours (1 Day)</option>
            <option value={72}>72 Hours (3 Days)</option>
            <option value={168}>168 Hours (1 Week)</option>
          </select>
        </div>

        <div className="options-section">
          <h3>Voting Options</h3>
          {options.map((option, index) => (
            <div key={index} className="option-container">
              <div className="option-input-group">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="remove-option"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addOption}
            className="add-option"
          >
            Add Option
          </button>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="back-btn">
            Back to Main
          </button>
          <button type="submit" className="submit-vote">
            Create Group Vote
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoteForm;
