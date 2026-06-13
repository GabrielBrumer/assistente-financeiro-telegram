import { Context } from 'telegraf';

export async function handleHelp(ctx: Context): Promise<void> {
  await ctx.reply(
    `*Assistente Financeiro - Ajuda*\n\n` +
      `*Registrar transacoes (texto ou audio):*\n` +
      `gastei 50 reais no mercado\n` +
      `paguei 120 no restaurante\n` +
      `ganhei 3000 de salario\n` +
      `recebi 400 reais de pix\n\n` +
      `*Consultas:*\n` +
      `quanto gastei esse mes?\n` +
      `quanto recebi esse mes?\n` +
      `resumo do mes\n` +
      `quanto gastei em maio?\n` +
      `quanto gastei com mercado esse mes?\n` +
      `quanto recebi nos ultimos 30 dias?\n\n` +
      `*Correcoes:*\n` +
      `apagar ultimo lancamento\n` +
      `corrigir ultimo lancamento para mercado\n` +
      `alterar valor do ultimo lancamento para 35\n\n` +
      `*Comandos:*\n` +
      `/start - Iniciar\n` +
      `/help - Esta ajuda\n` +
      `/resumo - Resumo do mes atual\n` +
      `/categorias - Ver categorias\n` +
      `/minhaconta - Informacoes da conta`,
    { parse_mode: 'Markdown' }
  );
}
