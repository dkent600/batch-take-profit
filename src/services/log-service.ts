import { log } from 'console';
import * as fs from 'fs';
import { DI, inject } from 'aurelia';
import { IEnvService, EnvServiceToken } from './env-service.js';

export interface ILogService {
  log(message: string): void;
  logError(err: Error | unknown): void;
  logReport(message: string): void;
}

export const LogServiceToken = DI.createInterface<ILogService>('ILogService');

@inject(EnvServiceToken)
export class LogService implements ILogService {
  private logFileName: string;

  constructor(envService: IEnvService) {
    this.logFileName = envService.get('LOGFILENAME') || 'exchange.log';
  }

  log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.logFileName, logMessage);
    console.log(logMessage);
  }

  logReport(report: string | string[]): void {
    if (!Array.isArray(report)) {
      report = [report];
    }
    const _log = [...report].join('\n');

    this.log(_log + '\n');
  }

  async logError(err: Error | unknown): Promise<void> {
    // try {
    //   await this.telegramService.sendTelegramErrorMessage(errorToTelegramMessage(err));
    // } catch { }

    if (err instanceof Error) {
      log(err.stack ?? err.message);
    } else {
      log(String(err));
    }
  }
}
