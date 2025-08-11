import { IAssetsConfigService, AssetsConfigServiceToken } from './assets-config-service.js';
import axios from 'axios';
import { DI, ILogger, inject, resolve } from 'aurelia';

export interface ITelegramService {
  sendTelegramMessage(message: string): Promise<void>;
  sendTelegramErrorMessage(err: Error | unknown): Promise<void>;
}

export const TelegramServiceToken = DI.createInterface<ITelegramService>('ITelegramService');

@inject(AssetsConfigServiceToken)
export class TelegramService implements ITelegramService {

  constructor(
    private readonly assetsConfigService: IAssetsConfigService
  ) { }

  private readonly logger: ILogger = resolve(ILogger).scopeTo('EnvService');

  async sendTelegramMessage(message: string): Promise<void> {

    const token = this.assetsConfigService.telegramBotToken;
    const chatId = this.assetsConfigService.telegramChatId;
    const baseUrl = 'https://api.telegram.org';
    const path = `/bot${token}/sendMessage`;
    const url = `${baseUrl}${path}`;

    // this.logger.trace('Telegram API debug:', {
    //   token: token ? token.substring(0, 10) + '...' : 'missing',
    //   chatId,
    //   url,
    //   messageLength: message.length
    // });

    try {
      await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
      });

      // this.logger.trace('Telegram API success:', response.status);
      return;
    } catch (error) {
      this.logger.error('Telegram API error:', error);
      this.logger.error('Telegram error response:', error.response?.data);
      this.logger.error('Telegram error status:', error.response?.status);
      throw error;
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  sendTelegramErrorMessage(err: Error | unknown): Promise<void> {
    const message = this.errorMessageToTelegramMessage(err);
    return this.sendTelegramMessage(message);
  }

  private errorMessageToTelegramMessage(err: Error | unknown): string {
    const timestamp = new Date().toISOString();

    if (err instanceof Error) {
      return `
<b>🛑 Error Alert</b>
<b>Time:</b> <code>${timestamp}</code>
<b>Type:</b> ${this.escapeHtml(err.name)}
<b>Message:</b> <code>${this.escapeHtml(err.message)}</code>
<b>Stack Trace:</b>
<pre>${this.escapeHtml(err.stack || '')}</pre>
    `.trim();
    } else {
      const fallback = typeof err === 'string'
        ? this.escapeHtml(err)
        : this.escapeHtml(JSON.stringify(err, null, 2));

      return `
<b>🛑 Unknown Error</b>
<b>Time:</b> <code>${timestamp}</code>
<pre>${fallback}</pre>
    `.trim();
    }
  }
}