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
// eslint-disable-next-line max-classes-per-file
import {
    ArrayUnique,
    IsArray,
    IsISO8601,
    IsInt,
    IsOptional,
    IsPositive,
    IsUrl,
    Matches,
    Max,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProduktionsstudioDTO } from './produktionsstudioDTO';
import { ProduzentDTO } from './produzentDTO';
import { StreamingAnbieter } from '../entity/film.entity';
import { Type } from 'class-transformer';

export const MAX_RATING = 5;
export const MAX_TITEL = 40;

/**
 * Entity-Klasse für Filme ohne TypeORM und ohne Referenzen.
 */
export class FilmDtoOhneRef {
    @Matches('^\\w.*')
    @MaxLength(MAX_TITEL)
    @ApiProperty({ example: 'Der Titel', type: String })
    readonly titel: string | undefined;

    @IsInt()
    @Min(0)
    @Max(MAX_RATING)
    @ApiProperty({ example: 5, type: Number })
    readonly bewertung: number | undefined;

    @IsPositive()
    @ApiProperty({ example: 1, type: Number })
    readonly preis!: number;

    @Min(0)
    @Max(1)
    @IsOptional()
    @ApiProperty({ example: 0.1, type: Number })
    readonly rabatt: number | undefined;

    @IsISO8601({ strict: true })
    @IsOptional()
    @ApiProperty({ example: '2024-02-30' })
    readonly veroeffentlichungsdatum: Date | string | undefined;

    @IsUrl()
    @IsOptional()
    @ApiProperty({
        example: 'https://www.imdb.com/title/tt0073486/',
        type: String,
    })
    readonly imdbEintrag: string | undefined;

    @IsOptional()
    @ArrayUnique()
    @ApiProperty({ example: ['DOKUMENTATION', 'COMEDY'] })
    genres: string[] | null | undefined;

    @Matches(/^NETFLIX$|^AMAZON$|^PARAMOUNT$|^DISNEY$/u)
    @IsOptional()
    @ApiProperty({ example: 'NETFLIX', type: String })
    readonly anbieter: StreamingAnbieter | undefined;
}

/**
 * Entity-Klasse für Bücher ohne TypeORM.
 */
export class FilmDTO extends FilmDtoOhneRef {
    @ValidateNested()
    @Type(() => ProduktionsstudioDTO)
    @ApiProperty({ type: ProduktionsstudioDTO })
    readonly produktionsstudio!: ProduktionsstudioDTO; // NOSONAR

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProduzentDTO)
    @ApiProperty({ type: [ProduzentDTO] })
    readonly produzenten: ProduzentDTO[] | undefined;
}
