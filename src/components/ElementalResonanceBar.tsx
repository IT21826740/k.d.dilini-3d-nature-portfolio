import React from 'react';
import { ELEMENT_THEMES } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';

interface ElementalResonanceBarProps {
  activeElement: string;
  onSelectElement: (element: string) => void;
  counts?: Record<string, number>;
}

export const ElementalResonanceBar: React.FC<ElementalResonanceBarProps> = ({
  activeElement,
  onSelectElement,
  counts,
}) => {
  const elements = Object.entries(ELEMENT_THEMES) as [keyof typeof ELEMENT_THEMES, typeof ELEMENT_THEMES['all']][];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-serif uppercase tracking-widest text-amber-400/80">
            Elemental Resonance Domain
          </span>
          <p className="text-xs text-amber-100/60 mt-0.5">
            Filter architectural systems & capabilities by their elemental alignment
          </p>
        </div>

        {/* Active Resonance Label */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1 rounded-full bg-[#131a29]/90 border border-amber-500/30 text-xs">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: ELEMENT_THEMES[activeElement as keyof typeof ELEMENT_THEMES]?.color || '#d4af37' }}
          />
          <span className="text-amber-200 font-medium">
            {ELEMENT_THEMES[activeElement as keyof typeof ELEMENT_THEMES]?.name || 'Omni Resonance'}
          </span>
        </div>
      </div>

      {/* Interactive Segmented Elemental Selector (Clean button elements complying with Section 1.A) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#0e1422]/90 border border-amber-500/20 rounded-xl overflow-x-auto scrollbar-none">
        {elements.map(([key, data]) => {
          const isActive = activeElement === key;
          const count = counts?.[key];

          return (
            <button
              key={key}
              onClick={() => {
                soundEngine.playElementalTone(key);
                onSelectElement(key);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-amber-200 border border-amber-400/50 shadow-sm shadow-amber-500/10'
                  : 'text-amber-100/60 hover:text-amber-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="text-sm" style={{ color: data.color }}>
                {data.icon}
              </span>
              <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              {typeof count === 'number' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-amber-200/80 font-mono">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
