import React, { useState } from 'react';
import {
  Eye,
  Compass,
  Volume2,
  VolumeX,
  Download,
  Gamepad2,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WorldInteractable, WORLD_INTERACTABLES } from '../../data/worldData';
import { walkAudio } from '../../utils/walkAudio';

interface WorldHUDProps {
  nearbyPoi: WorldInteractable | null;
  onOpenPoi: (poi: WorldInteractable) => void;
  onFastTravel: (poiId: string) => void;
  onOpenDownloadZip: () => void;
  onOpenGuide: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showTouchControls: boolean;
  onToggleTouchControls: () => void;
}

export const WorldHUD: React.FC<WorldHUDProps> = ({
  nearbyPoi,
  onOpenPoi,
  onFastTravel,
  onOpenDownloadZip,
  onOpenGuide,
  isMuted,
  onToggleMute,
  showTouchControls,
  onToggleTouchControls,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 pt-safe pb-safe">
      {/* TOP BAR: Compact Brand Identity & Action Controls */}
      <header className="flex items-center justify-between gap-2 sm:gap-4 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3 py-2 sm:px-4 rounded-2xl bg-[#09130f]/92 border border-emerald-500/30 shadow-lg min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-sm shrink-0">
            🍃
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm sm:text-base font-bold text-[#f4efe6] truncate">
                K.D. Dilini
              </span>
              <span className="hidden md:inline text-xs text-emerald-300/80 font-sans whitespace-nowrap">
                · Java &amp; Spring Boot
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/70 font-sans hidden lg:block truncate">
              Walkable 3D Nature Portfolio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleTouchControls}
            aria-pressed={showTouchControls}
            title={showTouchControls ? 'Hide Touch Joystick' : 'Show Touch Joystick'}
            className={`min-w-[44px] min-h-[44px] inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              showTouchControls
                ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200'
                : 'bg-[#09130f]/92 border-emerald-500/30 text-emerald-300 hover:bg-[#13271e]'
            }`}
          >
            <Gamepad2 className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">Touch Pad</span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            title="Controls & Responsive 3D Guide"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-xl border border-emerald-500/30 bg-[#09130f]/92 hover:bg-[#13271e] text-emerald-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">Guide</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="min-w-[44px] min-h-[44px] rounded-xl border border-emerald-500/30 bg-[#09130f]/92 hover:bg-[#13271e] text-emerald-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenDownloadZip}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#09120e] text-xs font-bold shadow-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Export ZIP</span>
          </button>
        </div>
      </header>

      {/* BOTTOM REGION: Non-Occluding Proximity Card + Collapsible Fast-Travel Dock */}
      <div className="flex flex-col items-center gap-2.5 pointer-events-none">
        {/* Proximity Banner (positioned cleanly above dock so center 3D avatar stays clear) */}
        {nearbyPoi && !showTouchControls && (
          <div className="pointer-events-auto animate-scale-up w-full max-w-md px-1">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0b1812]/95 border border-emerald-400/60 shadow-2xl flex items-center justify-between gap-3">
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300">
                  <span>{nearbyPoi.icon}</span>
                  <span className="truncate">{nearbyPoi.badge}</span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#f4efe6] truncate">
                  {nearbyPoi.name}
                </h3>
                <p className="text-xs text-emerald-100/75 line-clamp-1">
                  {nearbyPoi.previewSnippet}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  walkAudio.playDiscoveryChime(783.99);
                  onOpenPoi(nearbyPoi);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#09120e] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>Inspect</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Bottom Dock */}
        <div className="pointer-events-auto flex flex-col items-center w-full max-w-4xl">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            className="mb-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-t-xl bg-[#09130f]/92 border border-b-0 border-emerald-500/30 text-[11px] font-medium text-emerald-300/90 hover:text-emerald-100 transition-colors cursor-pointer"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Landmarks</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Dock</span>
              </>
            )}
          </button>

          {!dockCollapsed && (
            <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#09130f]/92 border border-emerald-500/30 shadow-xl">
              {/* Desktop Keyboard Legend */}
              <div className="hidden lg:flex items-center gap-2.5 px-3 text-xs text-emerald-200/80 shrink-0">
                <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-300 font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-black/50 border border-emerald-500/30">W</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/50 border border-emerald-500/30">A</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/50 border border-emerald-500/30">S</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/50 border border-emerald-500/30">D</span>
                </div>
                <span className="whitespace-nowrap">Walk</span>
                <span className="text-emerald-500/40" aria-hidden="true">·</span>
                <span className="whitespace-nowrap text-emerald-100/75">Drag / Scroll Zoom</span>
                <span className="text-emerald-500/40" aria-hidden="true">·</span>
                <span className="whitespace-nowrap text-emerald-100/75">E Inspect</span>
              </div>

              {/* Fast-Travel Landmark Strip (Horizontally scrollable & snap-aligned on mobile) */}
              <nav
                aria-label="Fast travel landmarks"
                className="flex items-center gap-1.5 overflow-x-auto max-w-full w-full lg:w-auto scrollbar-none snap-x px-1"
              >
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 px-1.5 shrink-0">
                  <Compass className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline whitespace-nowrap">Travel:</span>
                </div>
                {WORLD_INTERACTABLES.map((poi) => {
                  const isActive = nearbyPoi?.id === poi.id;
                  return (
                    <button
                      key={poi.id}
                      type="button"
                      onClick={() => onFastTravel(poi.id)}
                      className={`snap-start min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-500/25 border border-emerald-400/60 text-emerald-100'
                          : 'text-emerald-100/80 hover:text-emerald-100 hover:bg-emerald-500/15 border border-transparent'
                      }`}
                    >
                      <span>{poi.icon}</span>
                      <span>{poi.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
