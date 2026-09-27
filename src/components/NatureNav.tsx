import React, { useState } from 'react';
import { Volume2, VolumeX, Download, Menu, X, FileDown, Trees } from 'lucide-react';
import { natureAudio } from '../utils/natureAudio';
import { DILINI_CV_BASE64 } from '../data/cvData';

interface NatureNavProps {
  onOpenDownloadZip: () => void;
  activeSection: string;
}

export const NatureNav: React.FC<NatureNavProps> = ({ onOpenDownloadZip, activeSection }) => {
  const [isMuted, setIsMuted] = useState(natureAudio.isMuted);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    natureAudio.isMuted = !natureAudio.isMuted;
    setIsMuted(natureAudio.isMuted);
    if (!natureAudio.isMuted) {
      natureAudio.startAmbience();
      natureAudio.playBell(587.33, 0.5);
    } else {
      natureAudio.stopAmbience();
    }
  };

  const navLinks = [
    { label: 'Sanctuary', href: '#sanctuary' },
    { label: 'Projects', href: '#projects' },
    { label: 'Skills Garden', href: '#skills' },
    { label: 'Artifacts', href: '#artifacts' },
    { label: 'Dispatches', href: '#dispatches' },
    { label: 'Inquiry', href: '#contact' },
  ];

  const handleNavClick = () => {
    natureAudio.playWaterDrop();
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0b120f]/85 backdrop-blur-md border-b border-emerald-500/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <a
          href="#top"
          onClick={() => natureAudio.playBell(528, 0.4)}
          className="font-serif text-lg sm:text-xl font-bold tracking-wide text-emerald-200 hover:text-emerald-300 transition-colors flex items-center gap-2 group shrink-0"
        >
          <span className="text-emerald-400 text-base group-hover:scale-110 transition-transform">🌿</span>
          <span>K.D. Dilini</span>
          <span className="text-xs text-emerald-400/60 font-sans font-normal hidden sm:inline">
            · 3D Nature Portfolio
          </span>
        </a>

        {/* Clean Text Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-emerald-100/75">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className={`relative py-1 tracking-wide transition-colors whitespace-nowrap hover:text-emerald-300 ${
                  isActive ? 'text-emerald-300 font-semibold' : ''
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Actions (Download ZIP, CV, Nature Sound) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Nature Ambience Toggle */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Enable Nature Audio Ambience' : 'Mute Nature Audio'}
            className="p-2 rounded-full border border-emerald-500/30 bg-[#12221b]/80 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/15 transition-colors cursor-pointer"
            title={isMuted ? 'Sound Muted' : 'Nature Ambience Active'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Download Resume PDF */}
          <a
            href={DILINI_CV_BASE64}
            download="Dilini-Backend-Developer-CV.pdf"
            onClick={() => natureAudio.playBell(659.25, 0.3)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-[#12221b]/80 hover:border-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold text-emerald-200 transition-colors whitespace-nowrap"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>CV</span>
          </a>

          {/* Export Project ZIP for GitHub & Vercel Deploy */}
          <button
            onClick={() => {
              natureAudio.playBell(587.33, 0.4);
              onOpenDownloadZip();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#09120e] text-xs font-bold tracking-wide shadow-md shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Get Project ZIP</span>
          </button>

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0b120f]/95 border-b border-emerald-500/30 px-6 py-4 space-y-3 backdrop-blur-xl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className="block text-sm text-emerald-100/80 hover:text-emerald-300 py-1.5 font-serif"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDownloadZip();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project ZIP (Vercel Ready)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
