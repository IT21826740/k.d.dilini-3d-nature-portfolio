import React, { useState } from 'react';
import { Sparkles, Terminal, Code2, Cpu, Wrench, CheckCircle2 } from 'lucide-react';
import { SKILL_CATEGORIES, SkillCategory } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';

export const TalentsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...SKILL_CATEGORIES.map((c) => c.label)];

  const filteredCategories = selectedCategory === 'All'
    ? SKILL_CATEGORIES
    : SKILL_CATEGORIES.filter((c) => c.label === selectedCategory);

  const getTalentType = (label: string) => {
    switch (label) {
      case 'Core Languages':
        return { type: 'Normal Attack', subtitle: 'Linguistic Arts: Polyglot Mastery', icon: Code2 };
      case 'Backend & APIs':
        return { type: 'Elemental Skill', subtitle: 'Spring Invocations: Architecture of Steel', icon: Terminal };
      case 'DevOps & Tooling':
        return { type: 'Elemental Burst', subtitle: 'Containerized Genesis: Production Resilience', icon: Cpu };
      default:
        return { type: 'Passive Talent', subtitle: 'Continuous Engineering Calibration', icon: Wrench };
    }
  };

  return (
    <section id="talents" className="relative py-16 lg:py-24 border-t border-amber-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-serif text-amber-400 tracking-widest uppercase mb-1">
              <span>Talents &amp; Constellations</span>
              <span aria-hidden="true">·</span>
              <span>30+ Technologies Mastered</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-100 tracking-tight">
              Combat Talents &amp; Technical Stacks
            </h2>
            <p className="text-sm text-amber-100/70 max-w-2xl mt-2 font-sans">
              Specialized skill trees spanning Java &amp; Spring Boot enterprise backends, testing disciplines, distributed message queues, and cloud infrastructure.
            </p>
          </div>

          {/* Category Tabs (Interactive buttons complying with Section 1.A) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#101625]/90 border border-amber-500/25 rounded-xl overflow-x-auto scrollbar-none self-start md:self-auto">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    soundEngine.playChime(783.99, 'sine', 0.15);
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-400/60 font-semibold'
                      : 'text-amber-100/60 hover:text-amber-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Talent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCategories.map((group) => {
            const meta = getTalentType(group.label);
            const Icon = meta.icon;

            return (
              <div
                key={group.label}
                className="rounded-2xl bg-gradient-to-b from-[#131b2e] via-[#0f1523] to-[#0a0d17] border border-amber-500/25 p-6 hover:border-amber-400/60 transition-all duration-300 shadow-lg relative overflow-hidden"
              >
                {/* Talent Category Header */}
                <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-amber-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/50 flex items-center justify-center text-amber-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                        {meta.type}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-amber-100">
                        {group.label}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-amber-300/80 px-2 py-0.5 rounded bg-black/40 border border-amber-500/20">
                    {group.items.length} Skills
                  </span>
                </div>

                <p className="text-xs text-amber-100/60 font-sans mb-4">
                  {group.description}
                </p>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d18]/80 border border-amber-500/20 hover:border-amber-400/50 hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Tech Icon */}
                        <div className="w-7 h-7 rounded-lg bg-black/40 border border-amber-500/30 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          <img
                            src={`https://skillicons.dev/icons?i=${item.slug}&theme=light`}
                            alt={`${item.name} icon`}
                            className="w-5 h-5 object-contain"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.innerHTML = `<span class="text-[10px] font-bold text-amber-300">${item.name.charAt(0)}</span>`;
                              }
                            }}
                          />
                        </div>

                        <span className="text-xs font-medium text-amber-100 group-hover:text-amber-200 truncate">
                          {item.name}
                        </span>
                      </div>

                      {/* Mastery Gauge */}
                      <div className="flex items-center gap-1.5 shrink-0 pl-2">
                        <span className="text-[10px] font-mono text-amber-400 font-semibold">
                          Lv.{item.level}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
