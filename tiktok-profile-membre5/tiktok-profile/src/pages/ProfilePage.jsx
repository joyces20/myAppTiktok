import { useState } from "react";
import VideoGrid from "../components/VideoGrid";
import ProfileStats from "../components/ProfileStats";
import ProfileActions from "../components/ProfileActions";
import ProfileTabs from "../components/ProfileTabs";
import "./ProfilePage.css";

const USER = {
  name: "Marie Nguyen",
  handle: "@marie_237",
  initials: "M",
  bio: "🎵 Passionnée de danse & musique afro\n🌍 Yaoundé, Cameroun\n📱 Nouveau contenu chaque jour !",
  link: "linktr.ee/marie237",
  verified: true,
  following: 142,
  followers: 24800,
  likes: 183400,
};

export default function ProfilePage() {
  const [followed, setFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");

  const followers = followed ? USER.followers + 1 : USER.followers;

  return (
    <div className="profile-page">
      {/* Top Bar */}
      <div className="top-bar">
        <button className="icon-btn" aria-label="Retour">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="top-handle">{USER.handle}</span>
        <button className="icon-btn" aria-label="Plus d'options">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="12" cy="19" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Avatar */}
      <div className="profile-header">
        <div className="avatar-wrap">
          <div className="avatar">{USER.initials}</div>
          {USER.verified && (
            <div className="verified-badge" aria-label="Compte vérifié">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        <h1 className="username">{USER.name}</h1>
        <p className="handle">{USER.handle}</p>

        <ProfileStats
          following={USER.following}
          followers={followers}
          likes={USER.likes}
        />

        <p className="bio">
          {USER.bio.split("\n").map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </p>

        <div className="link-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" aria-hidden="true">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" />
          </svg>
          <a href={`https://${USER.link}`} target="_blank" rel="noopener noreferrer" className="profile-link">
            {USER.link}
          </a>
        </div>

        <ProfileActions followed={followed} onFollow={() => setFollowed((f) => !f)} />
      </div>

      {/* Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "videos" && <VideoGrid />}
        {activeTab === "liked" && (
          <div className="empty-tab">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
            </svg>
            <p>Les vidéos aimées par Marie sont privées</p>
          </div>
        )}
        {activeTab === "favorites" && (
          <div className="empty-tab">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Aucune vidéo en favoris pour l'instant</p>
          </div>
        )}
      </div>
    </div>
  );
}
