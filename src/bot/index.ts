import { Telegraf } from 'telegraf';
import { registerHandlers } from './handlers';

export function createBot(): Telegraf {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN nao configurado');

  const bot = new Telegraf(token);
  registerHandlers(bot);
  return bot;
}
