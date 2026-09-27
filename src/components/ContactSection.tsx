import React, { useState } from 'react';
import { Mail, Phone, FileDown, Github, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { DILINI_PROFILE } from '../data/portfolioData';
import { DILINI_CV_BASE64 } from '../data/cvData';
import { natureAudio } from '../utils/natureAudio';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ msg: string; isError: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !contact.trim() || !message.trim()) {
      natureAudio.playBell(330, 0.2);
      setStatus({ msg: 'Please provide your name, contact details, and inquiry.', isError: true });
      return;
    }

    natureAudio.playBell(659.25, 0.4);
    const body = `Hi Dilini, I'm ${name} (${contact}). ${message}`;
    setStatus({
      msg: 'Message prepared! Opening your native messaging app to send.',
      isError: false,
    });

    setTimeout(() => {
      window.location.href = `sms:${DILINI_PROFILE.phone}?&body=${encodeURIComponent(body)}`;
    }, 400);
  };

  return (
    <section id="contact" className="relative py-16 lg:py-24 border-t border-emerald-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs font-serif text-emerald-400 tracking-widest uppercase mb-1">
            <span>Nature Sanctuary Dispatch</span>
            <span aria-hidden="true">·</span>
            <span>Get in Touch</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#f4efe6] tracking-tight">
            Connect &amp; Collaborate
          </h2>
          <p className="text-sm text-emerald-100/70 mt-2 font-sans">
            Have a project in mind, need a full-stack Spring Boot engineer, or want to discuss IoT and systems development? Leave a message below or reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form */}
          <div className="lg:col-span-7 rounded-2xl bg-gradient-to-b from-[#13221b] to-[#09120e] border-2 border-emerald-500/30 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <h3 className="font-serif text-xl font-bold text-emerald-100 mb-5">
              Send an Inquiry
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-serif text-emerald-200 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Breton"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#09130f] border border-emerald-500/30 text-emerald-100 text-xs placeholder-emerald-100/30 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label htmlFor="contact-info" className="block text-xs font-serif text-emerald-200 mb-1.5">
                    Email or Phone *
                  </label>
                  <input
                    id="contact-info"
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. jordan@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#09130f] border border-emerald-500/30 text-emerald-100 text-xs placeholder-emerald-100/30 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-serif text-emerald-200 mb-1.5">
                  Message or Project Brief *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Outline your project scope, backend engineering requirements, or questions..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#09130f] border border-emerald-500/30 text-emerald-100 text-xs placeholder-emerald-100/30 focus:outline-none focus:border-emerald-400 resize-y"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#09120e] font-serif text-xs font-bold shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Prepare Message (SMS)</span>
                </button>

                {status && (
                  <div
                    className={`flex items-center gap-1.5 text-xs ${
                      status.isError ? 'text-rose-400' : 'text-emerald-300'
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

          {/* Right Direct Channels */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Email */}
            <a
              href={`mailto:${DILINI_PROFILE.email}`}
              onClick={() => natureAudio.playWaterDrop()}
              className="p-4 rounded-xl bg-[#13221b] border border-emerald-500/20 hover:border-emerald-400 transition-all flex items-center gap-3.5 group block"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
                  Direct Inquiries
                </span>
                <span className="font-serif text-sm font-bold text-[#f4efe6] group-hover:text-emerald-200 block truncate">
                  {DILINI_PROFILE.email}
                </span>
                <span className="text-[11px] text-emerald-200/60 block mt-0.5">
                  Best for technical specifications &amp; career opportunities
                </span>
              </div>
            </a>

            {/* Phone */}
            <a
              href={`tel:${DILINI_PROFILE.phone}`}
              onClick={() => natureAudio.playWaterDrop()}
              className="p-4 rounded-xl bg-[#13221b] border border-emerald-500/20 hover:border-emerald-400 transition-all flex items-center gap-3.5 group block"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-400/40 text-teal-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block">
                  Phone &amp; WhatsApp
                </span>
                <span className="font-serif text-sm font-bold text-[#f4efe6] group-hover:text-teal-200 block truncate">
                  {DILINI_PROFILE.phone}
                </span>
                <span className="text-[11px] text-emerald-200/60 block mt-0.5">
                  Available for calls, SMS, or WhatsApp
                </span>
              </div>
            </a>

            {/* Download Resume */}
            <a
              href={DILINI_CV_BASE64}
              download="Dilini-Backend-Developer-CV.pdf"
              onClick={() => natureAudio.playBell(783.99, 0.3)}
              className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-[#13221b] to-emerald-500/10 border border-emerald-400/50 hover:border-emerald-400 transition-all flex items-center gap-3.5 group block"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileDown className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
                  Curriculum Vitae
                </span>
                <span className="font-serif text-sm font-bold text-emerald-200 block">
                  Download Dilini's Resume (PDF)
                </span>
                <span className="text-[11px] text-emerald-200/60 block mt-0.5">
                  Latest updated credential document
                </span>
              </div>
            </a>

            {/* GitHub */}
            <a
              href={DILINI_PROFILE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => natureAudio.playWaterDrop()}
              className="p-4 rounded-xl bg-[#13221b] border border-emerald-500/20 hover:border-emerald-400 transition-all flex items-center gap-3.5 group block"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Github className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block">
                  GitHub Profile
                </span>
                <span className="font-serif text-sm font-bold text-[#f4efe6] group-hover:text-purple-200 block truncate">
                  github.com/IT21826740
                </span>
                <span className="text-[11px] text-emerald-200/60 block mt-0.5">
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
