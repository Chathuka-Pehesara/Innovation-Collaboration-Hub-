export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-full w-fit">
      <div className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" />
    </div>
  );
}
