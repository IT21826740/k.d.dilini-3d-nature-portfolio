import React, { useState } from 'react';
import { Mail, Phone, FileDown, Github, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { DILINI_PROFILE } from '../data/portfolioData';
import { DILINI_CV_BASE64 } from '../data/cvData';
import { soundEngine } from '../utils/audio';

export const CommissionContact: React.FC = () => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ msg: string; isError: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !contact.trim() || !message.trim()) {
      soundEngine.playChime(300, 'sawtooth', 0.2);
      setStatus({ msg: 'Please fill in your name, contact, and message.', isError: true });
      return;
    }

    soundEngine.playChime(659.25, 'triangle', 0.3);
    const body = `Hi Dilini, I'm ${name} (${contact}). ${message}`;
    setStatus({
      msg: 'Commission dispatch prepared! Launching your SMS app to deliver the message.',
      isError: false,
    });

    // Launch SMS scheme
    setTimeout(() => {
      window.location.href = `sms:${DILINI_PROFILE.phone}?&body=${encodeURIComponent(body)}`;
    }, 400);
  };

  return (
    <section id="commission" className="relative py-16 lg:py-24 border-t border-amber-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs font-serif text-amber-400 tracking-widest uppercase mb-1">
            <span>Katheryne's Dispatch Desk</span>
            <span aria-hidden="true">·</span>
            <span>Direct Inquiries</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-100 tracking-tight">
            Commission a System or Project
          </h2>
          <p className="text-sm text-amber-100/70 mt-2 font-sans">
            Ready to build scalable backend architectures, high-performance APIs, or full-stack web and mobile systems? Submit a commission request below or connect directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: Genshin Parchment Style */}
          <div className="lg:col-span-7 rounded-2xl bg-gradient-to-b from-[#131b2e] to-[#0a0d16] border-2 border-amber-500/30 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

            <h3 className="font-serif text-xl font-bold text-amber-100 mb-5">
              Submit Commission Brief
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-serif text-amber-200 mb-1.5">
                    Traveler Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lumine / Jean"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090d18] border border-amber-500/30 text-amber-100 text-xs placeholder-amber-100/30 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label htmlFor="contact" className="block text-xs font-serif text-amber-200 mb-1.5">
                    Email or Phone *
                  </label>
                  <input
                    id="contact"
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. traveler@teyvat.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090d18] border border-amber-500/30 text-amber-100 text-xs placeholder-amber-100/30 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-serif text-amber-200 mb-1.5">
                  Commission Description / Requirements *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Outline your project scope, Spring Boot requirements, API specifications, or questions..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090d18] border border-amber-500/30 text-amber-100 text-xs placeholder-amber-100/30 focus:outline-none focus:border-amber-400 resize-y"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#090c15] font-serif text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Prepare Commission (SMS)</span>
                </button>

                {status && (
                  <div
                    className={`flex items-center gap-1.5 text-xs ${
                      status.isError ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {status.isError ? (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{status.msg}</span>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Cards: Direct Channels & CV */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Email Card */}
            <a
              href={`mailto:${DILINI_PROFILE.email}`}
              onClick={() => soundEngine.playChime(659.25, 'sine', 0.15)}
              className="p-4 rounded-xl bg-[#131b2e] border border-amber-500/20 hover:border-amber-400 transition-all flex items-center gap-3.5 group block"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                  Direct Inquiries
                </span>
                <span className="font-serif text-sm font-bold text-amber-100 group-hover:text-amber-200 block truncate">
                  {DILINI_PROFILE.email}
                </span>
                <span className="text-[11px] text-amber-200/60 block mt-0.5">
                  Best for technical specifications &amp; hiring
                </span>
              </div>
            </a>

            {/* Phone Card */}
            <a
              href={`tel:${DILINI_PROFILE.phone}`}
              onClick={() => soundEngine.playChime(587.33, 'sine', 0.15)}
              className="p-4 rounded-xl bg-[#131b2e] border border-amber-500/20 hover:border-amber-400 transition-all flex items-center gap-3.5 group block"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-400/40 text-teal-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block">
                  Phone &amp; WhatsApp
                </span>
                <span className="font-serif text-sm font-bold text-amber-100 group-hover:text-teal-200 block truncate">
                  {DILINI_PROFILE.phone}
                </span>
                <span className="text-[11px] text-amber-200/60 block mt-0.5">
                  Available for calls, SMS, or WhatsApp
                </span>
              </div>
            </a>

            {/* Download CV Card */}
            <a
              href={DILINI_CV_BASE64}
              download="Dilini-Backend-Developer-CV.pdf"
              onClick={() => soundEngine.playChime(783.99, 'triangle', 0.2)}
              className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#131b2e] to-amber-500/10 border border-amber-400/50 hover:border-amber-400 transition-all flex items-center gap-3.5 group block"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/60 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileDown className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                  Curriculum Vitae
                </span>
                <span className="font-serif text-sm font-bold text-amber-200 block">
                  Download Dilini's Resume (PDF)
                </span>
                <span className="text-[11px] text-amber-200/60 block mt-0.5">
                  Latest updated credential document
                </span>
              </div>
            </a>

            {/* GitHub Profile Card */}
            <a
              href={DILINI_PROFILE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playChime(523.25, 'sine', 0.15)}
              className="p-4 rounded-xl bg-[#131b2e] border border-amber-500/20 hover:border-amber-400 transition-all flex items-center gap-3.5 group block"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Github className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block">
                  Source Code Archives
                </span>
                <span className="font-serif text-sm font-bold text-amber-100 group-hover:text-purple-200 block truncate">
                  github.com/IT21826740
                </span>
                <span className="text-[11px] text-amber-200/60 block mt-0.5">
                  14+ repositories with public code commits
                </span>
              </div>
            </a>

          </div>

        </div>

      </div>
    </section>
  );
};
