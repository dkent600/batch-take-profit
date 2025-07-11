import * as dotenv from 'dotenv';
import axios from 'axios';

export interface ITelegramService {
  sendTelegramMessage(message: string): Promise<void>;
  sendTelegramErrorMessage(err: Error | unknown): Promise<void>;
}

export class TelegramService implements ITelegramService {
  async sendTelegramMessage(message: string): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    return axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML"
    });
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