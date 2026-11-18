import React, { useEffect } from 'react';
import { X, ExternalLink, ArrowRight, ShieldAlert, Sparkles, GitBranch } from 'lucide-react';
import { Project } from '../data/portfolioData';
import { natureAudio } from '../utils/natureAudio';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 animate-fade-in select-text"
    >
      <div className="relative w-full max-w-3xl max-h-[92dvh] sm:max-h-[90vh] bg-gradient-to-b from-[#13221b] via-[#0f1b15] to-[#09120e] border border-emerald-500/45 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto overscroll-contain touch-pan-y">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-5 py-3.5 sm:px-8 bg-[#12211a]/95 border-b border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs text-emerald-400 min-w-0">
            <span className="truncate">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate text-emerald-200/80">{project.badge}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              natureAudio.playWaterDrop();
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] rounded-xl border border-emerald-500/30 bg-[#0f1b15] text-emerald-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Close Project Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 pb-safe">
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#f4efe6] tracking-tight">
            {project.title}
          </h2>
          <p className="text-xs font-mono text-emerald-300 mt-1 mb-4">
            {project.tagline}
          </p>

          {/* Description */}
          <div className="space-y-3 text-sm text-emerald-100/85 font-sans leading-relaxed border-t border-emerald-500/20 pt-4">
            {project.paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Key Features */}
          {project.features && project.features.length > 0 && (
            <div className="mt-6 pt-4 border-t border-emerald-500/20">
              <h4 className="font-serif text-sm font-bold text-emerald-200 mb-2.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Core Architectural Features</span>
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-emerald-100/80 pl-1">
                {project.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 leading-none mt-1" aria-hidden="true">
                      ✦
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contributions */}
          {project.contribution && project.contribution.length > 0 && (
            <div className="mt-6 pt-4 border-t border-emerald-500/20">
              <h4 className="font-serif text-sm font-bold text-emerald-200 mb-2.5 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Engineering Contribution &amp; Ownership</span>
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-emerald-100/80 pl-1">
                {project.contribution.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-400 leading-none mt-1" aria-hidden="true">
                      ✔
                    </span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Architecture Pipeline */}
          {project.architecture && project.architecture.length > 0 && (
            <div className="mt-6 pt-4 border-t border-emerald-500/20">
              <h4 className="font-serif text-sm font-bold text-emerald-200 mb-2.5">
                System Pipeline Architecture
              </h4>
              <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-black/40 border border-emerald-500/20">
                {project.architecture.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-[#102018] border border-emerald-500/30 text-emerald-200 font-mono">
                      {step}
                    </span>
                    {idx < project.architecture.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack (Clean unboxed metadata separated by middle dot) */}
          <div className="mt-6 pt-4 border-t border-emerald-500/20">
            <h4 className="font-serif text-xs font-semibold text-emerald-400/90 mb-2">
              Technological Stack
            </h4>
            <p className="text-xs font-mono text-emerald-200/85 leading-relaxed">
              {project.tags.join(' · ')}
            </p>
          </div>

          {/* Confidential Note */}
          {project.note && (
            <div className="mt-6 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-200/85">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{project.note}</span>
            </div>
          )}

          {/* Links */}
          <div className="mt-7 pt-5 border-t border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2.5">
              {project.links && project.links.length > 0 ? (
                project.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#09120e] text-xs font-bold shadow-md transition-colors"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ))
              ) : (
                <span className="text-xs text-emerald-400/70 italic">
                  Internal enterprise deployment codebase.
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/15 transition-colors cursor-pointer"
            >
              Return to Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
