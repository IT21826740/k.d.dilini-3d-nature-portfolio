import React, { useState, useMemo } from 'react';
import { ArrowUpRight, Search, Sparkles, Filter, Leaf } from 'lucide-react';
import { PROJECTS, Project, ELEMENT_THEMES } from '../data/portfolioData';
import { natureAudio } from '../utils/natureAudio';

interface ProjectsShowcaseProps {
  onSelectProject: (project: Project) => void;
}

export const ProjectsShowcase: React.FC<ProjectsShowcaseProps> = ({ onSelectProject }) => {
  const [selectedElement, setSelectedElement] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const elementsList = Object.entries(ELEMENT_THEMES);

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((p) => {
      const matchesElement = selectedElement === 'all' || p.element === selectedElement;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.tagline.toLowerCase().includes(q);

      return matchesElement && matchesSearch;
    });
  }, [selectedElement, searchQuery]);

  return (
    <section id="projects" className="relative py-16 lg:py-24 border-t border-emerald-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-serif text-emerald-400 tracking-widest uppercase mb-1">
              <span>Nature Biomes of Innovation</span>
              <span aria-hidden="true">·</span>
              <span>14+ Verified Projects</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#f4efe6] tracking-tight">
              Selected Projects &amp; Systems
            </h2>
            <p className="text-sm text-emerald-100/70 max-w-2xl mt-2 font-sans">
              From edge-AI smart glasses to high-throughput Spring AMQP microservices and enterprise management backends. Click any project card to open its detailed blueprint.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by tech, keyword, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#102018]/90 border border-emerald-500/30 text-xs text-emerald-100 placeholder-emerald-100/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
            />
          </div>
        </div>

        {/* Nature Element Filtering Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#0e1913]/90 border border-emerald-500/25 rounded-2xl mb-8 overflow-x-auto scrollbar-none">
          {elementsList.map(([key, data]) => {
            const isActive = selectedElement === key;
            const count = key === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.element === key).length;

            return (
              <button
                key={key}
                onClick={() => {
                  natureAudio.playWaterDrop();
                  setSelectedElement(key);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-serif whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/15 text-emerald-200 border border-emerald-400/60 shadow-sm font-semibold'
                    : 'text-emerald-100/60 hover:text-emerald-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="text-sm" style={{ color: data.color }}>
                  {data.icon}
                </span>
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-emerald-200/80 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Projects Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0f1d17]/60 border border-emerald-500/20">
            <Leaf className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
            <h3 className="font-serif text-lg text-emerald-200">No Projects Found</h3>
            <p className="text-xs text-emerald-100/60 mt-1">
              Try adjusting your search query or reset to view all elemental biomes.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedElement('all');
              }}
              className="mt-4 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs text-emerald-300 font-serif hover:bg-emerald-500/30"
            >
              Reset Filters
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
                    natureAudio.playBell(659.25, 0.4);
                    onSelectProject(p);
                  }}
                  className={`group relative text-left rounded-2xl bg-gradient-to-b from-[#13221b] via-[#0f1b15] to-[#09120e] border border-emerald-500/25 hover:border-emerald-400/80 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-950/50 cursor-pointer overflow-hidden flex flex-col justify-between ${
                    isFeature ? 'md:col-span-2 lg:col-span-2' : isWide ? 'md:col-span-2 lg:col-span-3' : ''
                  }`}
                >
                  {/* Top Nature Accent Line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: elementTheme.color }}
                  />

                  <div>
                    {/* Header: Category + Icon */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-serif tracking-wider uppercase">
                        <span>{p.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-emerald-300/80">{p.badge}</span>
                      </div>

                      <div className="w-7 h-7 rounded-full border border-emerald-500/30 group-hover:border-emerald-400 flex items-center justify-center text-emerald-300 group-hover:text-emerald-100 group-hover:bg-emerald-500/20 transition-all shrink-0">
                        <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#f4efe6] group-hover:text-emerald-200 transition-colors leading-snug">
                      {p.title}
                    </h3>

                    {/* Tagline */}
                    <p className="text-xs sm:text-sm text-emerald-100/70 font-sans mt-2 leading-relaxed">
                      {p.tagline}
                    </p>

                    {/* Feature bullet list on expanded cards */}
                    {(isFeature || isWide) && p.features && (
                      <div className="mt-4 pt-3 border-t border-emerald-500/15 space-y-1">
                        {p.features.slice(0, 3).map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-emerald-200/80">
                            <span className="text-emerald-400 font-serif leading-none mt-0.5">🍃</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Tags */}
                  <div className="mt-5 pt-3 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.slice(0, isFeature || isWide ? 6 : 4).map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-black/40 text-emerald-200/80 font-mono border border-emerald-500/20"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <span className="text-[11px] font-serif font-semibold text-emerald-400 group-hover:text-emerald-300">
                      Open Blueprint ↗
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
