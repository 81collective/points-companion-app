import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('Missing OpenAI API key in environment variables.')
}

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: false,
})

export type { OpenAI } from 'openai'
