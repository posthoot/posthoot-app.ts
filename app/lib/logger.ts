type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface LoggerOptions {
  fileName: string;
  emoji: string;
  action: string;
  label: string;
  value: any;
  message: string;
}

class Logger {
  private log(level: LogLevel, options: LoggerOptions) {
    const { fileName, emoji, action, label, value, message } = options;
    console[level](`${fileName}: ${emoji}, ${action}; ${label}=${JSON.stringify(value)} - ${message}`);
  }

  info(options: LoggerOptions) {
    this.log('info', options);
  }

  error(options: LoggerOptions) {
    this.log('error', options);
  }

  warn(options: LoggerOptions) {
    this.log('warn', options);
  }

  debug(options: LoggerOptions) {
    this.log('debug', options);
  }
}

export const logger = new Logger();