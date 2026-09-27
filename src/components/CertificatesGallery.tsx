import React, { useState } from 'react';
import { Award, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { CERTIFICATES } from '../data/portfolioData';
import { natureAudio } from '../utils/natureAudio';

export const CertificatesGallery: React.FC = () => {
  const [selectedCertIndex, setSelectedCertIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    natureAudio.playBell(659.25, 0.3);
    setSelectedCertIndex(index);
  };

  const closeLightbox = () => {
    natureAudio.playWaterDrop();
    setSelectedCertIndex(null);
  };

  const nextCert = () => {
    if (selectedCertIndex === null) return;
    natureAudio.playBell(587.33, 0.2);
    setSelectedCertIndex((selectedCertIndex + 1) % CERTIFICATES.length);
  };

  const prevCert = () => {
    if (selectedCertIndex === null) return;
    natureAudio.playBell(523.25, 0.2);
    setSelectedCertIndex((selectedCertIndex - 1 + CERTIFICATES.length) % CERTIFICATES.length);
  };

  return (
    <section id="artifacts" className="relative py-16 lg:py-24 border-t border-emerald-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-serif text-emerald-400 tracking-widest uppercase mb-1">
              <span>Nature Reliquary</span>
              <span aria-hidden="true">·</span>
              <span>13 Verified Credentials</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#f4efe6] tracking-tight">
              Certifications &amp; Accreditations
            </h2>
            <p className="text-sm text-emerald-100/70 max-w-2xl mt-2 font-sans">
              Verified certifications in Java enterprise architecture, Spring Boot, REST API security, databases, Docker containerization, and English scholarship. Click to view high-resolution proof.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-300 self-start md:self-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>13 Certificates Documented</span>
          </span>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CERTIFICATES.map((cert, index) => (
            <div
              key={cert.id}
              onClick={() => openLightbox(index)}
              className="group relative rounded-2xl bg-gradient-to-b from-[#13221b] to-[#09120e] border border-emerald-500/25 hover:border-emerald-400/80 p-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/40 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image Frame */}
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#070c09] border border-emerald-500/20 mb-3">
                  <img
                    src={cert.url}
                    alt={cert.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-100"
                    loading="lazy"
                  />

                  {/* Hover Inspect */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-serif font-bold text-emerald-200">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>View Certificate</span>
                  </div>

                  <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-emerald-300 border border-emerald-400/40">
                    No. {String(cert.id).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="font-serif text-sm font-bold text-[#f4efe6] group-hover:text-emerald-200 line-clamp-2 leading-snug">
                  {cert.title}
                </h3>
              </div>

              {/* Issuer */}
              <div className="mt-3 pt-2 border-t border-emerald-500/15 flex items-center justify-between text-[11px] text-emerald-300/70 font-sans">
                <span>{cert.issuer}</span>
                <Award className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedCertIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#13221b] to-[#09120e] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl overflow-hidden">
            
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full border border-emerald-500/30 text-emerald-300 hover:text-white hover:bg-white/10 transition-colors z-20"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Preview Viewport */}
            <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-black/70 border border-emerald-500/30 flex items-center justify-center mb-4">
              <img
                src={CERTIFICATES[selectedCertIndex].url}
                alt={CERTIFICATES[selectedCertIndex].title}
                className="max-h-full max-w-full object-contain"
              />

              <button
                onClick={prevCert}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20 transition-colors"
                aria-label="Previous Certificate"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextCert}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20 transition-colors"
                aria-label="Next Certificate"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <span className="text-xs font-mono text-emerald-400">
                  {CERTIFICATES[selectedCertIndex].issuer} · {selectedCertIndex + 1} of {CERTIFICATES.length}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#f4efe6] mt-0.5">
                  {CERTIFICATES[selectedCertIndex].title}
                </h3>
              </div>

              <a
                href={CERTIFICATES[selectedCertIndex].url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-xs font-serif font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors self-start sm:self-auto"
              >
                Open Original Image ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
