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

/**
 * Das Modul enthält die Konfiguration für den Mail-Client mit _nodemailer_.
 * @packageDocumentation
 */

import { type Options } from 'nodemailer/lib/smtp-transport';
import { config } from './app.js';
import { logLevel } from './logger.js';

const { mail } = config;

const activated = mail?.activated === undefined || mail?.activated === true;

const host = (mail?.host as string | undefined) ?? 'smtp';
const port = (mail?.port as number | undefined) ?? 25; // eslint-disable-line @typescript-eslint/no-magic-numbers
const logger = mail?.log === true;

/**
 * Konfiguration für den Mail-Client mit _nodemailer_.
 */
export const options: Options = {
    host,
    port,
    secure: false,
    priority: 'normal',
    logger,
} as const;
export const mailConfig = {
    activated,
    options,
};
Object.freeze(options);
if (logLevel === 'debug') {
    console.debug('mailConfig = %o', mailConfig);
}
