import React from "react";

export function SignInPromptModal({ isOpen, action, onClose, onSignIn }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Sign In Required</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>To {action || "perform this action"}, please sign in to your account.</p>
          <p className="modal-subtitle">You're currently exploring as a guest.</p>
        </div>
        <div className="modal-footer">
          <button className="cta-btn secondary" onClick={onClose}>Continue Exploring</button>
          <button className="cta-btn accent" onClick={onSignIn}>Sign In</button>
        </div>
      </div>
    </div>
  );
}
