import React, { useEffect, useState } from 'react';
import { Github, Star, GitFork, ExternalLink, Play, Sparkles, RefreshCw, Radio } from 'lucide-react';
import { YOUTUBE_CHANNELS } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';

interface GithubRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork: boolean;
}

interface GithubStats {
  public_repos: number;
  followers: number;
  total_stars: number;
}

export const AdventurersGuildBoard: React.FC = () => {
  const [stats, setStats] = useState<GithubStats | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchGithub() {
      try {
        setLoading(true);
        setError(false);

        const [userRes, reposRes] = await Promise.all([
          fetch('https://api.github.com/users/IT21826740'),
          fetch('https://api.github.com/users/IT21826740/repos?per_page=100&sort=updated'),
        ]);

        if (!userRes.ok || !reposRes.ok) {
          throw new Error('GitHub API unavailable');
        }

        const user = await userRes.json();
        const reposData: GithubRepo[] = await reposRes.json();

        if (isMounted) {
          const totalStars = reposData.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
          setStats({
            public_repos: user.public_repos || reposData.length,
            followers: user.followers || 0,
            total_stars: totalStars,
          });

          // Filter non-forked repos, take top 6
          const visible = reposData.filter((r) => !r.fork).slice(0, 6);
          setRepos(visible.length > 0 ? visible : reposData.slice(0, 6));
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchGithub();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="guild" className="relative py-16 lg:py-24 border-t border-amber-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-serif text-amber-400 tracking-widest uppercase mb-1">
              <span>Adventurers' Guild Board</span>
              <span aria-hidden="true">·</span>
              <span>Live GitHub Log &amp; Media</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-100 tracking-tight">
              Dispatches from the Field
            </h2>
            <p className="text-sm text-amber-100/70 max-w-2xl mt-2 font-sans">
              Live code telemetry streamed directly from GitHub repositories alongside creative digital productions and video channels.
            </p>
          </div>

          <a
            href="https://github.com/IT21826740"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playChime(659.25, 'sine', 0.2)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#131b2c] hover:bg-[#1a253e] text-amber-200 border border-amber-500/30 text-xs font-serif font-bold transition-all self-start md:self-auto"
          >
            <Github className="w-4 h-4 text-amber-400" />
            <span>@IT21826740 on GitHub ↗</span>
          </a>
        </div>

        {/* Live GitHub Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
          <div className="p-4 rounded-xl bg-[#111728]/80 border border-amber-500/20 text-center">
            <span className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              {loading ? '...' : stats?.public_repos ?? '14+'}
            </span>
            <span className="block text-xs text-amber-100/60 mt-1 font-serif">Public Repositories</span>
          </div>

          <div className="p-4 rounded-xl bg-[#111728]/80 border border-amber-500/20 text-center">
            <span className="font-serif text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono">
              {loading ? '...' : stats?.followers ?? '10+'}
            </span>
            <span className="block text-xs text-amber-100/60 mt-1 font-serif">Followers</span>
          </div>

          <div className="p-4 rounded-xl bg-[#111728]/80 border border-amber-500/20 text-center">
            <span className="font-serif text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
              {loading ? '...' : stats?.total_stars ?? '5+'}
            </span>
            <span className="block text-xs text-amber-100/60 mt-1 font-serif">Total Stars</span>
          </div>

          <div className="p-4 rounded-xl bg-[#111728]/80 border border-amber-500/20 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-mono font-bold text-sm sm:text-base">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>LIVE</span>
            </div>
            <span className="block text-xs text-amber-100/60 mt-2 font-serif">Synced with GitHub</span>
          </div>
        </div>

        {/* Live Repository Cards */}
        <div className="mb-12">
          <h3 className="font-serif text-lg font-bold text-amber-200 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Active Repositories &amp; Codebases</span>
          </h3>

          {loading && (
            <div className="p-8 rounded-2xl bg-[#101625]/60 border border-dashed border-amber-500/25 text-center text-xs text-amber-200/70">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
              <span>Connecting to GitHub API server...</span>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-center text-xs text-amber-200/80">
              <p>GitHub real-time feed temporarily restricted by rate limits.</p>
              <a
                href="https://github.com/IT21826740"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-amber-400 font-bold hover:underline"
              >
                Browse all public repositories directly on GitHub ↗
              </a>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repos.map((repo) => (
                <a
                  key={repo.name}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 rounded-xl bg-gradient-to-b from-[#131b2e] to-[#0a0d16] border border-amber-500/20 hover:border-amber-400/70 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-serif text-sm font-bold text-amber-100 group-hover:text-amber-200 transition-colors truncate">
                        {repo.name}
                      </h4>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0 opacity-70 group-hover:opacity-100" />
                    </div>

                    <p className="text-xs text-amber-100/65 line-clamp-2 font-sans mb-3">
                      {repo.description || 'Public repository on GitHub.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-amber-500/10 flex items-center justify-between text-[11px] text-amber-400/80 font-mono">
                    <div className="flex items-center gap-3">
                      {repo.language && <span>{repo.language}</span>}
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" /> {repo.stargazers_count}
                      </span>
                    </div>
                    <span>{new Date(repo.updated_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* YouTube & Creative Channels */}
        <div>
          <div className="mb-4">
            <span className="text-xs font-serif uppercase tracking-widest text-amber-400/80 block">
              Beyond the Code
            </span>
            <h3 className="font-serif text-lg font-bold text-amber-200">
              Creative Channels &amp; Video Publications
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {YOUTUBE_CHANNELS.map((ch) => (
              <a
                key={ch.title}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundEngine.playChime(783.99, 'triangle', 0.2)}
                className="group p-5 rounded-2xl bg-gradient-to-b from-[#141b2a] to-[#0a0d16] border border-amber-500/25 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                    {ch.type} · {ch.handle}
                  </span>
                  <h4 className="font-serif text-base font-bold text-amber-100 group-hover:text-amber-200 truncate">
                    {ch.title}
                  </h4>
                  <p className="text-xs text-amber-100/65 line-clamp-1 font-sans mt-0.5">
                    {ch.description}
                  </p>
                </div>

                <ExternalLink className="w-4 h-4 text-amber-400 shrink-0 opacity-70 group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
