import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "../services/api";

export default function AnnouncementTicker() {
  const [newsletters, setNewsletters] = useState([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    publicApi.getNewsletters().then(setNewsletters).catch(() => {});
  }, []);

  const items = newsletters.slice(0, 5);
  if (items.length === 0) return null;

  const duplicated = [...items, ...items];

  return (
    <div
      className="flex items-center overflow-hidden bg-[#f4c430] py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-8 px-4">
        <span className="flex-shrink-0 text-xs font-bold uppercase tracking-wider text-[#1c2647]">
          Latest Updates
        </span>
      </div>
      <div
        className="flex flex-1 items-center overflow-hidden"
        style={{
          animation: paused ? "none" : "marquee 30s linear infinite",
        }}
      >
        <div className="flex gap-8 whitespace-nowrap">
          {duplicated.map((nl, idx) => (
            <Link
              key={idx}
              to="/newsletter"
              className="flex items-center gap-2 text-sm font-medium text-[#1c2647] hover:underline"
            >
              <span className="text-[10px] text-[#1c2647]/60">•</span>
              {nl.title || "Newsletter Update"}
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .flex-1[style] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}