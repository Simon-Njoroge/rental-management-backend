export class Logger {
  static log(message: string, data?: any) {
    console.log(`[LOG] ${message}`, data || "");
  }

  static error(message: string, error: any) {
    console.error(`[ERROR] ${message}`, error);
  }

  static warn(message: string, warning?: any) {
    console.warn(`[WARN] ${message}`, warning || "");
  }
}
