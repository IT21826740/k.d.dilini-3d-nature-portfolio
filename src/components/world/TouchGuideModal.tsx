import React from 'react';
import { X, Smartphone, Compass, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { WORLD_INTERACTABLES, WorldInteractable } from '../../data/worldData';

interface TouchGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPoi: (poi: WorldInteractable) => void;
}

export const TouchGuideModal: React.FC<TouchGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenPoi,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Touch Controls and Responsive 3D Guide"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/80 animate-fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[92dvh] sm:max-h-[88vh] bg-[#0d1914] border border-emerald-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto overscroll-contain touch-pan-y">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-5 py-4 sm:px-7 bg-[#0d1914]/95 border-b border-emerald-500/20">
          <div>
            <p className="text-xs font-mono text-emerald-400">
              Explorer Handbook &amp; Architecture
            </p>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#f4efe6]">
              2D Sanctuary Index &amp; Touch Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guide"
            className="min-w-[44px] min-h-[44px] rounded-xl border border-emerald-500/30 bg-[#13241c] text-emerald-200 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-7 pb-safe">
          {/* Quick 2D Landmark Index (Accessible even without 3D) */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <Compass className="w-4 h-4" />
              <span>Direct Landmark Directory</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WORLD_INTERACTABLES.map((poi) => (
                <button
                  key={poi.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPoi(poi);
                  }}
                  className="min-h-[56px] p-3.5 rounded-2xl bg-[#09120e] border border-emerald-500/25 hover:border-emerald-400/70 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <span>{poi.icon}</span>
                      <span>{poi.badge}</span>
                    </div>
                    <p className="font-serif text-sm font-bold text-[#f4efe6] truncate mt-0.5">
                      {poi.name}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </section>

          {/* Touch Controls & Responsive Three.js Guide */}
          <section className="space-y-4 border-t border-emerald-500/20 pt-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <Smartphone className="w-4 h-4" />
              <span>Touch Controls &amp; Responsive Three.js Guide</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              <div className="p-4 rounded-2xl bg-[#09120e] border border-emerald-500/20 space-y-1.5">
                <h3 className="font-serif text-base font-bold text-emerald-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1. Analog Thumb Joystick with Pointer Capture</span>
                </h3>
                <p>
                  Instead of legacy touch events, bind <code className="font-mono text-emerald-300">onPointerDown/Move/Up</code> with <code className="font-mono text-emerald-300">setPointerCapture</code> and CSS <code className="font-mono text-emerald-300">touch-none</code>. Store the normalized <code className="font-mono text-emerald-300">{`{ x, y }`}</code> vector in a mutable <code className="font-mono text-emerald-300">useRef</code> with a 12% deadzone so walking never triggers React re-renders per frame.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#09120e] border border-emerald-500/20 space-y-1.5">
                <h3 className="font-serif text-base font-bold text-emerald-200">
                  2. Multi-Touch Camera Orbit, Pinch-Zoom &amp; Tap Raycast
                </h3>
                <p>
                  Track active pointers in a <code className="font-mono text-emerald-300">Map&lt;pointerId, Point&gt;</code> on the canvas element. One active finger rotates camera yaw/pitch, two fingers compute Euclidean distance changes for smooth pinch-to-zoom, and short taps (&lt; 9px drag) raycast against simplified Layer-1 landmark hitboxes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#09120e] border border-emerald-500/20 space-y-1.5">
                <h3 className="font-serif text-base font-bold text-emerald-200">
                  3. Aspect-Adaptive FOV &amp; 100dvh Viewport Scaling
                </h3>
                <p>
                  Use <code className="font-mono text-emerald-300">100dvh</code> with <code className="font-mono text-emerald-300">ResizeObserver</code> so mobile browser toolbars never crop controls. On portrait screens (<code className="font-mono text-emerald-300">aspect &lt; 1</code>), widen vertical FOV up to 70° and pull back camera distance smoothly so the island stays framed.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#09120e] border border-emerald-500/20 space-y-1.5">
                <h3 className="font-serif text-base font-bold text-emerald-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>4. Fixing Stuck Movement Keys &amp; Camera-Basis Glitches</span>
                </h3>
                <p>
                  Track physical <code className="font-mono text-emerald-300">KeyboardEvent.code</code>, clear active keys on <code className="font-mono text-emerald-300">window.blur</code>, <code className="font-mono text-emerald-300">visibilitychange</code>, and modal open states, clamp frame <code className="font-mono text-emerald-300">delta &lt;= 0.05s</code>, and project movement onto the camera&apos;s true <code className="font-mono text-emerald-300">forward</code> and <code className="font-mono text-emerald-300">right</code> XZ basis vectors.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
