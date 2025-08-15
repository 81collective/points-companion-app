'use client';
import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

type Msg = { role: 'user' | 'assistant'; content: string; id: string };
export function ConversationDisplay({ messages, typing, onViewCard, onAddCard, onSearchOtherLocation, onRefreshNearby, onAskQuestion }: { messages: Msg[]; typing?: boolean; onViewCard?: (name: string, issuer?: string) => void; onAddCard?: (name: string, issuer?: string) => void; onSearchOtherLocation?: () => void; onRefreshNearby?: () => void; onAskQuestion?: (seed?: string) => void }) {
  const tsMapRef = useRef<Map<string, Date>>(new Map());
  const [shownTs, setShownTs] = useState<Set<string>>(new Set());
  const [sheet, setSheet] = useState<null | { name: string; issuer?: string; summary?: string; est_value_usd?: number }>(null);
  const fmt = (d: Date) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(d);
  return (
  <div className="flex flex-col gap-0 px-2 sm:px-0">
      <AnimatePresence initial={false}>
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        const next = messages[i + 1];
        const isUser = m.role === 'user';
        const firstOfGroup = !prev || prev.role !== m.role;
        const lastOfGroup = !next || next.role !== m.role;
        if (!tsMapRef.current.has(m.id)) tsMapRef.current.set(m.id, new Date());
        const ts = tsMapRef.current.get(m.id)!;
        const isTsShown = shownTs.has(m.id);
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
      <div className={`max-w-[90%] relative ${isUser ? 'items-end' : 'items-start'} flex flex-col group`}> 
              {firstOfGroup && (
                <span className="text-[13px] text-gray-600 mb-1 select-none">{isUser ? 'You' : 'Assistant'}</span>
              )}
              <div className={`
        text-[16px] leading-snug whitespace-pre-wrap px-3 py-2 rounded-2xl shadow-md text-left
                ${isUser ? 'bg-[#1976D2] text-white' : 'bg-[#E5E5EA] text-gray-900'}
                ${isUser ? (firstOfGroup ? 'rounded-br-sm' : 'rounded-br-2xl') : (firstOfGroup ? 'rounded-bl-sm' : 'rounded-bl-2xl')}
              `}
                role="button" aria-label="Toggle timestamp" tabIndex={0}
                onClick={() => setShownTs(prev => { const n = new Set(prev); if (n.has(m.id)) { n.delete(m.id); } else { n.add(m.id); } return n; })}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShownTs(prev => { const n = new Set(prev); if (n.has(m.id)) { n.delete(m.id); } else { n.add(m.id); } return n; }); } }}
              >
                {isUser ? (
                  <p className="text-left">{m.content}</p>
                ) : (
                  <AssistantContent content={m.content} onViewCard={onViewCard} onAddCard={onAddCard} onSearchOtherLocation={onSearchOtherLocation} onRefreshNearby={onRefreshNearby} onAskQuestion={onAskQuestion} onOpenDetails={(name, issuer, summary, est) => setSheet({ name, issuer, summary, est_value_usd: est })} />
                )}
                {/* Tail */}
                {firstOfGroup && (
                  <span className={`absolute -bottom-1 ${isUser ? '-right-1' : '-left-1'} w-2 h-2 bg-current rounded-sm rotate-45`} aria-hidden="true" />
                )}
              </div>
              {/* Timestamp placeholder (hidden by default, could show on hover) */}
              {lastOfGroup && (
                <span className={`text-[12px] text-[#8E8E93] mt-1 transition-opacity select-none ${isTsShown ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>{fmt(ts)}</span>
              )}
            </div>
          </motion.div>
        );
      })}
      </AnimatePresence>
  {typing && (
        <div className="flex justify-start mt-2">
          <div className="max-w-[90%]">
            <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-[#E5E5EA] text-gray-700 inline-flex items-center gap-1">
              <span className="sr-only">Assistant is typing</span>
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '100ms' }} />
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
          </div>
        </div>
      )}
      {/* Bottom sheet for card details */}
      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-black/30" aria-label="Close" onClick={() => setSheet(null)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 shadow-xl"
              role="dialog" aria-label="Card details"
            >
              <div className="h-1 w-10 bg-gray-300 rounded mx-auto mb-3" />
              <div className="text-sm font-semibold text-gray-900">{sheet.name}</div>
              {sheet.issuer && <div className="text-xs text-gray-500 mb-2">{sheet.issuer}</div>}
              {typeof sheet.est_value_usd === 'number' && (
                <div className="text-xs text-gray-600">Est. value per $100: ${sheet.est_value_usd}</div>
              )}
              {sheet.summary && <div className="text-sm text-gray-700 mt-2">{sheet.summary}</div>}
              <div className="mt-4 flex gap-2">
                <button onClick={() => { onViewCard?.(sheet.name, sheet.issuer); }} className="px-3 py-1.5 text-sm rounded-full border border-gray-300 hover:bg-gray-50">Open in Wallet</button>
                <button onClick={() => { onAddCard?.(sheet.name, sheet.issuer); }} className="px-3 py-1.5 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700">Add to Wallet</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AssistantContent({ content, onViewCard, onAddCard, onSearchOtherLocation, onRefreshNearby, onAskQuestion, onOpenDetails }: { content: string; onViewCard?: (name: string, issuer?: string) => void; onAddCard?: (name: string, issuer?: string) => void; onSearchOtherLocation?: () => void; onRefreshNearby?: () => void; onAskQuestion?: (seed?: string) => void; onOpenDetails?: (name: string, issuer?: string, summary?: string, est?: number) => void }) {
  if (content.startsWith('RECS_JSON:')) {
    try {
      const raw = JSON.parse(content.slice('RECS_JSON:'.length));
      const data = (Array.isArray(raw) ? raw : (raw?.items || [])) as Array<{ card: { card_name: string; issuer: string }; summary?: string; est_value_usd?: number }>;
      const meta = Array.isArray(raw) ? undefined : raw?.meta as { label?: string; updatedAt?: string } | undefined;
      return (
        <div className="space-y-2 text-left">
          {/* Swipeable row of flippable cards */}
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
            {data.map((d, i) => (
              <FlippableCard
                key={i}
                name={d.card.card_name}
                issuer={d.card.issuer}
                summary={d.summary}
                est={typeof d.est_value_usd === 'number' ? d.est_value_usd : undefined}
                onView={() => onOpenDetails?.(d.card.card_name, d.card.issuer, d.summary, d.est_value_usd)}
                onAdd={() => onAddCard?.(d.card.card_name, d.card.issuer)}
              />
            ))}
          </div>
          {/* Under-card quick actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={() => onSearchOtherLocation?.()} className="px-3 py-1.5 text-xs rounded-full border border-gray-300 hover:bg-gray-50">Search other location</button>
            <button onClick={() => onRefreshNearby?.()} className="px-3 py-1.5 text-xs rounded-full border border-gray-300 hover:bg-gray-50">Refresh nearby</button>
            <button onClick={() => onAskQuestion?.('I have another question about these picks')} className="px-3 py-1.5 text-xs rounded-full border border-gray-300 hover:bg-gray-50">Ask a question</button>
          </div>
          {meta && (
            <div className="text-[12px] text-gray-500 pt-1">
              Updated for {meta.label || 'this plan'} just now
            </div>
          )}
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

function FlippableCard({ name, issuer, summary, est, onView, onAdd }: { name: string; issuer?: string; summary?: string; est?: number; onView: () => void; onAdd: () => void }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="snap-start shrink-0 w-[280px] h-[170px] perspective-1000">
      <div className={`relative w-full h-full transition-transform duration-300 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
        <div className="absolute inset-0 bg-white rounded-2xl border border-gray-200 p-3 shadow-sm [backface-visibility:hidden]">
          <div className="text-sm font-medium flex items-center gap-2">
            <span role="img" aria-label="card">💳</span>
            <span className="truncate">{name}</span>
          </div>
          {issuer && <div className="text-xs text-gray-500">— {issuer}</div>}
          {summary && <div className="text-xs text-gray-700 mt-2 line-clamp-3">{summary}</div>}
          {typeof est === 'number' && <div className="text-[11px] text-gray-500 mt-1">Est. per $100: ${est}</div>}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            <button onClick={onView} className="px-2 py-1 text-xs rounded-full border border-gray-300 hover:bg-gray-50">Details</button>
            <button onClick={onAdd} className="px-2 py-1 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700">Add</button>
            <button onClick={() => setFlipped(v => !v)} className="ml-auto px-2 py-1 text-xs rounded-full border border-gray-200">Flip</button>
          </div>
        </div>
        <div className="absolute inset-0 bg-gray-50 rounded-2xl border border-gray-200 p-3 shadow-sm [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="text-xs text-gray-600 mb-2">Transparent math</div>
          <div className="text-[11px] text-gray-700">Estimates based on typical point values and category multipliers. Opportunity cost and limits may apply.</div>
          <div className="absolute bottom-3 left-3 right-3">
            <button onClick={() => setFlipped(false)} className="px-2 py-1 text-xs rounded-full border border-gray-300">Flip back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
