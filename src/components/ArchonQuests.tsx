import React, { useState, useMemo } from 'react';
import { ArrowUpRight, Star, Sparkles, Search } from 'lucide-react';
import { PROJECTS, Project, ELEMENT_THEMES } from '../data/portfolioData';
import { ElementalResonanceBar } from './ElementalResonanceBar';
import { soundEngine } from '../utils/audio';

interface ArchonQuestsProps {
  onSelectProject: (project: Project) => void;
  activeElement: string;
  onSelectElement: (element: string) => void;
}

export const ArchonQuests: React.FC<ArchonQuestsProps> = ({
  onSelectProject,
  activeElement,
  onSelectElement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Element counts for badges
  const elementCounts = useMemo(() => {
    const counts: Record<string, number> = { all: PROJECTS.length };
    PROJECTS.forEach((p) => {
      counts[p.element] = (counts[p.element] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((p) => {
      const matchesElement = activeElement === 'all' || p.element === activeElement;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.tagline.toLowerCase().includes(q);

      return matchesElement && matchesSearch;
    });
  }, [activeElement, searchQuery]);

  return (
    <section id="quests" className="relative py-16 lg:py-24 border-t border-amber-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-serif text-amber-400 tracking-widest uppercase mb-1">
              <span>Archon &amp; World Quests</span>
              <span aria-hidden="true">·</span>
              <span>14+ Verified Projects</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-100 tracking-tight">
              Selected Systems &amp; Projects
            </h2>
            <p className="text-sm text-amber-100/70 max-w-2xl mt-2 font-sans">
              From edge-AI smart glasses to high-throughput Spring AMQP microservices and enterprise management backends. Select any quest card to inspect full architectural flows.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-amber-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keyword, tag, or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#101625]/90 border border-amber-500/30 text-xs text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
            />
          </div>
        </div>

        {/* Elemental Resonance Domain Filter */}
        <div className="mb-8">
          <ElementalResonanceBar
            activeElement={activeElement}
            onSelectElement={onSelectElement}
            counts={elementCounts}
          />
        </div>

        {/* Quests Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#101625]/60 border border-amber-500/20">
            <Sparkles className="w-8 h-8 text-amber-400/50 mx-auto mb-2" />
            <h3 className="font-serif text-lg text-amber-200">No Quests Aligned with Current Filter</h3>
            <p className="text-xs text-amber-100/60 mt-1">
              Try resetting your search query or switching to Omni Resonance.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectElement('all');
              }}
              className="mt-4 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs text-amber-300 hover:bg-amber-500/30 font-serif"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((p) => {
              const elementTheme = ELEMENT_THEMES[p.element] || ELEMENT_THEMES.geo;
              const isFeature = p.size === 'feature';
              const isWide = p.size === 'wide';

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    soundEngine.playChime(659.25, 'sine', 0.2);
                    onSelectProject(p);
                  }}
                  className={`group relative text-left rounded-2xl bg-gradient-to-b from-[#131b2e] via-[#0f1523] to-[#0a0d17] border border-amber-500/25 hover:border-amber-400/80 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer overflow-hidden flex flex-col justify-between ${
                    isFeature ? 'md:col-span-2 lg:col-span-2' : isWide ? 'md:col-span-2 lg:col-span-3' : ''
                  }`}
                >
                  {/* Subtle Top Elemental Hairline */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: elementTheme.color }}
                  />

                  <div>
                    {/* Top Row: Category + Stars + Arrow */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-serif tracking-wider uppercase">
                          <span>{p.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center text-amber-400">
                            {[...Array(p.rarity)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </span>
                        </div>
                      </div>

                      <div className="w-7 h-7 rounded-full border border-amber-500/30 group-hover:border-amber-400 flex items-center justify-center text-amber-300 group-hover:text-amber-100 group-hover:bg-amber-500/20 transition-all shrink-0">
                        <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Quest Title */}
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-100 group-hover:text-amber-200 transition-colors leading-snug">
                      {p.title}
                    </h3>

                    {/* Tagline */}
                    <p className="text-xs sm:text-sm text-amber-100/70 font-sans mt-2 leading-relaxed">
                      {p.tagline}
                    </p>

                    {/* Feature Highlights on large cards */}
                    {(isFeature || isWide) && p.features && (
                      <div className="mt-4 pt-3 border-t border-amber-500/15 space-y-1">
                        {p.features.slice(0, 3).map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-amber-200/80">
                            <span className="text-amber-400 font-serif leading-none mt-0.5">✦</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Tags Row */}
                  <div className="mt-5 pt-3 border-t border-amber-500/15 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.slice(0, isFeature || isWide ? 6 : 4).map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded bg-black/40 text-amber-200/80 font-mono border border-amber-500/20"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <span className="text-[11px] font-serif font-semibold text-amber-400 group-hover:text-amber-300">
                      Open Dossier ↗
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
