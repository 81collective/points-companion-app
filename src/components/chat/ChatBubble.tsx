import React from 'react';

interface ChatBubbleProps {
  message: string;
  sender: 'user' | 'assistant';
  timestamp?: number;
  richContent?: React.ReactNode;
}

export default function ChatBubble({ message, sender, timestamp, richContent }: ChatBubbleProps) {
  const isUser = sender === 'user';
  const alignment = isUser ? 'justify-end' : 'justify-start';
  const maxWidth = 'max-w-[90%] sm:max-w-[85%]';
  const bubbleStyles = isUser
    ? 'bg-blue-600 text-white'
    : 'bg-blue-50 text-blue-900 border border-blue-200';

  return (
    <div className={`w-full flex ${alignment}`}>
      <div className={`rounded-2xl px-4 py-2 ${maxWidth} ${bubbleStyles}`}>
        {message && <div className="whitespace-pre-wrap leading-relaxed">{message}</div>}
        {richContent && (
          <div className="mt-2">
            {richContent}
          </div>
        )}
        {timestamp && (
          <div className={`mt-1 text-[10px] ${isUser ? 'text-blue-100' : 'text-blue-700'}`}>
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
