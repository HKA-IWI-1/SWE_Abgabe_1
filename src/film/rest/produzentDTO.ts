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
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import { Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const MAX_VORNAME = 40;
export const MAX_NACHNAME = 40;

/**
 * Entity-Klasse für Produzenten ohne TypeORM.
 */
export class ProduzentDTO {
    @Matches('^\\w.*')
    @MaxLength(MAX_VORNAME)
    @ApiProperty({ example: 'Der Vorname', type: String })
    readonly vorname!: string;

    @Matches('^\\w.*')
    @MaxLength(MAX_NACHNAME)
    @ApiProperty({ example: 'Der Nachname', type: String })
    readonly nachname!: string;
}
