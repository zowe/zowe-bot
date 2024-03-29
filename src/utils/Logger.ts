/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { ILogLevel, ILogOption } from '../types';
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { Util } from './Util';

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;
  private option: ILogOption;

  private constructor() {
    if (Logger.instance !== undefined) {
      return;
    }

    // Get log option
    this.option = {
      filePath: `${__dirname}/../log/commonBot.log`,
      level: ILogLevel.INFO,
      maximumSize: null,
      maximumFile: null,
      consoleSilent: true,
    };

    // Process environment variables
    try {
      if (process.env.COMMONBOT_LOG_FILE_PATH !== undefined && process.env.COMMONBOT_LOG_FILE_PATH.trim() !== '') {
        this.option.filePath = process.env.COMMONBOT_LOG_FILE_PATH; // Set log file
      }
      // Create log file folder if not exist
      const filePath = path.dirname(this.option.filePath);
      if (fs.existsSync(filePath) === false) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      if (process.env.COMMONBOT_LOG_LEVEL !== undefined && process.env.COMMONBOT_LOG_LEVEL.trim() !== '') {
        const logLevels: string[] = [
          ILogLevel.ERROR,
          ILogLevel.WARN,
          ILogLevel.INFO,
          ILogLevel.DEBUG,
          ILogLevel.VERBOSE,
          ILogLevel.SILLY,
        ];
        if (logLevels.includes(process.env.COMMONBOT_LOG_LEVEL)) {
          this.option.level = <ILogLevel>process.env.COMMONBOT_LOG_LEVEL;
        } else {
          console.error('Unsupported value specified in the variable COMMONBOT_LOG_LEVEL!');
        }
      }
      if (process.env.COMMONBOT_LOG_MAX_SIZE !== undefined && process.env.COMMONBOT_LOG_MAX_SIZE.trim() !== '') {
        this.option.maximumSize = parseInt(process.env.COMMONBOT_LOG_MAX_SIZE);
      }
      if (process.env.COMMONBOT_LOG_MAX_FILE !== undefined && process.env.COMMONBOT_LOG_MAX_FILE.trim() !== '') {
        this.option.maximumFile = parseInt(process.env.COMMONBOT_LOG_MAX_FILE);
      }
      if (process.env.COMMONBOT_LOG_CONSOLE_SILENT !== undefined && process.env.COMMONBOT_LOG_CONSOLE_SILENT.trim() !== '') {
        if (process.env.COMMONBOT_LOG_CONSOLE_SILENT.trim().toLowerCase() === 'false') {
          this.option.consoleSilent = false;
        } else {
          this.option.consoleSilent = true;
        }
      }

      console.info(`Log option:\n${JSON.stringify(this.option, null, 4)}`);
    } catch (error) {
      console.error(`Failed to process the environment variables for Common Bot Framework!`);
      console.error(error.stack);
      process.exitCode = 1;
      throw error;
    }

    // const {combine, timestamp, colorize, label, printf} = winston.format;
    const { combine, timestamp, printf } = winston.format;

    // Define customized format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const format = printf(({ timestamp, level, message, label }: any) => {
      return `${timestamp} [${level.toUpperCase()}] ${message}`;
    });

    // Create logger instance
    this.logger = winston.createLogger({
      level: this.option.level, // error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5
      //   format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.simple()),
      transports: [
        new winston.transports.File({
          filename: this.option.filePath,
          maxsize: this.option.maximumSize,
          maxFiles: this.option.maximumFile,
          format: combine(timestamp(), format),
          options: { flags: 'w' },
        }),
      ],
    });

    // Suppress console log output
    if (this.option.consoleSilent === false) {
      this.logger.add(new winston.transports.Console({ format: combine(timestamp(), format) }));
    }

    process.on('beforeExit', () => {
      this.logger.clear();
    });

    process.on('exit', () => {
      this.logger.end();
    });

    Logger.instance = this;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  // Get log option
  getOption(): ILogOption {
    return this.option;
  }

  // Print start log
  //  - functionName: function name or function object can be specified here
  //  - className: class name or class instance can be specified here
  //  - fileName: file name can be specified here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  start(functionName: string | Record<string, any>, className?: string | Record<string, any>, fileName?: string) {
    // Get function name
    let funName = '';
    if (arguments.length >= 1) {
      switch (typeof functionName) {
        case 'function':
          funName = functionName.name;
          break;
        case 'string':
          funName = functionName;
          break;
        default:
          funName = '';
      }
    }

    // Get class name
    let clsName = '';
    if (arguments.length >= 2) {
      switch (typeof className) {
        case 'string':
          clsName = className;
          break;
        case 'object':
          if (className !== null && className.constructor !== undefined) {
            clsName = className.constructor.name;
          } else {
            clsName = '';
          }
          break;
        default:
          clsName = '';
      }
    }

    // Print start log
    if (arguments.length >= 3) {
      this.logger.info(`${fileName} : ${clsName} : ${funName.replace(/bound /, '')}    start ===>`);
    } else if (arguments.length === 2) {
      this.logger.info(`${clsName} : ${funName.replace(/bound /, '')}    start ===>`);
    } else {
      this.logger.info(`${funName.replace(/bound /, '')}    start ===>`);
    }
  }

  // Print end log
  //  - functionName: function name or function object can be specified here
  //  - className: class name or class instance can be specified here
  //  - fileName: file name can be specified here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  end(functionName: string | Record<string, any>, className?: string | Record<string, any>, fileName?: string) {
    // Get function name
    let funName = '';
    if (arguments.length >= 1) {
      switch (typeof functionName) {
        case 'function':
          funName = functionName.name;
          break;
        case 'string':
          funName = functionName;
          break;
        default:
          funName = '';
      }
    }

    // Get class name
    let clsName = '';
    if (arguments.length >= 2) {
      switch (typeof className) {
        case 'string':
          clsName = className;
          break;
        case 'object':
          if (className !== null && className.constructor !== undefined) {
            clsName = className.constructor.name;
          } else {
            clsName = '';
          }
          break;
        default:
          clsName = '';
      }
    }

    // Print end log
    if (arguments.length >= 3) {
      this.logger.info(`${fileName} : ${clsName} : ${funName.replace(/bound /, '')}      end <===`);
    } else if (arguments.length === 2) {
      this.logger.info(`${clsName} : ${funName.replace(/bound /, '')}      end <===`);
    } else {
      this.logger.info(`${funName.replace(/bound /, '')}      end <===`);
    }
  }

  // Get errork stack with current file name and line number
  getErrorStack(newError: Error, caughtError: Error) {
    if (newError.stack === undefined && caughtError.stack === undefined) {
      return '';
    } else if (newError.stack !== undefined && caughtError.stack === undefined) {
      return newError.stack;
    } else if (newError.stack === undefined && caughtError.stack !== undefined) {
      return caughtError.stack;
    } else {
      // Get error stack
      const stack1 = newError.stack.split('\n');
      const stack2 = caughtError.stack.split('\n');

      // Add first and second lines of new error
      stack2.splice(0, 0, stack1[0]);
      stack2.splice(1, 0, stack1[1]);

      // Add error code and message
      // stack2.splice(2, 0, `  Error Code: ${caughtError.code}   Error Message: ${caughtError.message}`);

      // Add additional 4 spaces to make output nice
      stack2[2] = '    ' + stack2[2];

      return stack2.join('\n');
    }
  }

  public silly(log: string) {
    this.logger.silly(Util.maskSensitiveInfo(log));
  }

  public debug(log: string) {
    this.logger.debug(Util.maskSensitiveInfo(log));
  }

  public error(log: string) {
    this.logger.error(Util.maskSensitiveInfo(log));
  }

  public warn(log: string) {
    this.logger.warn(Util.maskSensitiveInfo(log));
  }

  public info(log: string) {
    this.logger.info(Util.maskSensitiveInfo(log));
  }
}
