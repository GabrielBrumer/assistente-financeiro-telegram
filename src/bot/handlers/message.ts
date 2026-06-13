import { NarrowedContext, Context } from 'telegraf';
import { Update, Message } from 'telegraf/types';
import { getOrCreateUser } from '../../services/userService';
import { parseTextMessage } from '../../llm/gemini';
import { processGeminiResult } from './shared';

type TextContext = NarrowedContext<Context, Update.MessageUpdate<Message.TextMessage>>;

export async function handleTextMessage(ctx: TextContext): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const text = ctx.message.text;
  if (text.startsWith('/')) return;

  const user = await getOrCreateUser(String(from.id), from.first_name, from.username);

  await ctx.sendChatAction('typing');

  const result = await parseTextMessage(text);
  await processGeminiResult(ctx, user.id, result, text);
}
