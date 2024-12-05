export enum LogLevel {
  INFO = "info",
  WARNING = "warning", 
  ERROR = "error",
}

interface LogMessage {
  fileName: string
  lineNumber: number
  functionName: string
  variableName: string
  value: any
  message: string
  level: LogLevel
}

class EdgeLogger {
  private formatMessage(logMessage: LogMessage): string {
    const timestamp = new Date().toISOString()
    return `${timestamp} [${logMessage.level}] ${logMessage.fileName} 📍 Line:${logMessage.lineNumber} 🔧 ${logMessage.functionName} 📝 ${logMessage.variableName}=${JSON.stringify(logMessage.value)} - ${logMessage.message}`
  }

  info(fileName: string, lineNumber: number, functionName: string, variableName: string, value: any, message: string) {
    const logMessage: LogMessage = {
      fileName,
      lineNumber,
      functionName,
      variableName,
      value,
      message,
      level: LogLevel.INFO
    }
    if (process.env.NODE_ENV === "development") {
      console.log(this.formatMessage(logMessage));
    }
  }

  warn(fileName: string, lineNumber: number, functionName: string, variableName: string, value: any, message: string) {
    const logMessage: LogMessage = {
      fileName,
      lineNumber, 
      functionName,
      variableName,
      value,
      message,
      level: LogLevel.WARNING
    }
    if (process.env.NODE_ENV === "development") {
      console.warn(this.formatMessage(logMessage));
    }
  }

  error(fileName: string, lineNumber: number, functionName: string, variableName: string, value: any, message: string) {
    const logMessage: LogMessage = {
      fileName,
      lineNumber,
      functionName,
      variableName,
      value,
      message,
      level: LogLevel.ERROR
    }
    if (process.env.NODE_ENV === "development") {
      console.error(this.formatMessage(logMessage));
    }
  }
}

export const logger = new EdgeLogger()