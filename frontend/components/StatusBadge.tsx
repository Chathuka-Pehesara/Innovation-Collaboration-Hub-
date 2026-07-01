const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-800 border-slate-200',
  OPEN: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase().replace(' ', '_');
  const colorClass = statusColors[normalizedStatus] || statusColors.DRAFT;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass} ${className}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
