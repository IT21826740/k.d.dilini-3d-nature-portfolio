import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Mail,
  Phone,
  FileDown,
  Github,
  ArrowRight,
  Award,
  User,
} from 'lucide-react';
import { WorldInteractable } from '../../data/worldData';
import {
  DILINI_PROFILE,
  PROJECTS,
  SKILL_CATEGORIES,
  CERTIFICATES,
  YOUTUBE_CHANNELS,
  Project,
} from '../../data/portfolioData';
import { DILINI_CV_BASE64 } from '../../data/cvData';
import { walkAudio } from '../../utils/walkAudio';

interface WorldDiscoveryModalProps {
  poi: WorldInteractable | null;
  onClose: () => void;
  onOpenProjectDetail: (p: Project) => void;
}

const ResilientPortrait: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1c15] text-emerald-300/80 p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-2">
          <User className="w-8 h-8 text-emerald-300" />
        </div>
        <span className="font-serif text-sm font-bold text-[#f4efe6]">K.D. Dilini</span>
        <span className="text-xs text-emerald-300/70">SLIIT BSc (Hons) IT</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="w-full h-full object-cover object-top"
    />
  );
};

const ResilientCertThumb: React.FC<{
  src: string;
  title: string;
  issuer: string;
  className?: string;
}> = ({ src, title, issuer, className = 'w-full h-full object-cover' }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1c15] text-emerald-300/80 p-3 text-center">
        <Award className="w-6 h-6 text-emerald-400 mb-1.5" />
        <span className="font-serif text-[11px] font-bold text-[#f4efe6] line-clamp-2">
          {title}
        </span>
        <span className="text-[10px] text-emerald-300/70 mt-0.5 line-clamp-1">
          {issuer}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export const WorldDiscoveryModal: React.FC<WorldDiscoveryModalProps> = ({
  poi,
  onClose,
  onOpenProjectDetail,
}) => {
  const [certFilterIndex, setCertFilterIndex] = useState<number | null>(null);

  useEffect(() => {
    setCertFilterIndex(null);
  }, [poi?.id]);

  useEffect(() => {
    if (!poi) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (certFilterIndex !== null) {
          setCertFilterIndex(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [poi, certFilterIndex, onClose]);

  if (!poi) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={poi.details.title}
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/80 animate-fade-in select-text"
    >
      <div className="relative w-full max-w-4xl max-h-[92dvh] sm:max-h-[88vh] bg-gradient-to-b from-[#13231b] via-[#0e1a14] to-[#08120e] border border-emerald-500/45 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto overscroll-contain touch-pan-y text-left">
        {/* Sticky Modal Top Header (Mobile & Desktop friendly 44px+ Close Target) */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-5 py-3.5 sm:px-8 bg-[#12221a]/95 border-b border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-300 min-w-0">
            <span className="text-base shrink-0">{poi.icon}</span>
            <span className="truncate">{poi.badge}</span>
            <span aria-hidden="true" className="hidden sm:inline text-emerald-500/50">
              ·
            </span>
            <span className="hidden sm:inline text-emerald-200/70">
              Landmark Discovery
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              walkAudio.playDiscoveryChime(440);
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] rounded-xl border border-emerald-500/30 bg-[#0e1a14] text-emerald-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Close Landmark Dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 pb-safe">
          {/* Modal Title & Intro */}
          <div className="mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#f4efe6] tracking-tight">
              {poi.details.title}
            </h2>
            <p className="text-xs font-mono text-emerald-300/85 mt-1">
              {poi.details.subtitle}
            </p>
            <p className="text-sm text-emerald-100/80 font-sans leading-relaxed mt-3 border-t border-emerald-500/20 pt-3">
              {poi.details.description}
            </p>
          </div>

          {/* 1. PROFILE / CHARACTER */}
          {poi.type === 'profile' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="rounded-2xl overflow-hidden border border-emerald-500/30 aspect-4/3 sm:aspect-auto min-h-[220px] bg-[#08120e]">
                  <ResilientPortrait
                    src="/image/DUL06439.JPG"
                    alt="K.D. Dilini in graduation regalia"
                  />
                </div>
                <div className="space-y-3 p-4 rounded-2xl bg-[#09130f] border border-emerald-500/25 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-emerald-200">
                      K.D. Dilini
                    </h4>
                    <p className="text-xs text-emerald-300 font-mono mt-0.5">
                      Full Stack Java &amp; Spring Boot Developer
                    </p>
                    <p className="text-xs sm:text-sm text-emerald-100/75 mt-2 font-sans leading-relaxed">
                      Based in Sri Lanka — building robust Spring Boot APIs, full-stack web platforms, mobile systems, and practical IoT edge applications.
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2.5 border-t border-emerald-500/15 text-xs text-emerald-200/85">
                    <div className="flex justify-between gap-2">
                      <span className="text-emerald-100/60">Education</span>
                      <span className="font-semibold text-emerald-300 text-right">
                        SLIIT BSc (Hons) IT
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-emerald-100/60">Experience</span>
                      <span className="font-semibold text-emerald-300 text-right">
                        Java Backend Internship
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-emerald-100/60">Shipped Projects</span>
                      <span className="font-semibold text-emerald-300 tabular-nums text-right">
                        14+ Codebases
                      </span>
                    </div>
                  </div>
                  <a
                    href={DILINI_CV_BASE64}
                    download="Dilini-Backend-Developer-CV.pdf"
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-xs font-bold text-emerald-200 transition-colors"
                  >
                    <FileDown className="w-4 h-4 shrink-0" />
                    <span>Download Curriculum Vitae (PDF)</span>
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#09130f] border border-emerald-500/20">
                <h4 className="font-serif text-sm font-bold text-emerald-300 mb-2">
                  Core Engineering Philosophies
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-emerald-100/80">
                  {poi.details.highlights?.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 leading-none mt-1" aria-hidden="true">
                        ✦
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 2. PROJECTS (Ancient Tree) */}
          {poi.type === 'projects' && (
            <div className="space-y-4">
              <h4 className="font-serif text-sm font-bold text-emerald-300">
                Browse 14+ Shipped Projects
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {PROJECTS.map((proj) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => {
                      walkAudio.playDiscoveryChime(659.25);
                      onOpenProjectDetail(proj);
                    }}
                    className="min-h-[112px] p-4 rounded-2xl bg-[#09130f] border border-emerald-500/25 hover:border-emerald-400 text-left transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-emerald-400 mb-1">
                        <span className="truncate">{proj.category}</span>
                        <span className="text-[11px] font-mono text-emerald-300/80 shrink-0">
                          {proj.badge}
                        </span>
                      </div>
                      <h5 className="font-serif text-base font-bold text-[#f4efe6] group-hover:text-emerald-200">
                        {proj.title}
                      </h5>
                      <p className="text-xs text-emerald-100/70 font-sans mt-1 line-clamp-2">
                        {proj.tagline}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-emerald-500/10 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span>Inspect Blueprint</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. SKILLS STREAM (Waterfall) */}
          {poi.type === 'skills' && (
            <div className="space-y-4">
              <h4 className="font-serif text-sm font-bold text-emerald-300">
                Mastered Capabilities &amp; Stacks
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SKILL_CATEGORIES.map((cat) => (
                  <div
                    key={cat.label}
                    className="p-4 rounded-2xl bg-[#09130f] border border-emerald-500/20 space-y-2.5"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-emerald-500/15">
                      <h5 className="font-serif text-sm font-bold text-emerald-200">
                        {cat.label}
                      </h5>
                      <span className="text-[11px] font-mono tabular-nums text-emerald-400">
                        {cat.items.length} tools
                      </span>
                    </div>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2">
                      {cat.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-emerald-500/15 text-xs text-emerald-100/90"
                        >
                          <span className="truncate">{item.name}</span>
                          <span className="text-[11px] font-mono tabular-nums text-emerald-400 font-bold ml-1.5 shrink-0">
                            {item.level}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. CERTIFICATES (Stone Monoliths) */}
          {poi.type === 'certificates' && (
            <div className="space-y-4">
              <h4 className="font-serif text-sm font-bold text-emerald-300">
                13 Verified Certifications &amp; Diplomas
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {CERTIFICATES.map((cert, idx) => (
                  <button
                    key={cert.id}
                    type="button"
                    onClick={() => setCertFilterIndex(idx)}
                    className="p-2.5 rounded-2xl bg-[#09130f] border border-emerald-500/20 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                  >
                    <div className="aspect-4/3 rounded-lg overflow-hidden bg-black/40 border border-emerald-500/20 mb-2">
                      <ResilientCertThumb
                        src={cert.url}
                        title={cert.title}
                        issuer={cert.issuer}
                        className="w-full h-full object-cover brightness-95 group-hover:brightness-100"
                      />
                    </div>
                    <h6 className="font-serif text-xs font-bold text-[#f4efe6] line-clamp-1 group-hover:text-emerald-200">
                      {cert.title}
                    </h6>
                    <span className="text-[11px] text-emerald-400/75 font-sans block truncate mt-0.5">
                      {cert.issuer}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. DISPATCHES (Campfire) */}
          {poi.type === 'dispatches' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#09130f] border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-emerald-400 block">
                    GitHub Profile
                  </span>
                  <h4 className="font-serif text-lg font-bold text-[#f4efe6]">
                    @IT21826740
                  </h4>
                  <p className="text-xs text-emerald-100/70 font-sans mt-0.5">
                    14+ public repositories spanning Spring Boot, RabbitMQ, IoT TinyML, and systems programming.
                  </p>
                </div>
                <a
                  href={DILINI_PROFILE.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-xs font-bold text-emerald-300 transition-colors shrink-0"
                >
                  <Github className="w-4 h-4 shrink-0" />
                  <span>Visit GitHub Profile</span>
                </a>
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-emerald-300 mb-3">
                  YouTube Publications &amp; Worldbuilding
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {YOUTUBE_CHANNELS.map((ch) => (
                    <a
                      key={ch.title}
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[68px] p-4 rounded-2xl bg-[#09130f] border border-emerald-500/25 hover:border-emerald-400 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <span className="text-[11px] font-mono text-emerald-400 block">
                          {ch.type}
                        </span>
                        <h5 className="font-serif text-base font-bold text-[#f4efe6] group-hover:text-emerald-200 truncate">
                          {ch.title}
                        </h5>
                        <p className="text-xs text-emerald-100/65 font-sans mt-0.5 line-clamp-1">
                          {ch.description}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0 opacity-75 group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. CONTACT (Shrine) */}
          {poi.type === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={`mailto:${DILINI_PROFILE.email}`}
                  className="min-h-[64px] p-4 rounded-2xl bg-[#09130f] border border-emerald-500/25 hover:border-emerald-400 transition-all flex items-center gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono text-emerald-400 block">
                      Direct Email
                    </span>
                    <span className="font-serif text-sm font-bold text-[#f4efe6] group-hover:text-emerald-200 block truncate">
                      {DILINI_PROFILE.email}
                    </span>
                  </div>
                </a>
                <a
                  href={`tel:${DILINI_PROFILE.phone}`}
                  className="min-h-[64px] p-4 rounded-2xl bg-[#09130f] border border-emerald-500/25 hover:border-emerald-400 transition-all flex items-center gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono text-teal-400 block">
                      Phone / WhatsApp
                    </span>
                    <span className="font-serif text-sm font-bold text-[#f4efe6] group-hover:text-teal-200 block truncate">
                      {DILINI_PROFILE.phone}
                    </span>
                  </div>
                </a>
              </div>
              <div className="p-4 rounded-2xl bg-[#09130f] border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-serif text-sm font-bold text-emerald-200">
                    Full Curriculum Vitae
                  </h5>
                  <p className="text-xs text-emerald-100/65 font-sans mt-0.5">
                    Download K.D. Dilini&apos;s updated software engineering resume (PDF).
                  </p>
                </div>
                <a
                  href={DILINI_CV_BASE64}
                  download="Dilini-Backend-Developer-CV.pdf"
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[#09120e] text-xs font-bold shadow-md shrink-0"
                >
                  <FileDown className="w-4 h-4 shrink-0" />
                  <span>Download CV</span>
                </a>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="mt-7 pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-300/80">
            <span>Explore more landmarks across the floating island.</span>
            <button
              type="button"
              onClick={() => {
                walkAudio.playDiscoveryChime(440);
                onClose();
              }}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 font-semibold transition-colors cursor-pointer"
            >
              Continue Walking
            </button>
          </div>
        </div>
      </div>

      {/* Nested Certificate Lightbox */}
      {certFilterIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={CERTIFICATES[certFilterIndex].title}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 animate-fade-in"
        >
          <div className="relative w-full max-w-3xl bg-[#0e1b15] border border-emerald-400/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#f4efe6] truncate">
                  {CERTIFICATES[certFilterIndex].title}
                </h3>
                <p className="text-xs text-emerald-300/80 truncate">
                  {CERTIFICATES[certFilterIndex].issuer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCertFilterIndex(null)}
                aria-label="Close certificate preview"
                className="min-w-[44px] min-h-[44px] rounded-xl border border-emerald-500/30 bg-[#09120e] text-emerald-300 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-black/60 flex items-center justify-center mb-4">
              <ResilientCertThumb
                src={CERTIFICATES[certFilterIndex].url}
                title={CERTIFICATES[certFilterIndex].title}
                issuer={CERTIFICATES[certFilterIndex].issuer}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-3 text-xs text-emerald-200">
              <span>Verified Credential #{certFilterIndex + 1}</span>
              <a
                href={CERTIFICATES[certFilterIndex].url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3 rounded-lg bg-emerald-500/15 text-emerald-300 font-semibold hover:bg-emerald-500/25"
              >
                <span>Open Original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
