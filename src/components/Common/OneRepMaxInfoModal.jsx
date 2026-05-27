import React from "react";

export function OneRepMaxInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>1RM estimate</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>The app estimates 1RM using the Epley formula:</p>
          <p className="formula-block">1RM = weight × (1 + reps / 30)</p>
          <p>Example: 100 lb for 10 reps gives about 133 lb.</p>
          <p>For each exercise, the app checks the valid sets you entered, calculates an estimate for each one, and then shows the highest estimate as the exercise’s displayed 1RM. This gives you a practical estimate based on your strongest logged set.</p>
        </div>
        <div className="modal-footer">
          <button className="cta-btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
