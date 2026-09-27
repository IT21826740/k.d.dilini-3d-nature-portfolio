import React from 'react';
import { ArrowRight, Compass, ShieldCheck, Terminal, Layers, Sparkles, Download } from 'lucide-react';
import { DILINI_PROFILE } from '../data/portfolioData';
import { natureAudio } from '../utils/natureAudio';
import { NATURE_LANDMARKS } from './canvas/NatureIslandCanvas';

interface NatureHeroProps {
  onSelectLandmark: (id: string) => void;
  onExploreProjects: () => void;
  onOpenDownloadZip: () => void;
}

export const NatureHero: React.FC<NatureHeroProps> = ({
  onSelectLandmark,
  onExploreProjects,
  onOpenDownloadZip
}) => {
  return (
    <section id="sanctuary" className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Kicker label */}
        <div className="flex items-center gap-2 text-xs font-serif text-emerald-400 tracking-widest uppercase mb-4">
          <span>Interactive 3D Sanctuary</span>
          <span aria-hidden="true" className="text-emerald-500/50">·</span>
          <span>Jordan Breton Inspired Nature Island</span>
          <span aria-hidden="true" className="text-emerald-500/50">·</span>
          <span>Full-Stack Java Engineer</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Natural Architecture Lore */}
          <div className="lg:col-span-7 space-y-6">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-xs font-serif text-emerald-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Calm 3D World · Navigate Nature Landmarks Below</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#f4efe6] tracking-tight leading-none text-balance">
                K.D. Dilini
              </h1>
              
              <p className="font-serif text-lg sm:text-xl text-emerald-300 font-medium mt-2">
                Full-Stack Java &amp; Spring Boot Developer
              </p>
            </div>

            {/* Core Pitch & Mission */}
            <p className="text-base sm:text-lg text-emerald-100/80 leading-relaxed max-w-2xl font-sans">
              Welcome to my digital floating nature sanctuary. Wander through the rolling hills, cascading API streams, ancient oak trees, and stone monoliths where my Java backends, edge-AI IoT research, and full-stack systems take root.
            </p>

            {/* Natural Biome Quick Links (Connects with Jordan Breton nature experience) */}
            <div className="p-4 rounded-2xl bg-[#102018]/85 border border-emerald-500/30 backdrop-blur-md space-y-2.5">
              <span className="text-[11px] font-serif uppercase tracking-widest text-emerald-400 font-semibold block">
                Traveler's Biome Compass (Click to Fly Camera):
              </span>
              <div className="flex flex-wrap gap-2">
                {NATURE_LANDMARKS.slice(1).map((lm) => (
                  <button
                    key={lm.id}
                    onClick={() => {
                      natureAudio.playBell(587.33, 0.6);
                      onSelectLandmark(lm.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b1611] hover:bg-[#162a20] border border-emerald-500/25 hover:border-emerald-400 text-xs text-emerald-200 transition-all cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lm.color }}></span>
                    <span className="font-serif">{lm.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  natureAudio.playWaterDrop();
                  onExploreProjects();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#09120e] font-serif text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Explore 14+ Projects</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  natureAudio.playBell(783.99, 0.5);
                  onOpenDownloadZip();
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#12221b]/90 hover:bg-[#172c23] text-emerald-200 border border-emerald-500/40 hover:border-emerald-400 font-serif text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Get Vercel/GitHub ZIP</span>
              </button>

              <a
                href="#contact"
                onClick={() => natureAudio.playBell(528, 0.2)}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-emerald-300 hover:text-emerald-100 text-sm font-medium transition-colors"
              >
                <span>Send Commission</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>

            {/* Quantitative Credentials */}
            <div className="pt-4 border-t border-emerald-500/15 flex flex-wrap items-center gap-6 text-xs text-emerald-200/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Spring Security &amp; JWT Architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Docker &amp; Distributed Messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400 shrink-0" />
                <span>SLIIT BSc (Hons) Graduate</span>
              </div>
            </div>

          </div>

          {/* Right Column: Graduation Portrait nestled in Nature Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md group">
              
              {/* Natural forest aura glow */}
              <div className="absolute -inset-2 bg-gradient-to-b from-emerald-500/30 via-teal-500/20 to-amber-500/20 rounded-3xl blur-lg opacity-70 group-hover:opacity-100 transition duration-500 pointer-events-none" />

              {/* Card Container */}
              <div className="relative rounded-2xl bg-gradient-to-b from-[#13221b] via-[#0f1a14] to-[#09110d] border-2 border-emerald-400/50 p-5 shadow-2xl overflow-hidden">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-300 text-sm">
                      🍃
                    </span>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-emerald-100">
                        K.D. Dilini
                      </h3>
                      <span className="text-[11px] text-emerald-400/80 font-mono">BSc (Hons) in Information Technology</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-mono text-emerald-300 font-semibold uppercase">
                    SLIIT Alumna
                  </span>
                </div>

                {/* Real Graduation Portrait Photo */}
                <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-emerald-500/30 bg-[#070d0a]">
                  <img
                    src="src\image\DUL06439.JPG"
                    alt="K.D. Dilini in university graduation gown with degree certificate"
                    className="w-full h-full object-cover object-top filter brightness-95 group-hover:scale-102 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09120e] via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>

                {/* Key Metrics / Nature Attributes */}
                <div className="mt-4 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-100/70 font-sans">Java &amp; Spring Boot</span>
                    <span className="font-mono text-emerald-300 font-bold">96%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[96%]" />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-0.5">
                    <span className="text-emerald-100/70 font-sans">RESTful APIs &amp; RabbitMQ</span>
                    <span className="font-mono text-amber-300 font-bold">92%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full w-[92%]" />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-0.5">
                    <span className="text-emerald-100/70 font-sans">Databases (MySQL, Postgres, Mongo)</span>
                    <span className="font-mono text-sky-300 font-bold">90%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-500 to-sky-300 rounded-full w-[90%]" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300/80 font-serif italic">
                  <span>"Rooted in code, blooming in production."</span>
                  <span className="text-emerald-400">✦</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
