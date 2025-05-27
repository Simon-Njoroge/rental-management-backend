
import { Logger as WinstonLogger } from 'winston';
import { Logger } from './logger';

export class AppLogger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private formatMessage(message: string): string {
    return this.context ? `[${this.context}] ${message}` : message;
  }

  info(message: string) {
    Logger.info(this.formatMessage(message));
  }

 log(message: string) {
    
    this.info(message);
  }

  warn(message: string) {
    Logger.warn(this.formatMessage(message));
  }

  error(message: string, trace?: string) {
    Logger.error(this.formatMessage(message));
    if (trace) {
      Logger.error(trace);
    }
  }

  debug(message: string) {
    Logger.debug(this.formatMessage(message));
  }
}
