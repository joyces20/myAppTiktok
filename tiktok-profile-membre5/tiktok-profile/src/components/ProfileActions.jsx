import "./ProfileActions.css";

export default function ProfileActions({ followed, onFollow }) {
  return (
    <div className="action-row">
      <button
        className={`btn-follow${followed ? " following" : ""}`}
        onClick={onFollow}
        aria-pressed={followed}
      >
        {followed ? "Abonné(e) ✓" : "S'abonner"}
      </button>

      <button className="btn-icon" aria-label="Envoyer un message">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button className="btn-icon" aria-label="Partager le profil">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>
    </div>
  );
}
