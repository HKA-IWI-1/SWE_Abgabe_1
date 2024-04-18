/*
 * Copyright (c) 2024 - present Florian Sauer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the “Software”), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import { type PrettyOptions } from 'pino-pretty';
import { config } from './app.js';
import { env } from './env.js';
import { nodeConfig } from './node.js';
import pino from 'pino';
// eslint-disable-next-line unicorn/import-style
import { resolve } from 'node:path';

/**
 * Das Modul enthält die Konfiguration für den Logger.
 * @packageDocumentation
 */

const logDirDefault = 'log';
const logFileNameDefault = 'server.log';
const logFileDefault = resolve(logDirDefault, logFileNameDefault);
const { log } = config;
const { nodeEnv } = nodeConfig;

export const loggerDefaultValue =
    env.LOG_DEFAULT?.toLowerCase() === 'true' || log?.default === true;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const logDir: string | undefined =
    (log?.dir as string | undefined) === undefined
        ? undefined
        : log.dir.trimEnd(); // eslint-disable-line @typescript-eslint/no-unsafe-call
const logFile =
    logDir === undefined ? logFileDefault : resolve(logDir, logFileNameDefault);
const pretty = log?.pretty === true;

let logLevel = 'info';
if (
    log?.level === 'debug' &&
    nodeEnv !== 'production' &&
    nodeEnv !== 'PRODUCTION' &&
    !loggerDefaultValue
) {
    logLevel = 'debug';
}

if (!loggerDefaultValue) {
    console.debug(
        `logger config: logLevel=${logLevel}, logFile=${logFile}, pretty=${pretty}, loggerDefaultValue=${loggerDefaultValue}`,
    );
}

const fileOptions = {
    level: logLevel,
    target: 'pino/file',
    options: { destination: logFile },
};

const prettyOptions: PrettyOptions = {
    translateTime: 'SYS:standard',
    singleLine: true,
    colorize: true,
    ignore: 'pid,hostname',
};

const prettyTransportOptions = {
    level: logLevel,
    target: 'pino-pretty',
    options: prettyOptions,
};

const options: pino.TransportMultiOptions | pino.TransportSingleOptions = pretty
    ? {
          targets: [fileOptions, prettyTransportOptions],
      }
    : {
          targets: [fileOptions],
      };

const transports = pino.transport(options); // eslint-disable-line @typescript-eslint/no-unsafe-assignment

export const parentLogger: pino.Logger<string> = loggerDefaultValue
    ? pino(pino.destination(logFileDefault))
    : pino({ level: logLevel }, transports); // eslint-disable-line @typescript-eslint/no-unsafe-argument
