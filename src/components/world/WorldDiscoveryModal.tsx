import React, { useState } from 'react';
import { X, ExternalLink, ArrowRight, Award, ShieldCheck, Mail, Phone, FileDown, Github, Terminal, Star, CheckCircle2 } from 'lucide-react';
import { WorldInteractable } from '../../data/worldData';
import { DILINI_PROFILE, PROJECTS, SKILL_CATEGORIES, CERTIFICATES, YOUTUBE_CHANNELS, Project } from '../../data/portfolioData';
import { DILINI_CV_BASE64 } from '../../data/cvData';
import { walkAudio } from '../../utils/walkAudio';

interface WorldDiscoveryModalProps {
  poi: WorldInteractable | null;
  onClose: () => void;
  onOpenProjectDetail: (p: Project) => void;
}

export const WorldDiscoveryModal: React.FC<WorldDiscoveryModalProps> = ({
  poi,
  onClose,
  onOpenProjectDetail
}) => {
  const [certFilterIndex, setCertFilterIndex] = useState<number | null>(null);

  if (!poi) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-gradient-to-b from-[#13231b] via-[#0e1a14] to-[#08120e] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto text-left">
        
        {/* Leaf Corner Markers */}
        <div className="absolute top-3 left-3 text-emerald-400 text-xs">🍃</div>
        <div className="absolute top-3 right-3 text-emerald-400 text-xs">🍃</div>
        <div className="absolute bottom-3 left-3 text-emerald-400 text-xs">🍃</div>
        <div className="absolute bottom-3 right-3 text-emerald-400 text-xs">🍃</div>

        {/* Close Button */}
        <button
          onClick={() => {
            walkAudio.playDiscoveryChime(440);
            onClose();
          }}
          className="sticky top-0 float-right -mt-2 -mr-2 p-2 rounded-full border border-emerald-500/30 bg-[#0e1a14]/90 text-emerald-300 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
          aria-label="Close Landmark Dossier"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-serif text-emerald-400 uppercase tracking-widest mb-1.5">
            <span className="text-base">{poi.icon}</span>
            <span>{poi.badge}</span>
            <span aria-hidden="true">·</span>
            <span>Landmark Discovery</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#f4efe6] tracking-tight">
            {poi.details.title}
          </h2>
          <p className="text-xs font-mono text-emerald-300/80 mt-1">
            {poi.details.subtitle}
          </p>

          <p className="text-sm text-emerald-100/75 font-sans leading-relaxed mt-3 border-t border-emerald-500/20 pt-3">
            {poi.details.description}
          </p>
        </div>

        {/* DYNAMIC CONTENT PER LANDMARK TYPE */}

        {/* 1. PROFILE / CHARACTER */}
        {poi.type === 'profile' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden border border-emerald-500/30 aspect-4/3 bg-[#08120e]">
                <img
                  src="/image/DUL06439.JPG"
                  alt="K.D. Dilini in graduation regalia"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-[#09130f] border border-emerald-500/25 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-emerald-200">
                    K.D. Dilini
                  </h4>
                  <p className="text-xs text-emerald-300 font-mono mt-0.5">
                    Full Stack Java &amp; Spring Boot Developer
                  </p>
                  <p className="text-xs text-emerald-100/70 mt-2 font-sans leading-relaxed">
                    Based in Sri Lanka — building robust Spring Boot APIs, full-stack web platforms, mobile systems, and practical IoT edge applications.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-emerald-500/15 text-xs text-emerald-200/80">
                  <div className="flex justify-between">
                    <span className="text-emerald-100/60">Education</span>
                    <span className="font-semibold text-emerald-300">SLIIT BSc (Hons) IT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-100/60">Experience</span>
                    <span className="font-semibold text-emerald-300">Java Backend Internship</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-100/60">Shipped Projects</span>
                    <span className="font-semibold text-emerald-300">14+ Codebases</span>
                  </div>
                </div>

                <a
                  href={DILINI_CV_BASE64}
                  download="Dilini-Backend-Developer-CV.pdf"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-xs font-serif font-bold text-emerald-300 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Curriculum Vitae (PDF)</span>
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#09130f] border border-emerald-500/20">
              <h4 className="font-serif text-sm font-bold text-emerald-300 uppercase tracking-wider mb-2">
                Core Engineering Philosophies
              </h4>
              <ul className="space-y-1.5 text-xs text-emerald-100/75">
                {poi.details.highlights?.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 leading-none mt-1">✦</span>
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
            <h4 className="font-serif text-sm font-bold text-emerald-300 uppercase tracking-wider">
              Browse 14+ Shipped Projects:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PROJECTS.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => {
                    walkAudio.playDiscoveryChime(659.25);
                    onOpenProjectDetail(proj);
                  }}
                  className="p-3.5 rounded-xl bg-[#09130f] border border-emerald-500/25 hover:border-emerald-400 transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-serif mb-1">
                      <span>{proj.category}</span>
                      <span className="text-[10px] font-mono text-emerald-300/80">{proj.badge}</span>
                    </div>
                    <h5 className="font-serif text-base font-bold text-[#f4efe6] group-hover:text-emerald-200">
                      {proj.title}
                    </h5>
                    <p className="text-xs text-emerald-100/70 font-sans mt-1 line-clamp-2">
                      {proj.tagline}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-emerald-500/10 flex items-center justify-between text-[11px] text-emerald-400 font-serif font-semibold">
                    <span>Inspect Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SKILLS STREAM (Waterfall) */}
        {poi.type === 'skills' && (
          <div className="space-y-5">
            <h4 className="font-serif text-sm font-bold text-emerald-300 uppercase tracking-wider">
              Mastered Capabilities &amp; Stacks:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SKILL_CATEGORIES.map((cat) => (
                <div key={cat.label} className="p-4 rounded-xl bg-[#09130f] border border-emerald-500/20 space-y-2.5">
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-500/15">
                    <h5 className="font-serif text-sm font-bold text-emerald-200">{cat.label}</h5>
                    <span className="text-[10px] font-mono text-emerald-400">{cat.items.length} tools</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-black/30 border border-emerald-500/15 text-xs text-emerald-100/90">
                        <span className="truncate">{item.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold ml-1">{item.level}%</span>
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
            <h4 className="font-serif text-sm font-bold text-emerald-300 uppercase tracking-wider">
              13 Verified Certifications &amp; Diplomas:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {CERTIFICATES.map((cert, idx) => (
                <div
                  key={cert.id}
                  onClick={() => setCertFilterIndex(idx)}
                  className="p-2.5 rounded-xl bg-[#09130f] border border-emerald-500/20 hover:border-emerald-400 transition-all cursor-pointer group"
                >
                  <div className="aspect-4/3 rounded-lg overflow-hidden bg-black/40 border border-emerald-500/20 mb-2">
                    <img src={cert.url} alt={cert.title} className="w-full h-full object-cover filter brightness-90 group-hover:brightness-100" />
                  </div>
                  <h6 className="font-serif text-xs font-bold text-[#f4efe6] line-clamp-1 group-hover:text-emerald-200">
                    {cert.title}
                  </h6>
                  <span className="text-[10px] text-emerald-400/70 font-sans block truncate mt-0.5">
                    {cert.issuer}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. DISPATCHES (Campfire) */}
        {poi.type === 'dispatches' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-[#09130f] border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block">GitHub Profile</span>
                <h4 className="font-serif text-lg font-bold text-[#f4efe6]">@IT21826740</h4>
                <p className="text-xs text-emerald-100/70 font-sans mt-0.5">
                  14+ public repositories spanning Spring Boot, RabbitMQ, IoT TinyML, and systems programming.
                </p>
              </div>
              <a
                href={DILINI_PROFILE.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-xs font-serif font-bold text-emerald-300 transition-colors shrink-0"
              >
                <Github className="w-4 h-4" />
                <span>Visit GitHub Profile ↗</span>
              </a>
            </div>

            <div>
              <h4 className="font-serif text-sm font-bold text-emerald-300 uppercase tracking-wider mb-3">
                YouTube Publications &amp; Worldbuilding:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {YOUTUBE_CHANNELS.map((ch) => (
                  <a
                    key={ch.title}
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-[#09130f] border border-emerald-500/25 hover:border-emerald-400 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase block">{ch.type}</span>
                      <h5 className="font-serif text-base font-bold text-[#f4efe6] group-hover:text-emerald-200">{ch.title}</h5>
                      <p className="text-xs text-emerald-100/65 font-sans mt-0.5 line-clamp-1">{ch.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0 opacity-70 group-hover:opacity-100" />
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
                className="p-4 rounded-xl bg-[#09130f] border border-emerald-500/25 hover:border-emerald-400 transition-all flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase block">Direct Email</span>
                  <span className="font-serif text-sm font-bold text-[#f4efe6] group-hover:text-emerald-200 block truncate">{DILINI_PROFILE.email}</span>
                </div>
              </a>

              <a
                href={`tel:${DILINI_PROFILE.phone}`}
                className="p-4 rounded-xl bg-[#09130f] border border-emerald-500/25 hover:border-emerald-400 transition-all flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase block">Phone / WhatsApp</span>
                  <span className="font-serif text-sm font-bold text-[#f4efe6] group-hover:text-teal-200 block truncate">{DILINI_PROFILE.phone}</span>
                </div>
              </a>
            </div>

            <div className="p-4 rounded-xl bg-[#09130f] border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h5 className="font-serif text-sm font-bold text-emerald-200">Full Curriculum Vitae</h5>
                <p className="text-xs text-emerald-100/65 font-sans mt-0.5">Download K.D. Dilini's updated software engineering resume (PDF).</p>
              </div>
              <a
                href={DILINI_CV_BASE64}
                download="Dilini-Backend-Developer-CV.pdf"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-[#09120e] font-serif text-xs font-bold shadow-md shrink-0"
              >
                <FileDown className="w-4 h-4" />
                <span>Download CV</span>
              </a>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400/80 font-serif">
          <span>Explore more landmarks across the floating island.</span>
          <button
            onClick={() => {
              walkAudio.playDiscoveryChime(440);
              onClose();
            }}
            className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer"
          >
            Continue Walking
          </button>
        </div>

      </div>

      {/* Nested Certificate Lightbox */}
      {certFilterIndex !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#0e1b15] border-2 border-emerald-400/60 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setCertFilterIndex(null)}
              className="absolute top-4 right-4 p-2 rounded-full border border-emerald-500/30 text-emerald-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-black/60 flex items-center justify-center mb-4">
              <img
                src={CERTIFICATES[certFilterIndex].url}
                alt={CERTIFICATES[certFilterIndex].title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-serif text-emerald-200">
              <span>{CERTIFICATES[certFilterIndex].title} ({CERTIFICATES[certFilterIndex].issuer})</span>
              <a
                href={CERTIFICATES[certFilterIndex].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 font-bold hover:underline"
              >
                Open Original ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
