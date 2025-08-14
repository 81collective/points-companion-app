'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Msg = { role: 'user' | 'assistant'; content: string; id: string };

export function ConversationDisplay({ messages }: { messages: Msg[] }) {
  return (
    <div className="flex flex-col gap-0 px-2 sm:px-0">
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        const next = messages[i + 1];
        const isUser = m.role === 'user';
        const firstOfGroup = !prev || prev.role !== m.role;
        const lastOfGroup = !next || next.role !== m.role;
        return (
          <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${firstOfGroup ? 'mt-3' : 'mt-0.5'} transition-all duration-200`}>
            <div className={`max-w-[70%] relative ${isUser ? 'items-end' : 'items-start'} flex flex-col`}> 
              {firstOfGroup && (
                <span className="text-[13px] text-gray-600 mb-1 select-none">{isUser ? 'You' : 'Assistant'}</span>
              )}
              <div className={`
                text-[16px] leading-snug whitespace-pre-wrap px-3 py-2 rounded-2xl shadow-sm
                ${isUser ? 'bg-[#007AFF] text-white' : 'bg-[#E5E5EA] text-gray-900'}
                ${isUser ? (firstOfGroup ? 'rounded-br-sm' : 'rounded-br-2xl') : (firstOfGroup ? 'rounded-bl-sm' : 'rounded-bl-2xl')}
              `}>
                {isUser ? (
                  <p>{m.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-code:px-1 prose-code:py-0.5 prose-code:bg-gray-100 prose-code:rounded">
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
                )}
                {/* Tail */}
                {firstOfGroup && (
                  <span className={`absolute -bottom-1 ${isUser ? '-right-1' : '-left-1'} w-2 h-2 bg-current rounded-sm rotate-45`} aria-hidden="true" />
                )}
              </div>
              {/* Timestamp placeholder (hidden by default, could show on hover) */}
              {lastOfGroup && (
                <span className="text-[12px] text-[#8E8E93] mt-1 opacity-0 hover:opacity-100 transition-opacity select-none">{/* 12:34 PM */}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
