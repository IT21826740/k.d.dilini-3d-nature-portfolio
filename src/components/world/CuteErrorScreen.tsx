import React from 'react';
import { RefreshCw, Compass, AlertTriangle } from 'lucide-react';

export type SanctuaryErrorKind = 'webgl-unsupported' | 'context-lost' | 'runtime';

interface CuteErrorScreenProps {
  kind: SanctuaryErrorKind;
  message?: string;
  onRetry?: () => void;
  onOpen2DExplorer?: () => void;
}

const ERROR_COPY: Record<
  SanctuaryErrorKind,
  { badge: string; title: string; subtitle: string }
> = {
  'webgl-unsupported': {
    badge: 'Graphics Unavailable',
    title: 'The 3D Island Is Taking a Nap',
    subtitle:
      'WebGL hardware acceleration appears disabled or unsupported in this browser. You can retry or browse every project, skill, and certificate in 2D Sanctuary Mode.',
  },
  'context-lost': {
    badge: 'WebGL Context Interrupted',
    title: 'Our Fireflies Lost Their Spark',
    subtitle:
      'Your device briefly paused 3D graphics memory. Tap Wake Sanctuary below to restore the island right where you left off.',
  },
  runtime: {
    badge: 'Unexpected Glitch',
    title: 'A Stray Leaf Tripped the Trail',
    subtitle:
      'Something unexpected happened while rendering the world. You can reload the sanctuary or continue straight into 2D Sanctuary Mode.',
  },
};

export const CuteErrorScreen: React.FC<CuteErrorScreenProps> = ({
  kind,
  message,
  onRetry,
  onOpen2DExplorer,
}) => {
  const copy = ERROR_COPY[kind];

  return (
    <div
      role="alert"
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-[#09120e] text-[#f4efe6] overflow-y-auto"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#0e1b15] border border-emerald-500/30 p-6 sm:p-8 shadow-2xl text-center">
        {/* Cute Sleepy Lantern Spirit SVG */}
        <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center animate-float-gentle">
          <svg viewBox="0 0 140 140" className="w-full h-full" aria-hidden="true">
            {/* Soft Moss Cushion */}
            <ellipse cx="70" cy="112" rx="44" ry="12" fill="#234432" />
            <ellipse cx="70" cy="109" rx="36" ry="8" fill="#3b734f" />

            {/* Sleepy Spirit */}
            <ellipse cx="70" cy="83" rx="26" ry="23" fill="#d1fae5" />
            <ellipse cx="70" cy="87" rx="22" ry="17" fill="#a7f3d0" />

            {/* Little Drooping Leaf */}
            <path
              d="M70 61 Q66 47 54 44"
              stroke="#34d399"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M55 44 Q42 40 43 52 Q52 57 59 48 Z"
              fill="#34d399"
            />

            {/* Tiny Band-aid / Patch */}
            <rect
              x="81"
              y="66"
              width="12"
              height="6"
              rx="2"
              transform="rotate(22 87 69)"
              fill="#fde68a"
            />

            {/* Sleepy Closed Eyes */}
            <path
              d="M57 82 Q62 86 67 82"
              stroke="#064e3b"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M75 82 Q80 86 85 82"
              stroke="#064e3b"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Tiny O mouth */}
            <circle cx="71" cy="90" r="2.3" fill="#064e3b" />

            {/* Floating Zzz */}
            <text
              x="98"
              y="55"
              fill="#fcd34d"
              fontSize="12"
              fontFamily="monospace"
              fontWeight="bold"
            >
              z
            </text>
            <text
              x="108"
              y="44"
              fill="#6ee7b7"
              fontSize="15"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Z
            </text>
          </svg>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 mb-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{copy.badge}</span>
        </div>

        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#f4efe6] mb-2">
          {copy.title}
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100/75 leading-relaxed mb-4">
          {copy.subtitle}
        </p>

        {message && (
          <p className="text-[11px] font-mono text-emerald-200/70 bg-[#09120e] border border-emerald-500/20 rounded-xl px-3 py-2 mb-5 break-words">
            {message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#09120e] text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span>Wake Sanctuary</span>
            </button>
          )}
          {onOpen2DExplorer && (
            <button
              type="button"
              onClick={onOpen2DExplorer}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#13261d] hover:bg-[#193327] border border-emerald-500/40 text-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Open 2D Portfolio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onOpen2DExplorer: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class SanctuaryErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unknown rendering error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <CuteErrorScreen
          kind="runtime"
          message={this.state.errorMessage}
          onRetry={() => {
            this.setState({ hasError: false, errorMessage: '' });
          }}
          onOpen2DExplorer={this.props.onOpen2DExplorer}
        />
      );
    }
    return this.props.children;
  }
}
