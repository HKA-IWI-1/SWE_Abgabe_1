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

import {
    type CallHandler,
    type ExecutionContext,
    Injectable,
    type NestInterceptor,
} from '@nestjs/common';
import { type Observable } from 'rxjs';
import { type Response } from 'express';
import { type TapObserver } from 'rxjs/internal/operators/tap';
import { Temporal } from '@js-temporal/polyfill';
import { getLogger } from './logger.js';
import { tap } from 'rxjs/operators';

/**
 * `ResponseTimeInterceptor` protokolliert die Antwortzeit und den Statuscode
 * Alternative zu morgan (von Express) http://expressjs.com/en/resources/middleware/morgan.html,
 * aber mit konformem Log-Layout.
 */
@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
    readonly #logger = getLogger(ResponseTimeInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Temporal.Now.instant().epochMilliseconds;
        const responseTimeObserver: TapObserver<unknown> = {
            subscribe: this.#empty,
            unsubscribe: this.#empty,
            finalize: () => {
                const response = context.switchToHttp().getResponse<Response>();
                const { statusCode, statusMessage } = response;
                const responseTime =
                    Temporal.Now.instant().epochMilliseconds - start;
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (statusMessage === undefined) {
                    this.#logger.debug('Response time: %d ms', responseTime);
                    return;
                }
                this.#logger.debug(
                    'Response time: %d ms, %d %s',
                    responseTime,
                    statusCode,
                    statusMessage,
                );
            },
            next: this.#empty,
            error: this.#empty,
            complete: this.#empty,
        };
        return next.handle().pipe(tap(responseTimeObserver));
    }

    readonly #empty = () => {
        // do nothing
    };
}
