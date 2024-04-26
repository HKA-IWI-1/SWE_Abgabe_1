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

import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { HttpStatus } from '@nestjs/common';
import { loginRest } from '../login.js';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const id = '5';

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('DELETE /rest/filme', () => {
    let client: AxiosInstance;

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Vorhandenen Film loeschen', async () => {
        // given
        const url = `/rest/${id}`;
        const token = await loginRest(client);
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`, // eslint-disable-line @typescript-eslint/naming-convention
        };

        // when
        const { status, data }: AxiosResponse<string> = await client.delete(
            url,
            { headers },
        );

        // then
        expect(status).toBe(HttpStatus.NO_CONTENT);
        expect(data).toBeDefined();
    });

    test('Film loeschen, aber ohne Token', async () => {
        // given
        const url = `/rest/${id}`;

        // when
        const response: AxiosResponse<Record<string, any>> =
            await client.delete(url);

        // then
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('Film loeschen, aber mit falschem Token', async () => {
        // given
        const url = `/rest/${id}`;
        const token = 'FALSCH';
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`, // eslint-disable-line @typescript-eslint/naming-convention
        };

        // when
        const response: AxiosResponse<Record<string, any>> =
            await client.delete(url, { headers });

        // then
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('Vorhandenen Film als "user" loeschen', async () => {
        // given
        const url = `/rest/5`;
        const token = await loginRest(client, 'user', 'p');
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`, // eslint-disable-line @typescript-eslint/naming-convention
        };

        // when
        const response: AxiosResponse<string> = await client.delete(url, {
            headers,
        });

        // then
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
});
