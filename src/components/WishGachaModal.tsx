import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, Star, ExternalLink, ArrowRight, RotateCcw } from 'lucide-react';
import { PROJECTS, Project, ELEMENT_THEMES } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';

interface WishGachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

export const WishGachaModal: React.FC<WishGachaModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pulledProject, setPulledProject] = useState<Project | null>(null);

  if (!isOpen) return null;

  const triggerWish = (forcedRarity?: 4 | 5) => {
    setIsPulling(true);
    setPulledProject(null);
    soundEngine.playWishFanfare();

    // Select a random project (prioritize 5-star if requested or 60% chance)
    const candidates = forcedRarity
      ? PROJECTS.filter((p) => p.rarity === forcedRarity)
      : Math.random() > 0.4
      ? PROJECTS.filter((p) => p.rarity === 5)
      : PROJECTS;

    const randomPick = candidates[Math.floor(Math.random() * candidates.length)] || PROJECTS[0];

    // Simulate meteor animation delay
    setTimeout(() => {
      setIsPulling(false);
      setPulledProject(randomPick);

      // Gold / Celestial Confetti
      confetti({
        particleCount: randomPick.rarity === 5 ? 80 : 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: randomPick.rarity === 5 ? ['#ffd700', '#f5d372', '#ffffff', '#e6b85c'] : ['#c084fc', '#9333ea', '#e9d5ff'],
      });
    }, 1100);
  };

  const handleInspect = (project: Project) => {
    onClose();
    onSelectProject(project);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#141b2a] via-[#101622] to-[#090c15] border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Ornate Genshin Filigree Corner Marks */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full border border-amber-500/30 text-amber-300 hover:text-amber-100 hover:bg-white/10 transition-colors z-20"
          aria-label="Close Wish Summon Screen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center mb-6">
          <span className="text-xs font-serif uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Teyvat Chronicle Banner</span>
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 mt-1">
            Celestial Project Summon
          </h2>
          <p className="text-xs text-amber-200/70 max-w-md mx-auto mt-1">
            Channel Primogems to summon an Archon Quest, distributed backend system, or IoT intelligence node.
          </p>
        </div>

        {/* Active Wish State Area */}
        <div className="min-h-[280px] sm:min-h-[300px] flex items-center justify-center">
          
          {/* State 1: Pulling Animation */}
          {isPulling && (
            <div className="text-center py-12 space-y-4">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full border-4 border-amber-400/40 border-t-amber-400 animate-spin mx-auto" />
                <span className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
                  ✦
                </span>
              </div>
              <p className="font-serif text-base text-amber-300 animate-bounce">
                A golden meteor descends from Celestia...
              </p>
            </div>
          )}

          {/* State 2: Result Revealed */}
          {!isPulling && pulledProject && (
            <div className="w-full space-y-5 animate-scale-up">
              <div
                className={`p-5 sm:p-6 rounded-2xl border-2 ${
                  pulledProject.rarity === 5
                    ? 'border-amber-400/80 bg-gradient-to-b from-amber-950/40 to-[#121828]'
                    : 'border-purple-400/70 bg-gradient-to-b from-purple-950/40 to-[#121828]'
                } shadow-xl relative overflow-hidden`}
              >
                {/* Element Glow Background */}
                <div
                  className="absolute -right-8 -top-8 w-36 h-36 rounded-full blur-2xl opacity-30 pointer-events-none"
                  style={{
                    backgroundColor: ELEMENT_THEMES[pulledProject.element]?.color || '#ffd700',
                  }}
                />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-amber-400 text-sm mb-1.5">
                      {[...Array(pulledProject.rarity)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-[10px] font-mono text-amber-300/80 ml-1.5 uppercase">
                        {pulledProject.rarity}★ {pulledProject.category}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
                      {pulledProject.title}
                    </h3>
                  </div>

                  {/* Element Glyph */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg border font-serif shrink-0"
                    style={{
                      borderColor: ELEMENT_THEMES[pulledProject.element]?.color,
                      color: ELEMENT_THEMES[pulledProject.element]?.color,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                    }}
                  >
                    {ELEMENT_THEMES[pulledProject.element]?.icon}
                  </div>
                </div>

                <p className="text-sm text-amber-100/80 mt-3 font-sans leading-relaxed">
                  {pulledProject.tagline}
                </p>

                {/* Key Architecture Pills */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-amber-500/20">
                  {pulledProject.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-black/40 text-amber-200/90 font-mono border border-amber-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-amber-500/20">
                  <button
                    onClick={() => handleInspect(pulledProject)}
                    className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-amber-300 hover:text-amber-200 bg-amber-500/20 px-3.5 py-1.5 rounded-full border border-amber-400/50 hover:bg-amber-500/30 transition-colors cursor-pointer"
                  >
                    <span>Read Full Quest Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {pulledProject.links[0] && (
                    <a
                      href={pulledProject.links[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
                    >
                      <span>{pulledProject.links[0].label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* State 3: Ready to Wish */}
          {!isPulling && !pulledProject && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-dashed border-amber-400/50 flex items-center justify-center text-amber-400 text-3xl mx-auto animate-pulse">
                ✦
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg font-semibold text-amber-200">
                  Fate of the Developer
                </h4>
                <p className="text-xs text-amber-100/60 max-w-sm mx-auto">
                  Click below to perform a single or 5-Star guaranteed summon from Dilini's project portfolio.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Wish Actions Footer */}
        <div className="mt-6 pt-5 border-t border-amber-500/20 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => triggerWish()}
            disabled={isPulling}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#090c15] font-serif text-sm font-bold shadow-md shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Wish x1 (160 Primogems)</span>
          </button>

          <button
            onClick={() => triggerWish(5)}
            disabled={isPulling}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#161f33] hover:bg-[#1d2943] text-amber-200 border border-amber-400/60 font-serif text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Guaranteed 5★ Archon Quest</span>
          </button>

          {pulledProject && (
            <button
              onClick={() => setPulledProject(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-amber-300/80 hover:text-amber-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Banner</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
