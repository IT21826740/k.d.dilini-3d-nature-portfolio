import React from 'react';
import { DILINI_PROFILE } from '../data/portfolioData';

export const NatureFooter: React.FC = () => {
  return (
    <footer className="border-t border-emerald-500/20 bg-[#070d0a] py-10 text-xs text-emerald-200/60 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Copyright */}
        <div className="flex items-center gap-2 text-center md:text-left">
          <span className="text-emerald-400">🌿</span>
          <span>
            © {new Date().getFullYear()} {DILINI_PROFILE.name}. 3D Floating Nature Sanctuary built with Three.js &amp; Java Engineering Excellence.
          </span>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-6 text-emerald-300/80">
          <a
            href={DILINI_PROFILE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-200 transition-colors"
          >
            GitHub
          </a>
          <a
            href={`mailto:${DILINI_PROFILE.email}`}
            className="hover:text-emerald-200 transition-colors"
          >
            Email
          </a>
          <a
            href="#sanctuary"
            className="hover:text-emerald-200 transition-colors"
          >
            Top of Sanctuary ↑
          </a>
        </div>

      </div>
    </footer>
  );
};
