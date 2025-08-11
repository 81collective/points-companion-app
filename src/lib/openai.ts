import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY
export const isOpenAIConfigured = !!apiKey

let _client: OpenAI | null = null

export function getOpenAIClient(): OpenAI | null {
  if (!apiKey) return null
  if (!_client) {
    _client = new OpenAI({ apiKey, dangerouslyAllowBrowser: false })
  }
  return _client
}

// Backwards compatibility named export used by helpers; will be null if not configured
export const openai = getOpenAIClient()

export type { OpenAI } from 'openai'
