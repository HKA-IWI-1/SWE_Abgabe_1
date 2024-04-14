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
 * Das Modul enthält die Konfiguration für den _Node_-basierten Server.
 * @packageDocumentation
 */

import { type HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface.js';
import { RESOURCES_DIR } from './app.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tlsDir = resolve(RESOURCES_DIR, 'tls');
console.debug('tlsDir = %s', tlsDir);

export const httpsOptions: HttpsOptions = {
    key: readFileSync(resolve(tlsDir, 'key.pem')), // eslint-disable-line security/detect-non-literal-fs-filename
    cert: readFileSync(resolve(tlsDir, 'certificate.crt')), // eslint-disable-line security/detect-non-literal-fs-filename
};
