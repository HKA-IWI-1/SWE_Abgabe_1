/*
 * Copyright (c) 2024 - present Ronny Friedmann
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
 * Das Modul besteht aus der Klasse {@linkcode HttpExceptionFilter}.
 * @packageDocumentation
 */
import {
    type ArgumentsHost,
    Catch,
    type ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { BadUserInputError } from './errors.js';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, _host: ArgumentsHost) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { message }: { message: string } = exception.getResponse() as any;
        throw new BadUserInputError(message, exception);
    }
}
