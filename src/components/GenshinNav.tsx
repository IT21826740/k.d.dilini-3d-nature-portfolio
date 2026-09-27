import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Menu, X, FileDown } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { DILINI_CV_BASE64 } from '../data/cvData';

interface GenshinNavProps {
  onOpenWish: () => void;
  activeSection: string;
}

export const GenshinNav: React.FC<GenshinNavProps> = ({ onOpenWish, activeSection }) => {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    soundEngine.isMuted = !soundEngine.isMuted;
    setIsMuted(soundEngine.isMuted);
    if (!soundEngine.isMuted) {
      soundEngine.playChime(659.25, 'triangle', 0.4);
    }
  };

  const navLinks = [
    { label: 'Character', href: '#character' },
    { label: 'Quests', href: '#quests' },
    { label: 'Talents', href: '#talents' },
    { label: 'Artifacts', href: '#artifacts' },
    { label: 'Guild Log', href: '#guild' },
    { label: 'Commission', href: '#commission' },
  ];

  const handleNavClick = () => {
    soundEngine.playChime(587.33, 'sine', 0.2);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#090c15]/85 backdrop-blur-md border-b border-amber-500/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a
          href="#top"
          onClick={() => soundEngine.playChime(523.25, 'triangle', 0.3)}
          className="font-serif text-lg sm:text-xl font-bold tracking-wider text-amber-200 hover:text-amber-300 transition-colors flex items-center gap-2 group shrink-0"
        >
          <span className="text-amber-400 text-sm group-hover:rotate-45 transition-transform duration-300">✦</span>
          <span>K.D. Dilini</span>
          <span className="text-xs text-amber-400/60 font-sans font-normal hidden sm:inline tracking-normal">
            · Java Architect
          </span>
        </a>

        {/* Zone 2: Clean Text Nav Links (4-6 links with hover underlines) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-amber-100/75">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className={`relative py-1 tracking-wide transition-colors whitespace-nowrap hover:text-amber-300 ${
                  isActive ? 'text-amber-300 font-semibold' : ''
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-200 rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Wish button, Audio toggle, CV) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Audio Chime Mute Button */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Enable Audio Chimes' : 'Mute Audio Chimes'}
            className="p-2 rounded-full border border-amber-500/30 bg-[#141b2a]/80 text-amber-300 hover:border-amber-400 hover:bg-amber-500/10 transition-colors"
            title={isMuted ? 'Sound Muted' : 'Sound Active'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Download CV */}
          <a
            href={DILINI_CV_BASE64}
            download="Dilini-Backend-Developer-CV.pdf"
            onClick={() => soundEngine.playChime(659.25, 'triangle', 0.3)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-[#141b2a]/80 hover:border-amber-400 hover:bg-amber-500/10 text-xs font-semibold text-amber-200 transition-colors whitespace-nowrap"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-400" />
            <span>CV</span>
          </a>

          {/* Genshin Wish (Gacha Summon) Action */}
          <button
            onClick={() => {
              soundEngine.playWishFanfare();
              onOpenWish();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-[#090c15] text-xs font-bold tracking-wide shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Make a Wish</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#090c15]/95 border-b border-amber-500/30 px-6 py-4 space-y-3 backdrop-blur-xl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className="block text-sm text-amber-100/80 hover:text-amber-300 py-1.5 font-serif"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
            <span className="text-xs text-amber-300/70">K.D. Dilini Portfolio</span>
            <a
              href={DILINI_CV_BASE64}
              download="Dilini-Backend-Developer-CV.pdf"
              className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download Resume
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
