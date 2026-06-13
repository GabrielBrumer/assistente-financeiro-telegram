import { Telegraf } from 'telegraf';
import { handleStart } from './start';
import { handleHelp } from './help';
import { handleTextMessage } from './message';
import { handleVoiceAudio } from './audio';
import { handleResumo, handleCategorias, handleMinhaConta } from './commands';

export function registerHandlers(bot: Telegraf): void {
  bot.start(handleStart);
  bot.help(handleHelp);
  bot.command('resumo', handleResumo);
  bot.command('categorias', handleCategorias);
  bot.command('minhaconta', handleMinhaConta);
  bot.on('voice', (ctx) => handleVoiceAudio(ctx, ctx.message.voice.file_id));
  bot.on('audio', (ctx) => handleVoiceAudio(ctx, ctx.message.audio.file_id));
  bot.on('text', handleTextMessage);
}
