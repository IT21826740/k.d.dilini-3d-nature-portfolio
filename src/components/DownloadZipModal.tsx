import React, { useState } from 'react';
import { Download, Check, Sparkles, AlertCircle, FileCode, Github, Globe } from 'lucide-react';
import { generateProjectZip } from '../utils/exportZip';
import { natureAudio } from '../utils/natureAudio';
import { DILINI_PROFILE } from '../data/portfolioData';

interface DownloadZipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadZipModal: React.FC<DownloadZipModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      setProgress(10);
      natureAudio.playBell(587.33, 0.6);

      const zipBlob = await generateProjectZip((p) => {
        setProgress(p);
      });

      setProgress(100);
      setDownloadComplete(true);
      natureAudio.playBell(783.99, 1.2);

      // Trigger browser download
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#13221b] via-[#0f1b15] to-[#09120e] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Ornate Nature Corner Leaves */}
        <div className="absolute top-3 left-3 text-emerald-400 text-xs select-none">🍃</div>
        <div className="absolute top-3 right-3 text-emerald-400 text-xs select-none">🍃</div>
        <div className="absolute bottom-3 left-3 text-emerald-400 text-xs select-none">🍃</div>
        <div className="absolute bottom-3 right-3 text-emerald-400 text-xs select-none">🍃</div>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 mx-auto mb-3 shadow-lg shadow-emerald-900/30">
            <Download className="w-6 h-6" />
          </div>
          <span className="text-xs font-serif uppercase tracking-widest text-emerald-400 block mb-1">
            Complete Project Export
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#f4efe6]">
            Download Full Project ZIP
          </h2>
          <p className="text-xs text-emerald-100/70 max-w-md mx-auto mt-2 leading-relaxed">
            Ready to push to your GitHub (<span className="text-emerald-300 font-mono">@IT21826740</span>) and deploy live on <strong>Vercel</strong> in 1-click.
          </p>
        </div>

        {/* What's included preview box */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-2xl bg-[#09130f]/80 border border-emerald-500/25 space-y-2.5 text-xs text-emerald-100/80">
            <h4 className="font-serif font-bold text-emerald-200 text-sm flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>Everything Included in the ZIP:</span>
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-200/90 pl-1 font-mono text-[11px]">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span> Full Three.js 3D Island Canvas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span> All 14 Shipped Projects &amp; Data
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span> 13 Certificate Gallery &amp; Lightbox
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span> Vercel Deploy Config (<code className="text-amber-300">vercel.json</code>)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span> GitHub README &amp; Step-by-Step Guide
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span> Web Audio Procedural Nature Sound
              </li>
            </ul>
          </div>

          {/* Vercel 1-Click instructions */}
          <div className="p-4 rounded-2xl bg-[#14281f]/40 border border-emerald-500/20 text-xs text-emerald-100/75 space-y-2">
            <h4 className="font-serif font-bold text-emerald-300 text-xs flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>How to Deploy to Vercel (Free):</span>
            </h4>
            <ol className="list-decimal pl-5 space-y-1 font-sans text-emerald-100/70">
              <li>Extract the downloaded ZIP on your computer.</li>
              <li>Push the folder to a new GitHub repository under your profile.</li>
              <li>Go to <strong>vercel.com</strong>, click <em>"Add New Project"</em>, and select your repository.</li>
              <li>Vercel detects Vite automatically — click <strong>Deploy</strong> and your 3D portfolio is live!</li>
            </ol>
          </div>
        </div>

        {/* Download Action Area */}
        <div className="pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            {downloading && (
              <div className="w-full sm:w-48 space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-emerald-300">
                  <span>Compressing project...</span>
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
            {downloadComplete && (
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-serif">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Downloaded dilini-3d-nature-portfolio.zip!</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-serif text-emerald-200/70 hover:text-emerald-100 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#09120e] font-serif text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Preparing ZIP...' : 'Download Project ZIP'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
