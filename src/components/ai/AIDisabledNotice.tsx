"use client";
import { isOpenAIConfigured } from '@/lib/openai';

export default function AIDisabledNotice() {
  if (isOpenAIConfigured) return null;
  return (
    <div className="mb-4 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-3 text-dim">
      <strong className="block mb-1 text-[var(--color-text)]">AI features unavailable</strong>
      Configure an OpenAI API key to enable personalized recommendations and predictive insights.
    </div>
  );
}
