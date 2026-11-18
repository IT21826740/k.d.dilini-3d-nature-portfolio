import React from 'react';
import { Sun, Sunrise, Sunset, Moon, Clock, X } from 'lucide-react';
import {
  CycleMode,
  DayPhase,
  SampledAtmosphere,
  formatHourLabel,
} from '../../utils/dayNightCycle';

interface DayNightOverlayProps {
  atmosphere: SampledAtmosphere;
  mode: CycleMode;
  isPanelOpen: boolean;
  onClosePanel: () => void;
  onSelectMode: (mode: CycleMode) => void;
  onScrubHour: (hour: number) => void;
}

export function getPhaseIcon(phase: DayPhase, className = 'w-4 h-4') {
  switch (phase) {
    case 'dawn':
      return <Sunrise className={className} />;
    case 'day':
      return <Sun className={className} />;
    case 'dusk':
      return <Sunset className={className} />;
    case 'night':
    default:
      return <Moon className={className} />;
  }
}

export const DayNightOverlay: React.FC<DayNightOverlayProps> = ({
  atmosphere,
  mode,
  isPanelOpen,
  onClosePanel,
  onSelectMode,
  onScrubHour,
}) => {
  const presets: Array<{
    id: Exclude<CycleMode, 'custom'>;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'auto', label: 'Local', icon: <Clock className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'dawn', label: 'Dawn', icon: <Sunrise className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'day', label: 'Day', icon: <Sun className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'dusk', label: 'Dusk', icon: <Sunset className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'night', label: 'Night', icon: <Moon className="w-3.5 h-3.5 shrink-0" /> },
  ];

  return (
    <>
      {/* Subtle Screen Atmosphere Tint Overlay synced with Local Time */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-10 transition-colors duration-700"
        style={{ background: atmosphere.overlayGradient }}
      />

      {/* Compact Day/Night Cycle Control Overlay */}
      {isPanelOpen && (
        <div
          role="dialog"
          aria-label="Day and night atmosphere controls"
          className="fixed bottom-[86px] sm:bottom-[92px] left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-1.5rem)] max-w-md pointer-events-auto animate-scale-up pb-safe"
        >
          <div className="rounded-2xl bg-[#09130f]/95 border border-emerald-500/35 shadow-2xl p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-amber-300 shrink-0">
                  {getPhaseIcon(atmosphere.phase, 'w-4 h-4')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#f4efe6] truncate">
                      {atmosphere.phaseLabel}
                    </h3>
                    <span className="text-xs font-mono tabular-nums text-emerald-300/90">
                      {formatHourLabel(atmosphere.hour)}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/70 tabular-nums truncate">
                    {mode === 'auto' ? 'Synced to your local time' : 'Manual time preview'} · Ambient {atmosphere.ambientPercent}%
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClosePanel}
                aria-label="Close atmosphere overlay"
                className="min-w-[40px] min-h-[40px] rounded-xl bg-[#11221a] hover:bg-[#193327] border border-emerald-500/25 text-emerald-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-5 gap-1.5 mb-3.5">
              {presets.map((preset) => {
                const isActive = mode === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectMode(preset.id)}
                    className={`min-h-[42px] px-2 py-1.5 rounded-xl text-xs font-medium flex flex-col sm:flex-row items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-500/25 border border-emerald-400/60 text-emerald-100'
                        : 'bg-[#0e1c16] hover:bg-[#14281f] border border-emerald-500/20 text-emerald-200/80'
                    }`}
                  >
                    {preset.icon}
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 24-Hour Time Scrubber */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-emerald-200/75">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
              <input
                type="range"
                min={0}
                max={23.95}
                step={0.05}
                value={atmosphere.hour}
                onChange={(e) => onScrubHour(parseFloat(e.target.value))}
                aria-label="Time of day slider"
                className="w-full h-2.5 rounded-full accent-emerald-400 bg-[#12261d] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
