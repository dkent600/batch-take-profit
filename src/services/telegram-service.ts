import { IAssetsConfigService, AssetsConfigServiceToken } from './assets-config-service.js';
import { IApiProxyService, ApiProxyServiceToken } from './api-proxy-service.js';
import axios from 'axios';
import { DI, inject } from 'aurelia';

export interface ITelegramService {
  sendTelegramMessage(message: string): Promise<void>;
  sendTelegramErrorMessage(err: Error | unknown): Promise<void>;
}

export const TelegramServiceToken = DI.createInterface<ITelegramService>('ITelegramService');

@inject(AssetsConfigServiceToken, ApiProxyServiceToken)
export class TelegramService implements ITelegramService {

  constructor(
    private readonly assetsConfigService: IAssetsConfigService,
    private readonly apiProxyService: IApiProxyService
  ) {

  } async sendTelegramMessage(message: string): Promise<void> {

    const token = this.assetsConfigService.telegramBotToken;
    const chatId = this.assetsConfigService.telegramChatId;
    const baseUrl = 'https://api.telegram.org';
    const path = `/bot${token}/sendMessage`;
    const url = this.apiProxyService.getProxyUrl(baseUrl, path);

    // console.log('Telegram API debug:', {
    //   token: token ? token.substring(0, 10) + '...' : 'missing',
    //   chatId,
    //   url,
    //   messageLength: message.length
    // });

    try {
      const response = await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
      });

      // console.log('Telegram API success:', response.status);
      return;
    } catch (error) {
      console.error('Telegram API error:', error);
      console.error('Telegram error response:', error.response?.data);
      console.error('Telegram error status:', error.response?.status);
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