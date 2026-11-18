import React, { useRef, useState } from 'react';
import { Eye, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { WorldInteractable } from '../../data/worldData';

export interface JoystickVector {
  x: number; // -1 (left) to +1 (right)
  y: number; // -1 (backward) to +1 (forward)
}

interface TouchControlsProps {
  visible: boolean;
  joystickRef: React.MutableRefObject<JoystickVector>;
  nearbyPoi: WorldInteractable | null;
  onInspectNearby: (poi: WorldInteractable) => void;
  onAdjustZoom: (delta: number) => void;
  onResetCamera: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  visible,
  joystickRef,
  nearbyPoi,
  onInspectNearby,
  onAdjustZoom,
  onResetCamera,
}) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const activePointerId = useRef<number | null>(null);
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  if (!visible) return null;

  const maxRadius = 38;

  const updateStickFromPointer = (clientX: number, clientY: number) => {
    const baseEl = baseRef.current;
    if (!baseEl) return;
    const rect = baseEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    // Apply tiny deadzone (12%) so resting thumb doesn't drift character
    const normX = dx / maxRadius;
    const normY = -dy / maxRadius; // Up on screen = +1 forward
    const mag = Math.hypot(normX, normY);

    if (mag < 0.12) {
      joystickRef.current.x = 0;
      joystickRef.current.y = 0;
    } else {
      joystickRef.current.x = Math.max(-1, Math.min(1, normX));
      joystickRef.current.y = Math.max(-1, Math.min(1, normY));
    }

    setKnobOffset({ x: dx, y: dy });
  };

  const resetStick = () => {
    activePointerId.current = null;
    joystickRef.current.x = 0;
    joystickRef.current.y = 0;
    setKnobOffset({ x: 0, y: 0 });
    setIsActive(false);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (activePointerId.current !== null) return;
    activePointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsActive(true);
    updateStickFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    e.stopPropagation();
    updateStickFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    e.stopPropagation();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    resetStick();
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[76px] sm:bottom-[84px] z-30 flex items-end justify-between px-4 sm:px-6 pb-safe">
      {/* LEFT THUMB ZONE: Virtual Analog Walk Joystick */}
      <div className="pointer-events-auto flex flex-col items-center gap-1.5">
        <div
          ref={baseRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={resetStick}
          role="slider"
          aria-label="Walk movement joystick"
          aria-valuetext={isActive ? 'Moving' : 'Idle'}
          tabIndex={0}
          className={`relative w-28 h-28 rounded-full touch-none select-none flex items-center justify-center border transition-colors ${
            isActive
              ? 'bg-[#0c1d15]/85 border-emerald-400/70 shadow-[0_0_24px_rgba(16,185,129,0.25)]'
              : 'bg-[#09130f]/75 border-emerald-500/35'
          }`}
        >
          {/* Subtle crosshairs */}
          <div aria-hidden="true" className="absolute inset-3 rounded-full border border-emerald-400/15" />
          <span aria-hidden="true" className="absolute top-1.5 text-[9px] font-mono text-emerald-300/60">
            N
          </span>
          <span aria-hidden="true" className="absolute bottom-1.5 text-[9px] font-mono text-emerald-300/60">
            S
          </span>
          <span aria-hidden="true" className="absolute left-2 text-[9px] font-mono text-emerald-300/60">
            W
          </span>
          <span aria-hidden="true" className="absolute right-2 text-[9px] font-mono text-emerald-300/60">
            E
          </span>

          {/* Movable Thumb Knob */}
          <div
            style={{
              transform: `translate3d(${knobOffset.x}px, ${knobOffset.y}px, 0)`,
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-shadow ${
              isActive
                ? 'bg-gradient-to-br from-emerald-400 to-teal-300 text-[#09120e] shadow-emerald-500/40'
                : 'bg-[#173226] border border-emerald-400/50 text-emerald-200'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-current opacity-80" />
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-200/70 bg-[#09130f]/80 px-2 py-0.5 rounded-md">
          Walk Stick
        </span>
      </div>

      {/* RIGHT THUMB ZONE: Camera Zoom / Reset & Quick Inspect CTA */}
      <div className="pointer-events-auto flex flex-col items-end gap-2.5">
        {nearbyPoi && (
          <button
            type="button"
            onClick={() => onInspectNearby(nearbyPoi)}
            className="min-h-[46px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[#09120e] font-bold text-xs shadow-xl shadow-emerald-950/60 active:scale-95 transition-transform cursor-pointer"
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Inspect {nearbyPoi.name.split(' ')[0]}</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#09130f]/80 border border-emerald-500/30">
          <button
            type="button"
            onClick={() => onAdjustZoom(-0.15)}
            aria-label="Zoom camera in"
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-emerald-200 hover:bg-emerald-500/20 active:scale-95 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onAdjustZoom(0.15)}
            aria-label="Zoom camera out"
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-emerald-200 hover:bg-emerald-500/20 active:scale-95 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onResetCamera}
            aria-label="Reset camera angle"
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-emerald-200 hover:bg-emerald-500/20 active:scale-95 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
