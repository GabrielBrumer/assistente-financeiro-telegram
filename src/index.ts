import 'dotenv/config';
import { createBot } from './bot';

async function main(): Promise<void> {
  const bot = createBot();

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  await bot.launch();
  console.log('Assistente Financeiro iniciado!');
}

main().catch((err) => {
  console.error('Erro ao iniciar o bot:', err);
  process.exit(1);
});
