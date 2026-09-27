import React from 'react';
import { Sparkles, Eye, Compass, Move, Volume2, VolumeX, Download, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { WorldInteractable, WORLD_INTERACTABLES } from '../../data/worldData';
import { walkAudio } from '../../utils/walkAudio';

interface WorldHUDProps {
  nearbyPoi: WorldInteractable | null;
  onOpenPoi: (poi: WorldInteractable) => void;
  onFastTravel: (poiId: string) => void;
  onOpenDownloadZip: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const WorldHUD: React.FC<WorldHUDProps> = ({
  nearbyPoi,
  onOpenPoi,
  onFastTravel,
  onOpenDownloadZip,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6">
      
      {/* TOP BAR: Explorer Header & Quick Controls */}
      <div className="flex items-center justify-between gap-4 pointer-events-auto">
        
        {/* Left: Traveler Identity & Current Status */}
        <div className="flex items-center gap-3 p-2.5 sm:px-4 sm:py-2 rounded-2xl bg-[#09130f]/85 border border-emerald-500/30 backdrop-blur-xl shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0">
            🍃
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-sm font-bold text-[#f4efe6]">K.D. Dilini</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-400/30">
                Explorer
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/70 font-sans hidden sm:block">
              Full Stack Java &amp; Spring Boot Sanctuary
            </p>
          </div>
        </div>

        {/* Right Action Icons: Audio toggle + Vercel/GitHub ZIP download */}
        <div className="flex items-center gap-2">
          {/* Audio Ambience Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-full border border-emerald-500/30 bg-[#09130f]/85 hover:bg-[#13271e] text-emerald-300 backdrop-blur-xl transition-all shadow-md cursor-pointer"
            title={isMuted ? 'Unmute Walking Sounds' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Download Vercel ZIP button */}
          <button
            onClick={onOpenDownloadZip}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#09120e] text-xs font-serif font-bold shadow-lg shadow-emerald-950/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download Vercel ZIP</span>
            <span className="sm:hidden">ZIP</span>
          </button>
        </div>

      </div>

      {/* CENTER PROXIMITY INTERACT PROMPT */}
      {nearbyPoi && (
        <div className="self-center pointer-events-auto animate-scale-up max-w-md w-full px-2">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#14261e]/95 via-[#0e1b15]/95 to-[#09120e]/95 border-2 border-emerald-400/70 backdrop-blur-xl shadow-2xl text-center space-y-2.5">
            
            <div className="flex items-center justify-center gap-2 text-xs font-serif font-bold uppercase tracking-wider text-emerald-300">
              <span className="text-base">{nearbyPoi.icon}</span>
              <span>{nearbyPoi.badge}</span>
              <span className="text-base">{nearbyPoi.icon}</span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#f4efe6]">
              {nearbyPoi.name}
            </h3>

            <p className="text-xs text-emerald-100/80 font-sans leading-relaxed">
              {nearbyPoi.previewSnippet}
            </p>

            <button
              onClick={() => {
                walkAudio.playDiscoveryChime(783.99);
                onOpenPoi(nearbyPoi);
              }}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#09120e] font-serif text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Inspect Details [Press E or Click]</span>
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS & FAST TRAVEL BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
        
        {/* Left: Walking controls guide */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#09130f]/85 border border-emerald-500/25 backdrop-blur-xl text-xs text-emerald-200/80">
          <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-300 font-bold">
            <span className="px-1.5 py-0.5 rounded bg-black/50 border border-emerald-500/30">W</span>
            <span className="px-1.5 py-0.5 rounded bg-black/50 border border-emerald-500/30">A</span>
            <span className="px-1.5 py-0.5 rounded bg-black/50 border border-emerald-500/30">S</span>
            <span className="px-1.5 py-0.5 rounded bg-black/50 border border-emerald-500/30">D</span>
          </div>
          <span>Walk</span>
          <span className="text-emerald-500/40">·</span>
          <span className="font-mono text-[10px] text-emerald-300 px-1.5 py-0.5 rounded bg-black/50 border border-emerald-500/30">Drag Mouse</span>
          <span>Rotate Camera</span>
        </div>

        {/* Right: Fast-Travel Landmark Compass (Jump anywhere on the island) */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#09130f]/90 border border-emerald-500/30 backdrop-blur-xl shadow-xl overflow-x-auto max-w-full scrollbar-none">
          <div className="flex items-center gap-1 text-[11px] font-serif text-emerald-400 px-2 shrink-0">
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fast Travel:</span>
          </div>
          {WORLD_INTERACTABLES.map((poi) => (
            <button
              key={poi.id}
              onClick={() => onFastTravel(poi.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif text-emerald-100/75 hover:text-emerald-200 hover:bg-emerald-500/20 border border-transparent hover:border-emerald-400/50 transition-all shrink-0 cursor-pointer"
            >
              <span>{poi.icon}</span>
              <span className="truncate max-w-[120px]">{poi.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

      </div>

    </div>
  );
};
