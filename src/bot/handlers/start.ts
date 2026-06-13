import { Context } from 'telegraf';
import { getOrCreateUser } from '../../services/userService';

export async function handleStart(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  await getOrCreateUser(String(from.id), from.first_name, from.username);

  const name = from.first_name ?? 'usuario';
  await ctx.reply(
    `Ola, ${name}!\n\n` +
      `Sou seu *Assistente Financeiro*. Me diga sobre suas receitas e despesas em texto ou audio.\n\n` +
      `*Exemplos:*\n` +
      `gastei 50 reais no mercado\n` +
      `ganhei 3000 de salario\n` +
      `recebi 400 reais de pix\n` +
      `quanto gastei esse mes?\n` +
      `resumo do mes\n\n` +
      `Use /help para ver todos os comandos.`,
    { parse_mode: 'Markdown' }
  );
}
