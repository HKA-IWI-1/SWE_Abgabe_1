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
 * Das Modul besteht aus der Klasse {@linkcode MailService} für das
 * Verschicken von Emails.
 * @packageDocumentation
 */

import { Injectable } from '@nestjs/common';
import { type SendMailOptions } from 'nodemailer';
import { getLogger } from '../logger/logger.js';
import { mailConfig } from '../config/mail.js';

/** Typdefinition für das Senden einer Email. */
export interface SendMailParams {
    /** Subject für die Email. */
    readonly subject: string;
    /** Body für die Email. */
    readonly body: string;
}

@Injectable()
export class MailService {
    readonly #logger = getLogger(MailService.name);

    async sendmail({ subject, body }: SendMailParams) {
        if (!mailConfig.activated) {
            this.#logger.warn('#sendmail: Mail deaktiviert');
            return;
        }

        const from = '"Joe Doe" <Joe.Doe@acme.com>';
        const to = '"Foo Bar" <Foo.Bar@acme.com>';

        const data: SendMailOptions = { from, to, subject, html: body };
        this.#logger.debug('#sendMail: data=%o', data);

        try {
            const nodemailer = await import('nodemailer');
            await nodemailer.createTransport(mailConfig.options).sendMail(data);
        } catch (err) {
            this.#logger.warn('#sendmail: Fehler %o', err);
        }
    }
}
