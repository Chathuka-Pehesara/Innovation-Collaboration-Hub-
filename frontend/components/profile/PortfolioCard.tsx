'use client';

import Image from 'next/image';

interface PortfolioItemProps {
  item: {
    id: string | number;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    tags?: string[] | null;
    url?: string | null;
  };
}

export function PortfolioCard({ item }: PortfolioItemProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:border-indigo-500/20 hover:bg-white/[0.07] transition-all">
      {item.imageUrl && (
        <div className="relative w-full sm:w-20 h-20 rounded-lg overflow-hidden shrink-0">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
        {item.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
        )}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map((tag, idx) => (
              <span key={idx} className="text-[10px] bg-white/5 text-gray-300 px-1.5 py-0.5 rounded border border-white/5">
                {tag}
              </span>
            ))}
          </div>
        )}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            View Project &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
