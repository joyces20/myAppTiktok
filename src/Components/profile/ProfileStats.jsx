import "./ProfileStats.css";

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

export default function ProfileStats({ following, followers, likes }) {
  return (
    <div className="stats-row">
      <div className="stat">
        <span className="stat-num">{formatCount(following)}</span>
        <span className="stat-lbl">Abonnements</span>
      </div>
      <div className="stat-divider" aria-hidden="true" />
      <div className="stat">
        <span className="stat-num">{formatCount(followers)}</span>
        <span className="stat-lbl">Abonnés</span>
      </div>
      <div className="stat-divider" aria-hidden="true" />
      <div className="stat">
        <span className="stat-num">{formatCount(likes)}</span>
        <span className="stat-lbl">J'aime</span>
      </div>
    </div>
  );
}
