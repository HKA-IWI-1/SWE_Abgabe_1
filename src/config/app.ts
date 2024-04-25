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
 * Das Modul enthält Objekte mit Konfigurationsdaten aus der YAML-Datei.
 * @packageDocumentation
 */

import { existsSync, readFileSync } from 'node:fs';
import { load } from 'js-yaml';
// eslint-disable-next-line unicorn/import-style
import { resolve } from 'node:path';

export const BASEDIR = existsSync('src') ? 'src' : 'dist';
export const RESOURCES_DIR = resolve(BASEDIR, 'config', 'resources');

const configFile = resolve(RESOURCES_DIR, 'app.yml');
export const config = load(
    readFileSync(configFile, 'utf8'), // eslint-disable-line security/detect-non-literal-fs-filename
) as Record<string, any>;
