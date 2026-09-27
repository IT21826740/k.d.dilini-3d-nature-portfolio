import React, { useState } from 'react';
import { Terminal, Code2, Cpu, Wrench, CheckCircle2 } from 'lucide-react';
import { SKILL_CATEGORIES } from '../data/portfolioData';
import { natureAudio } from '../utils/natureAudio';

export const SkillsGarden: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...SKILL_CATEGORIES.map((c) => c.label)];

  const filteredCategories =
    selectedCategory === 'All'
      ? SKILL_CATEGORIES
      : SKILL_CATEGORIES.filter((c) => c.label === selectedCategory);

  const getGardenFlora = (label: string) => {
    switch (label) {
      case 'Core Languages':
        return { icon: Code2, flora: 'Ancient Roots', desc: 'Core programming languages powering logic' };
      case 'Backend & APIs':
        return { icon: Terminal, flora: 'Ironwood Trunk', desc: 'Spring Boot, Security & distributed event pipelines' };
      case 'DevOps & Tooling':
        return { icon: Cpu, flora: 'Highland Canopy', desc: 'Containerization, automation & CI/CD workflows' };
      default:
        return { icon: Wrench, flora: 'Blooming Blossom', desc: 'Testing, databases & quality assurance' };
    }
  };

  return (
    <section id="skills" className="relative py-16 lg:py-24 border-t border-emerald-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-serif text-emerald-400 tracking-widest uppercase mb-1">
              <span>Botanical Skill Trees</span>
              <span aria-hidden="true">·</span>
              <span>30+ Technologies</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#f4efe6] tracking-tight">
              The Living Skills Garden
            </h2>
            <p className="text-sm text-emerald-100/70 max-w-2xl mt-2 font-sans">
              Carefully cultivated capabilities spanning enterprise Java &amp; Spring Boot microservices, automated testing, databases, and edge IoT devices.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#102018]/90 border border-emerald-500/25 rounded-xl overflow-x-auto scrollbar-none self-start md:self-auto">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    natureAudio.playWaterDrop();
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/60 font-semibold'
                      : 'text-emerald-100/60 hover:text-emerald-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCategories.map((group) => {
            const meta = getGardenFlora(group.label);
            const Icon = meta.icon;

            return (
              <div
                key={group.label}
                className="rounded-2xl bg-gradient-to-b from-[#13221b] via-[#0f1b15] to-[#09120e] border border-emerald-500/25 p-6 hover:border-emerald-400/60 transition-all duration-300 shadow-lg relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-emerald-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
                        {meta.flora}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#f4efe6]">
                        {group.label}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-300/80 px-2 py-0.5 rounded bg-black/40 border border-emerald-500/20">
                    {group.items.length} Skills
                  </span>
                </div>

                <p className="text-xs text-emerald-100/60 font-sans mb-4">
                  {group.description}
                </p>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#08120e]/85 border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Tech Icon */}
                        <div className="w-7 h-7 rounded-lg bg-black/40 border border-emerald-500/30 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          <img
                            src={`https://skillicons.dev/icons?i=${item.slug}&theme=light`}
                            alt={`${item.name} icon`}
                            className="w-5 h-5 object-contain"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.innerHTML = `<span class="text-[10px] font-bold text-emerald-300">${item.name.charAt(0)}</span>`;
                              }
                            }}
                          />
                        </div>

                        <span className="text-xs font-medium text-emerald-100 group-hover:text-emerald-200 truncate">
                          {item.name}
                        </span>
                      </div>

                      {/* Mastery badge */}
                      <div className="flex items-center gap-1.5 shrink-0 pl-2">
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                          {item.level}%
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
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
