'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

type Msg = { role: 'user' | 'assistant'; content: string; id: string };

export function ConversationDisplay({ messages, typing }: { messages: Msg[]; typing?: boolean }) {
  return (
    <div className="flex flex-col gap-0 px-2 sm:px-0">
      <AnimatePresence initial={false}>
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        const next = messages[i + 1];
        const isUser = m.role === 'user';
        const firstOfGroup = !prev || prev.role !== m.role;
        const lastOfGroup = !next || next.role !== m.role;
        return (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${firstOfGroup ? 'mt-3' : 'mt-0.5'}`}
          >
            <div className={`max-w-[70%] relative ${isUser ? 'items-end' : 'items-start'} flex flex-col`}> 
              {firstOfGroup && (
                <span className="text-[13px] text-gray-600 mb-1 select-none">{isUser ? 'You' : 'Assistant'}</span>
              )}
              <div className={`
                text-[16px] leading-snug whitespace-pre-wrap px-3 py-2 rounded-2xl shadow-sm text-left
                ${isUser ? 'bg-[#1976D2] text-white' : 'bg-[#E5E5EA] text-gray-900'}
                ${isUser ? (firstOfGroup ? 'rounded-br-sm' : 'rounded-br-2xl') : (firstOfGroup ? 'rounded-bl-sm' : 'rounded-bl-2xl')}
              `}>
                {isUser ? (
                  <p className="text-left">{m.content}</p>
                ) : (
                  <AssistantContent content={m.content} />
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
          </motion.div>
        );
      })}
      </AnimatePresence>
      {typing && (
        <div className="flex justify-start mt-2">
          <div className="max-w-[70%]">
            <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-[#E5E5EA] text-gray-700 inline-flex items-center gap-1">
              <span className="sr-only">Assistant is typing</span>
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '100ms' }} />
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssistantContent({ content }: { content: string }) {
  if (content.startsWith('RECS_JSON:')) {
    try {
      const data = JSON.parse(content.slice('RECS_JSON:'.length)) as Array<{ card: { card_name: string; issuer: string }; summary?: string; est_value_usd?: number }>;
      return (
  <div className="space-y-2 text-left">
          {data.map((d, i) => (
            <div key={i} className="w-full bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
              <div className="text-sm font-medium flex items-center gap-2">
                <span role="img" aria-label="card">💳</span>
                <span>{d.card.card_name}</span>
                <span className="text-gray-500">— {d.card.issuer}</span>
              </div>
              {d.summary && <div className="text-sm text-gray-700 mt-1">{d.summary}</div>}
              {typeof d.est_value_usd === 'number' && (
                <div className="text-xs text-gray-500 mt-1">Est. value per $100: ${d.est_value_usd}</div>
              )}
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1.5 text-sm rounded-full border border-gray-300 hover:bg-gray-50">View Details</button>
                <button className="px-3 py-1.5 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700">Add to Wallet</button>
              </div>
            </div>
          ))}
        </div>
      );
    } catch {}
  }
  return (
  <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-code:px-1 prose-code:py-0.5 prose-code:bg-gray-100 prose-code:rounded text-left">
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
        {content}
      </ReactMarkdown>
    </div>
  );
}
