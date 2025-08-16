import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1" aria-live="polite" aria-label="Assistant is typing">
      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.1s]"></span>
      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></span>
    </div>
  );
}
