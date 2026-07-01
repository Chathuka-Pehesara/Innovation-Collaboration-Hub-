'use client';

interface SocialLinksProps {
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  twitter?: string | null;
}

export function SocialLinks({ github, linkedin, portfolio, twitter }: SocialLinksProps) {
  return (
    <div className="flex items-center gap-3.5 text-xs font-semibold text-gray-500">
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          GitHub
        </a>
      )}
      {linkedin && (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-indigo-400 transition-colors"
        >
          LinkedIn
        </a>
      )}
      {portfolio && (
        <a
          href={portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-400 transition-colors"
        >
          Portfolio
        </a>
      )}
      {twitter && (
        <a
          href={twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-sky-400 transition-colors"
        >
          Twitter
        </a>
      )}
    </div>
  );
}
