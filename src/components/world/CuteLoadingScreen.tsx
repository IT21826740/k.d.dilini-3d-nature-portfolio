import React from 'react';

interface CuteLoadingScreenProps {
  progress: number;
  statusText: string;
  isVisible: boolean;
}

export const CuteLoadingScreen: React.FC<CuteLoadingScreenProps> = ({
  progress,
  statusText,
  isVisible,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-[#09120e] transition-opacity duration-500 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Soft radial botanical glow */}
      <div
        aria-hidden="true"
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-emerald-500/12 blur-3xl pointer-events-none"
      />

      <div className="relative flex flex-col items-center text-center max-w-sm w-full">
        {/* Cute Animated Forest Seedling & Firefly Spirit SVG */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 mb-5 flex items-center justify-center animate-float-gentle">
          {/* Orbiting fireflies */}
          <span
            aria-hidden="true"
            className="absolute top-3 left-6 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_12px_#fcd34d] animate-firefly-orbit"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-8 right-4 w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7] animate-firefly-orbit"
            style={{ animationDelay: '0.9s' }}
          />
          <span
            aria-hidden="true"
            className="absolute top-9 right-7 w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_#fde68a] animate-firefly-orbit"
            style={{ animationDelay: '1.6s' }}
          />

          <svg
            viewBox="0 0 160 160"
            className="w-full h-full drop-shadow-[0_14px_24px_rgba(16,185,129,0.2)]"
            aria-hidden="true"
          >
            {/* Floating tiny mossy island */}
            <path
              d="M36 106 Q80 96 124 106 L106 134 Q80 144 54 134 Z"
              fill="#3f3833"
            />
            <ellipse cx="80" cy="105" rx="46" ry="11" fill="#4d8853" />
            <ellipse cx="80" cy="103" rx="38" ry="7.5" fill="#65a86a" />

            {/* Cute Leaf Spirit Body */}
            <g className="animate-sprout-sway">
              {/* Stem & Sprout Leaves */}
              <path
                d="M80 62 Q80 42 80 36"
                stroke="#34d399"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M80 42 Q63 29 58 41 Q67 52 80 46 Z"
                fill="#34d399"
              />
              <path
                d="M80 40 Q98 25 103 38 Q94 49 80 44 Z"
                fill="#6ee7b7"
              />

              {/* Chubby Mossy Spirit Body */}
              <ellipse cx="80" cy="84" rx="26" ry="23" fill="#d1fae5" />
              <ellipse cx="80" cy="88" rx="23" ry="18" fill="#a7f3d0" />

              {/* Cute Scarf */}
              <path
                d="M58 93 Q80 101 102 93 Q100 99 80 103 Q60 99 58 93 Z"
                fill="#f59e0b"
              />
              <rect x="88" y="95" width="7" height="12" rx="3" fill="#fbbf24" />

              {/* Cozy Eyes & Blush */}
              <circle cx="71" cy="80" r="3" fill="#064e3b" />
              <circle cx="89" cy="80" r="3" fill="#064e3b" />
              <circle cx="72" cy="79" r="1" fill="#ffffff" />
              <circle cx="90" cy="79" r="1" fill="#ffffff" />
              <ellipse cx="64" cy="85" rx="4" ry="2.2" fill="#fda4af" opacity="0.7" />
              <ellipse cx="96" cy="85" rx="4" ry="2.2" fill="#fda4af" opacity="0.7" />
              <path
                d="M76 85 Q80 89 84 85"
                stroke="#064e3b"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>
        </div>

        {/* Title & Status */}
        <p className="text-xs font-mono tracking-wider text-emerald-300/90 mb-1.5">
          K.D. Dilini Sanctuary
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#f4efe6] mb-2">
          Growing the Floating Island
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/75 mb-5 min-h-[20px]">
          {statusText}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#12221b] border border-emerald-500/25 rounded-full h-2.5 overflow-hidden mb-2.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 transition-all duration-300 ease-out"
            style={{ width: `${clamped}%` }}
          />
        </div>

        <div className="w-full flex items-center justify-between text-[11px] font-mono tabular-nums text-emerald-300/80 mb-6">
          <span>Preparing 3D terrain &amp; landmarks</span>
          <span>{clamped}%</span>
        </div>

        {/* Helpful Control Preview */}
        <div className="w-full rounded-2xl bg-[#0e1b15] border border-emerald-500/20 px-4 py-3 text-xs text-emerald-100/75 flex flex-col gap-1">
          <span className="font-medium text-emerald-200">How to Explore</span>
          <span className="hidden sm:inline">
            Walk with WASD or Arrow keys · Drag to orbit · Press E near landmarks
          </span>
          <span className="sm:hidden">
            Use the left thumb stick to walk · Swipe to look · Tap landmarks to inspect
          </span>
        </div>
      </div>
    </div>
  );
};
