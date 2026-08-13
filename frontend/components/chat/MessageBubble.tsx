import { FileText, Image, Download, Check, CheckCheck } from 'lucide-react';
import { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isAttachment = !!message.fileUrl;
  const isImage = isAttachment && message.fileType?.startsWith('image/');
  
  // A message is read by someone else if there is a receipt that does not belong to the sender
  const isRead = message.receipts && message.receipts.some(r => r.userId !== message.senderId);

  // Format creation time
  const timeString = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex w-full flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      <span className="text-2xs text-slate-400 mb-1 px-1 dark:text-slate-500">
        {isOwn ? 'You' : message.senderId}
      </span>

      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 border ${
        isOwn 
          ? 'bg-indigo-600/10 border-indigo-600/20 text-textPrimary dark:bg-indigo-600 dark:text-white dark:border-transparent rounded-tr-none' 
          : 'bg-slate-100 border-transparent text-slate-800 dark:bg-slate-800 dark:border-transparent dark:text-slate-150 rounded-tl-none'
      }`}>
        {/* Render Text message */}
        {message.content && <p className="text-sm leading-relaxed break-words">{message.content}</p>}

        {/* Render File attachment */}
        {isAttachment && (
          <div className="mt-1">
            {isImage ? (
              <a 
                href={message.fileUrl!} 
                target="_blank" 
                rel="noreferrer"
                className="block overflow-hidden rounded-lg border border-slate-200/40 hover:opacity-90 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={message.fileUrl!} 
                  alt={message.fileName || 'Image attachment'} 
                  className="max-h-60 max-w-full object-contain"
                />
              </a>
            ) : (
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                isOwn 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-white border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 text-slate-800'
              }`}>
                {message.fileType?.includes('pdf') ? (
                  <FileText className={`h-8 w-8 shrink-0 ${isOwn ? 'text-white' : 'text-indigo-600'}`} />
                ) : (
                  <Image className={`h-8 w-8 shrink-0 ${isOwn ? 'text-white' : 'text-slate-500'}`} />
                )}
                
                <div className="flex-1 min-w-0 text-left">
                  <p className={`text-xs font-semibold truncate ${isOwn ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                    {message.fileName || 'Attachment'}
                  </p>
                  <span className={`text-3xs ${isOwn ? 'text-white/60' : 'text-slate-400'}`}>
                    File attachment
                  </span>
                </div>

                <a
                  href={message.fileUrl!}
                  download={message.fileName || 'file'}
                  className={`p-2 rounded-lg hover:scale-105 transition-all shrink-0 ${
                    isOwn 
                      ? 'bg-white/25 hover:bg-white/30 text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                  }`}
                  title="Download File"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Meta indicators: Time + Read receipts */}
      <div className="flex items-center gap-1.5 mt-1 px-1 text-3xs text-slate-400 dark:text-slate-500">
        <span>{timeString}</span>
        {isOwn && (
          <span title={isRead ? "Read by participant" : "Sent successfully"}>
            {isRead ? (
              <CheckCheck className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            ) : (
              <Check className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}
