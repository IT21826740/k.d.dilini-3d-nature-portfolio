import React, { useEffect } from 'react';
import { X, ExternalLink, ArrowRight, ShieldAlert, Sparkles, GitBranch } from 'lucide-react';
import { Project, ELEMENT_THEMES } from '../data/portfolioData';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-[#13221b] via-[#0f1b15] to-[#09120e] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto">
        
        {/* Leaf Corner Ornaments */}
        <div className="absolute top-3 left-3 text-emerald-400 text-xs select-none">🍃</div>
        <div className="absolute top-3 right-3 text-emerald-400 text-xs select-none">🍃</div>
        <div className="absolute bottom-3 left-3 text-emerald-400 text-xs select-none">🍃</div>
        <div className="absolute bottom-3 right-3 text-emerald-400 text-xs select-none">🍃</div>

        {/* Close Button */}
        <button
          onClick={() => {
            natureAudio.playWaterDrop();
            onClose();
          }}
          className="sticky top-0 float-right -mt-2 -mr-2 p-2 rounded-full border border-emerald-500/30 bg-[#0f1b15]/90 text-emerald-300 hover:text-white hover:bg-white/10 transition-colors z-20"
          aria-label="Close Project Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Metadata */}
        <div className="flex items-center gap-2 text-xs font-serif text-emerald-400 tracking-wider uppercase mb-1">
          <span>{project.category}</span>
          <span aria-hidden="true">·</span>
          <span>{project.badge}</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#f4efe6] tracking-tight">
          {project.title}
        </h2>
        
        <p className="text-xs font-mono text-emerald-300 mt-1 mb-4">
          {project.tagline}
        </p>

        {/* Description */}
        <div className="space-y-3 text-sm text-emerald-100/80 font-sans leading-relaxed border-t border-emerald-500/20 pt-4">
          {project.paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Key Features */}
        {project.features && project.features.length > 0 && (
          <div className="mt-6 pt-4 border-t border-emerald-500/20">
            <h4 className="font-serif text-sm font-bold text-emerald-200 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Core Architectural Features</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-emerald-100/75 pl-2">
              {project.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-serif leading-none mt-1">✦</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contributions */}
        {project.contribution && project.contribution.length > 0 && (
          <div className="mt-6 pt-4 border-t border-emerald-500/20">
            <h4 className="font-serif text-sm font-bold text-emerald-200 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-teal-400" />
              <span>Engineering Contribution &amp; Ownership</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-emerald-100/75 pl-2">
              {project.contribution.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-teal-400 font-serif leading-none mt-1">✔</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Architecture Pipeline */}
        {project.architecture && project.architecture.length > 0 && (
          <div className="mt-6 pt-4 border-t border-emerald-500/20">
            <h4 className="font-serif text-sm font-bold text-emerald-200 uppercase tracking-wider mb-2.5">
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

        {/* Tech Tags */}
        <div className="mt-6 pt-4 border-t border-emerald-500/20">
          <h4 className="font-serif text-xs font-semibold text-emerald-400/80 uppercase tracking-wider mb-2">
            Technological Artifacts
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#0d1a14] border border-emerald-500/30 text-emerald-200/90 font-mono"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Confidential Note */}
        {project.note && (
          <div className="mt-6 p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-200/80">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{project.note}</span>
          </div>
        )}

        {/* Links */}
        <div className="mt-8 pt-5 border-t border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {project.links && project.links.length > 0 ? (
              project.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#09120e] text-xs font-serif font-bold shadow-md transition-all"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))
            ) : (
              <span className="text-xs text-emerald-400/70 italic font-serif">
                Internal enterprise deployment codebase.
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-serif text-emerald-300 hover:text-emerald-100 transition-colors"
          >
            Return to Projects
          </button>
        </div>
      </div>
    </div>
  );
};
