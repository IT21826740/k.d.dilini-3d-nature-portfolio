import React, { useState } from 'react';
import { Star, Eye, X, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { CERTIFICATES, Certificate } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';

export const ArtifactsSection: React.FC = () => {
  const [selectedCertIndex, setSelectedCertIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    soundEngine.playChime(659.25, 'triangle', 0.2);
    setSelectedCertIndex(index);
  };

  const closeLightbox = () => {
    soundEngine.playChime(440, 'sine', 0.15);
    setSelectedCertIndex(null);
  };

  const nextCert = () => {
    if (selectedCertIndex === null) return;
    soundEngine.playChime(587.33, 'sine', 0.1);
    setSelectedCertIndex((selectedCertIndex + 1) % CERTIFICATES.length);
  };

  const prevCert = () => {
    if (selectedCertIndex === null) return;
    soundEngine.playChime(523.25, 'sine', 0.1);
    setSelectedCertIndex((selectedCertIndex - 1 + CERTIFICATES.length) % CERTIFICATES.length);
  };

  return (
    <section id="artifacts" className="relative py-16 lg:py-24 border-t border-amber-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-serif text-amber-400 tracking-widest uppercase mb-1">
              <span>Artifact Inventory</span>
              <span aria-hidden="true">·</span>
              <span>13 Verified Credentials</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-100 tracking-tight">
              Certifications &amp; Achievements
            </h2>
            <p className="text-sm text-amber-100/70 max-w-2xl mt-2 font-sans">
              Accredited milestones in Java enterprise architecture, Spring Boot, distributed microservices, databases, and English language scholarship. Select any relic to inspect in high definition.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto text-xs text-amber-300 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span>All Relics Max Level (+20)</span>
          </div>
        </div>

        {/* Artifacts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CERTIFICATES.map((cert, index) => (
            <div
              key={cert.id}
              onClick={() => openLightbox(index)}
              className="group relative rounded-2xl bg-gradient-to-b from-[#141b2a] to-[#0a0d16] border border-amber-500/30 hover:border-amber-400 p-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Artifact Image Frame */}
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#070a12] border border-amber-500/20 mb-3">
                  <img
                    src={cert.url}
                    alt={cert.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-100"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'p-4');
                        target.parentElement.innerHTML = `
                          <div class="text-center">
                            <span class="text-3xl text-amber-400 block mb-1">📜</span>
                            <span class="text-[11px] font-serif text-amber-200 block font-semibold">Certificate ${cert.id}</span>
                            <span class="text-[10px] text-amber-400/60 font-mono">Click to preview</span>
                          </div>
                        `;
                      }
                    }}
                  />

                  {/* Hover Inspect Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-serif font-bold text-amber-200">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Inspect</span>
                  </div>

                  {/* Slot Pill (Genshin artifact slot e.g. Circlet of Logos) */}
                  <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-amber-300 border border-amber-400/40">
                    {cert.slot}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 text-amber-400 mb-1">
                  {[...Array(cert.rarity)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                  <span className="text-[10px] font-mono text-amber-400/70 ml-1">
                    +{cert.rarity === 5 ? '20 MAX' : '16'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-sm font-bold text-amber-100 group-hover:text-amber-200 line-clamp-2 leading-snug">
                  {cert.title}
                </h3>
              </div>

              {/* Issuer */}
              <div className="mt-3 pt-2 border-t border-amber-500/15 flex items-center justify-between text-[11px] text-amber-300/70 font-sans">
                <span>{cert.issuer}</span>
                <Award className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Inspection Modal */}
      {selectedCertIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#141b2a] to-[#090c15] border-2 border-amber-400/60 rounded-3xl p-6 shadow-2xl overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full border border-amber-500/30 text-amber-300 hover:text-amber-100 hover:bg-white/10 transition-colors z-20"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Image Viewport */}
            <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-black/60 border border-amber-500/30 flex items-center justify-center mb-4">
              <img
                src={CERTIFICATES[selectedCertIndex].url}
                alt={CERTIFICATES[selectedCertIndex].title}
                className="max-h-full max-w-full object-contain"
              />

              {/* Prev / Next Navigation Arrows */}
              <button
                onClick={prevCert}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 border border-amber-500/30 text-amber-200 hover:bg-amber-500/20 transition-colors"
                aria-label="Previous Certificate"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextCert}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 border border-amber-500/30 text-amber-200 hover:bg-amber-500/20 transition-colors"
                aria-label="Next Certificate"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-serif">
                  <span>{CERTIFICATES[selectedCertIndex].slot}</span>
                  <span aria-hidden="true">·</span>
                  <span>{CERTIFICATES[selectedCertIndex].issuer}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-amber-300">
                    {selectedCertIndex + 1} of {CERTIFICATES.length}
                  </span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-100 mt-1">
                  {CERTIFICATES[selectedCertIndex].title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={CERTIFICATES[selectedCertIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-xs font-serif font-bold text-amber-300 hover:bg-amber-500/30 transition-colors"
                >
                  Open Full Resolution ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
