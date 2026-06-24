import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import { buildTextPrompt, buildAudioPrompt, CategoryType } from './prompts';
import { getCurrentDate } from '../utils/date';

// gemini-2.5-flash: melhor custo-beneficio para extracao financeira
// suporta texto + audio (inline data), JSON nativo, estavel (nao deprecated)
const MODEL = 'gemini-2.5-flash';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

const JSON_CONFIG = { responseMimeType: 'application/json' } as const;

export type TransactionData = {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: CategoryType;
  description: string;
  transactionDate: string;
};

export type QueryData = {
  type:
    | 'monthly_expense'
    | 'monthly_income'
    | 'monthly_summary'
    | 'expense_by_category'
    | 'income_by_period'
    | 'expense_by_period'
    | 'period_summary'
    | 'list_transactions';
  month: number | null;
  year: number | null;
  category: CategoryType | null;
  days: number | null;
  date: string | null;
};

export type CorrectionData = {
  type:
    | 'delete_last'
    | 'update_last_category'
    | 'update_last_amount'
    | 'delete_by_position'
    | 'update_by_position_category'
    | 'update_by_position_amount';
  category: CategoryType | null;
  amount: number | null;
  position: number | null;
};

export type GeminiResult = {
  intent: 'transaction' | 'query' | 'correction' | 'unknown' | 'unavailable';
  transcribedText?: string;
  transaction?: TransactionData;
  query?: QueryData;
  correction?: CorrectionData;
};

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const is503 = err?.status === 503 || String(err?.message).includes('503');
      if (is503 && attempt < retries) {
        console.warn(`Gemini 503, tentativa ${attempt}/${retries}. Aguardando ${delayMs}ms...`);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Numero maximo de tentativas atingido');
}

function parseResponse(raw: string): GeminiResult {
  // responseMimeType: 'application/json' garante JSON puro, mas limpamos por seguranca
  const cleaned = raw
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  const parsed = JSON.parse(cleaned) as {
    intent: string;
    transcribedText?: string;
    transaction?: TransactionData;
    query?: QueryData;
    correction?: CorrectionData;
  };

  const intent = parsed.intent as GeminiResult['intent'];

  return {
    intent,
    transcribedText: parsed.transcribedText,
    transaction: intent === 'transaction' ? parsed.transaction : undefined,
    query: intent === 'query' ? parsed.query : undefined,
    correction: intent === 'correction' ? parsed.correction : undefined,
  };
}

export async function parseTextMessage(text: string): Promise<GeminiResult> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL, generationConfig: JSON_CONFIG });
    const prompt = buildTextPrompt(text, getCurrentDate());
    const result = await withRetry(() => model.generateContent(prompt));
    return parseResponse(result.response.text());
  } catch (err: any) {
    const is503 = err?.status === 503 || String(err?.message).includes('503');
    console.error('Erro Gemini (texto):', err);
    return { intent: is503 ? 'unavailable' : 'unknown' };
  }
}

export async function parseAudioMessage(audioFilePath: string): Promise<GeminiResult> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL, generationConfig: JSON_CONFIG });
    const prompt = buildAudioPrompt(getCurrentDate());
    const base64Audio = fs.readFileSync(audioFilePath).toString('base64');
    const result = await withRetry(() =>
      model.generateContent([
        { text: prompt },
        { inlineData: { mimeType: 'audio/ogg', data: base64Audio } },
      ])
    );
    return parseResponse(result.response.text());
  } catch (err: any) {
    const is503 = err?.status === 503 || String(err?.message).includes('503');
    console.error('Erro Gemini (audio):', err);
    return { intent: is503 ? 'unavailable' : 'unknown' };
  }
}
