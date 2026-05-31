import { useState } from "react";
import "./VideoGrid.css";

const BG_COLORS = [
  "#1a1a2e", "#16213e", "#0f3460", "#533483",
  "#2d6a4f", "#1b4332", "#774936", "#3d405b",
  "#2c3e50", "#1a1a1a", "#2f4858", "#4a1942",
  "#2e4057", "#3b1f2b", "#1c3144", "#2d4739",
  "#3f2021", "#2a2d3e",
];

const VIDEOS = [
  { id: 1, views: "1,2M" },
  { id: 2, views: "458k" },
  { id: 3, views: "89k" },
  { id: 4, views: "2,1M" },
  { id: 5, views: "33k" },
  { id: 6, views: "710k" },
  { id: 7, views: "95k" },
  { id: 8, views: "1,5M" },
  { id: 9, views: "24k" },
  { id: 10, views: "503k" },
  { id: 11, views: "78k" },
  { id: 12, views: "1,8M" },
  { id: 13, views: "42k" },
  { id: 14, views: "267k" },
  { id: 15, views: "612k" },
  { id: 16, views: "88k" },
  { id: 17, views: "1,1M" },
  { id: 18, views: "39k" },
];

function PlayIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

export default function VideoGrid() {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="video-grid" role="list">
      {VIDEOS.map((video, i) => (
        <div
          key={video.id}
          className="video-thumb"
          role="listitem"
          aria-label={`Vidéo avec ${video.views} vues`}
          onMouseEnter={() => setHoveredId(video.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{ background: BG_COLORS[i % BG_COLORS.length] }}
        >
          {/* Placeholder thumbnail */}
          <div className="video-inner">
            <PlayIcon size={28} />
          </div>

          {/* Hover overlay */}
          <div className={`play-overlay${hoveredId === video.id ? " visible" : ""}`}>
            <PlayIcon size={36} />
          </div>

          {/* View count */}
          <div className="video-views">
            <PlayIcon size={12} />
            <span>{video.views}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
