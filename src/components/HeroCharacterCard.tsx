import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Terminal, Layers, Star, ExternalLink } from 'lucide-react';
import { DILINI_PROFILE } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';

interface HeroCharacterCardProps {
  onOpenWish: () => void;
  onExploreQuests: () => void;
}

export const HeroCharacterCard: React.FC<HeroCharacterCardProps> = ({
  onOpenWish,
  onExploreQuests,
}) => {
  return (
    <section id="character" className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Kicker Label complying with zero-pill rule */}
        <div className="flex items-center gap-2 text-xs font-serif text-amber-400 tracking-widest uppercase mb-4">
          <span>Character Profile</span>
          <span aria-hidden="true" className="text-amber-500/50">·</span>
          <span>5-Star Backend Pioneer</span>
          <span aria-hidden="true" className="text-amber-500/50">·</span>
          <span>SLIIT Graduate</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Character Lore & Architecture Copy */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Title & Constellation */}
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 text-sm mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow" />
                ))}
                <span className="text-xs font-mono text-amber-300/80 ml-2">RARITY: 5-STAR S-RANK</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#f6eedb] tracking-tight leading-none text-balance">
                K.D. Dilini
              </h1>
              
              <p className="font-serif text-lg sm:text-xl text-amber-300/90 font-medium mt-2">
                {DILINI_PROFILE.title}
              </p>
            </div>

            {/* Character Lore Synopsis */}
            <p className="text-base sm:text-lg text-amber-100/75 leading-relaxed max-w-2xl font-sans">
              Forging resilient backend architectures that hold up under heavy load. A dedicated Java and Spring Boot engineer building high-concurrency microservices, distributed messaging pipelines, and edge-AI sensory systems.
            </p>

            {/* In-Game Attributes & Specialization Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#111728]/80 border border-amber-500/25 backdrop-blur-md">
              <div>
                <span className="text-[11px] text-amber-400/70 uppercase tracking-wider block font-serif">Vision</span>
                <span className="text-sm font-semibold text-amber-200">Geo &amp; Anemo</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-400/70 uppercase tracking-wider block font-serif">Constellation</span>
                <span className="text-sm font-semibold text-amber-200">Architectura</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-400/70 uppercase tracking-wider block font-serif">Core Weapon</span>
                <span className="text-sm font-semibold text-amber-200">Spring Boot 3</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-400/70 uppercase tracking-wider block font-serif">Affiliation</span>
                <span className="text-sm font-semibold text-amber-200">SLIIT IT (Hons)</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-400/70 uppercase tracking-wider block font-serif">Database Realm</span>
                <span className="text-sm font-semibold text-amber-200">MySQL / Postgres</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-400/70 uppercase tracking-wider block font-serif">Base Origin</span>
                <span className="text-sm font-semibold text-amber-200">Sri Lanka</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  soundEngine.playChime(587.33, 'triangle', 0.3);
                  onExploreQuests();
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#090c15] font-serif text-sm font-bold shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Inspect Archon Quests</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundEngine.playWishFanfare();
                  onOpenWish();
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#131b2e]/90 hover:bg-[#1a253e] text-amber-200 border border-amber-500/40 hover:border-amber-400 font-serif text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Make a Wish (Gacha)</span>
              </button>

              <a
                href="#commission"
                onClick={() => soundEngine.playChime(523.25, 'sine', 0.2)}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-amber-300/80 hover:text-amber-200 text-sm font-medium transition-colors"
              >
                <span>Send Commission</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>

            {/* Social Proof Claim & Quantitative Rigor */}
            <div className="pt-4 border-t border-amber-500/15 flex flex-wrap items-center gap-6 text-xs text-amber-200/75">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Enterprise Spring Security &amp; JWT</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>14+ Verified Projects Shipped</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Full-Stack &amp; Distributed AMQP</span>
              </div>
            </div>
          </div>

          {/* Right Column: Genshin 5-Star Character Card Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md group">
              
              {/* Outer Golden Glow & Filigree Trim */}
              <div className="absolute -inset-1.5 bg-gradient-to-b from-amber-400/40 via-amber-500/20 to-purple-500/30 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none" />

              {/* Character Card Frame */}
              <div className="relative rounded-2xl bg-gradient-to-b from-[#141c2e] via-[#0f1523] to-[#090c15] border-2 border-amber-400/60 p-5 shadow-2xl overflow-hidden">
                
                {/* Ornate Corner Elements (Genshin Artifact Border Aesthetic) */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

                {/* Character Banner Header */}
                <div className="flex items-center justify-between border-b border-amber-500/25 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 font-serif text-xs font-bold">
                      ⬟
                    </span>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-amber-100 tracking-wide">
                        Dilini: System Arbiter
                      </h3>
                      <span className="text-[11px] text-amber-400/80 font-mono">Lv. 90 / 90 (Max Ascension)</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-[10px] font-mono text-amber-300 font-semibold uppercase">
                    5★ Geo Pioneer
                  </span>
                </div>

                {/* Real Graduation Portrait Image Frame */}
                <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-amber-500/30 bg-[#070a10]">
                  <img
                    src="https://it21826740.github.io/K.D.Dilini-Portfolio-2025/assets/img/hero/hero-bg.jpeg"
                    alt="K.D. Dilini in graduation regalia, holding degree certificate"
                    className="w-full h-full object-cover object-top filter brightness-95 group-hover:scale-102 transition-transform duration-500"
                    loading="eager"
                    onError={(e) => {
                      // Fallback gradient card if image link fails
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'p-6');
                        target.parentElement.innerHTML = `
                          <div class="text-center">
                            <span class="text-4xl text-amber-400 block mb-2">🎓</span>
                            <strong class="font-serif text-amber-200 text-sm block">K.D. Dilini · SLIIT Graduate</strong>
                            <p class="text-xs text-amber-400/70 mt-1">BSc (Hons) in Information Technology</p>
                          </div>
                        `;
                      }
                    }}
                  />
                  {/* Subtle vignette scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090c15] via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>

                {/* Attribute Stats Breakdown */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-100/70 font-sans">Java &amp; Spring Boot</span>
                    <span className="font-mono text-amber-300 font-bold">96%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full w-[96%]" />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-amber-100/70 font-sans">RESTful APIs &amp; Microservices</span>
                    <span className="font-mono text-teal-300 font-bold">92%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-teal-300 rounded-full w-[92%]" />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-amber-100/70 font-sans">MySQL, Postgres &amp; Docker</span>
                    <span className="font-mono text-purple-300 font-bold">90%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full w-[90%]" />
                  </div>
                </div>

                {/* Card Footer Quote */}
                <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-amber-300/80 font-serif italic">
                  <span>"Clean APIs. Resilient Systems. Scalable Futures."</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
