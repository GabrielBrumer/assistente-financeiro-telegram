import { Context } from 'telegraf';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { getOrCreateUser } from '../../services/userService';
import { parseAudioMessage } from '../../llm/gemini';
import { processGeminiResult } from './shared';

async function downloadFile(fileId: string, botToken: string): Promise<string> {
  const infoUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
  const infoRes = await axios.get<{ result: { file_path: string } }>(infoUrl);
  const filePath = infoRes.data.result.file_path;

  const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
  const downloadRes = await axios.get(downloadUrl, { responseType: 'arraybuffer' });

  const tmpPath = path.join('/tmp', `audio_${Date.now()}.ogg`);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  fs.writeFileSync(tmpPath, Buffer.from(downloadRes.data));
  return tmpPath;
}

export async function handleVoiceAudio(ctx: Context, fileId: string): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const botToken = process.env.TELEGRAM_BOT_TOKEN ?? '';
  const user = await getOrCreateUser(String(from.id), from.first_name, from.username);

  await ctx.sendChatAction('typing');

  let tmpPath: string | null = null;

  try {
    tmpPath = await downloadFile(fileId, botToken);
    const result = await parseAudioMessage(tmpPath);
    await processGeminiResult(ctx, user.id, result, result.transcribedText ?? '');
  } catch (err) {
    console.error('Erro ao processar audio:', err);
    await ctx.reply('Erro ao processar o audio. Por favor, tente novamente.');
  } finally {
    if (tmpPath && fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
  }
}
