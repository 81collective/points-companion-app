'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ConversationDisplay({ messages }: { messages: { role: 'user' | 'assistant'; content: string; id: string }[] }) {
  return (
    <div className="space-y-3">
      {messages.map(m => (
        <div
          key={m.id}
          className={`p-4 border ${m.role === 'assistant' ? 'bg-gray-50 border-gray-200' : 'bg-blue-600 text-white border-blue-600'}`}
        >
          {m.role === 'assistant' ? (
            <div className="text-base prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-code:px-1 prose-code:py-0.5 prose-code:bg-gray-100 prose-code:rounded">
              <ReactMarkdown remarkPlugins={[remarkGfm]}
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code({_node, inline, className, children, ...props}: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return inline ? (
                      <code className={className} {...props}>{children}</code>
                    ) : (
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard?.writeText(String(children ?? ''))}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 bg-gray-700 text-white rounded"
                          aria-label="Copy code"
                        >Copy</button>
                        <pre className="overflow-auto bg-gray-900 text-gray-100 p-3 rounded text-sm">
                          <code className={match ? `language-${match[1]}` : ''} {...props}>{children}</code>
                        </pre>
                      </div>
                    );
                  },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  a({href, children, ...props}: any) {
                    return <a href={href} target="_blank" rel="noreferrer noopener" className="text-blue-600 underline" {...props}>{children}</a>;
                  }
                }}
              >
                {m.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-base whitespace-pre-wrap">{m.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}
