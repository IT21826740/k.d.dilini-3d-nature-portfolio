import React, { useState, useEffect } from 'react';
import { Download, Check, FileCode, Globe, X } from 'lucide-react';
import { generateProjectZip } from '../utils/exportZip';
import { natureAudio } from '../utils/natureAudio';

interface DownloadZipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadZipModal: React.FC<DownloadZipModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      setProgress(15);
      natureAudio.playBell(587.33, 0.6);

      const zipBlob = await generateProjectZip((p) => {
        setProgress(p);
      });

      setProgress(100);
      setDownloadComplete(true);
      natureAudio.playBell(783.99, 1.2);

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dilini-3d-nature-portfolio.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Download Full Project ZIP"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 animate-fade-in"
    >
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] bg-gradient-to-b from-[#13221b] via-[#0f1b15] to-[#09120e] border border-emerald-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto overscroll-contain touch-pan-y">
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-5 py-3.5 sm:px-7 bg-[#12211a]/95 border-b border-emerald-500/20">
          <span className="text-xs font-mono text-emerald-400">
            Complete Project Export
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close download modal"
            className="min-w-[44px] min-h-[44px] rounded-xl border border-emerald-500/30 bg-[#0f1b15] text-emerald-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 pb-safe">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 mx-auto mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#f4efe6]">
              Download Project Bundle
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/75 max-w-md mx-auto mt-2 leading-relaxed">
              Ready to push to your GitHub (<span className="text-emerald-300 font-mono">@IT21826740</span>) and deploy live on <strong>Vercel</strong>.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-2xl bg-[#09130f]/85 border border-emerald-500/25 space-y-2.5 text-xs text-emerald-100/80">
              <h4 className="font-serif font-bold text-emerald-200 text-sm flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Portfolio Bundle Highlights</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-200/90 font-mono text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span> Responsive Three.js 3D Island
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span> Touch Joystick &amp; Pinch Zoom
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span> 14 Shipped Projects &amp; 13 Certs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span> Cute Loading &amp; Error Fallbacks
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#14281f]/45 border border-emerald-500/20 text-xs text-emerald-100/75 space-y-2">
              <h4 className="font-serif font-bold text-emerald-300 text-xs flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                <span>How to Deploy to Vercel</span>
              </h4>
              <ol className="list-decimal pl-5 space-y-1 font-sans text-emerald-100/75">
                <li>Push the updated repository to GitHub.</li>
                <li>Open <strong>vercel.com</strong>, click <em>Add New Project</em>, and select your repo.</li>
                <li>Vercel detects Vite automatically — click <strong>Deploy</strong>.</li>
              </ol>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              {downloading && (
                <div className="w-full sm:w-48 space-y-1">
                  <div className="flex justify-between text-[11px] font-mono tabular-nums text-emerald-300">
                    <span>Compressing...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              {downloadComplete && !downloading && (
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Downloaded dilini-3d-nature-portfolio.zip</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-emerald-200/80 hover:text-emerald-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={downloading}
                className="min-h-[44px] flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#09120e] text-xs font-bold shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>{downloading ? 'Preparing ZIP...' : 'Download ZIP'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
