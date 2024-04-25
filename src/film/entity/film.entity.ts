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
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DecimalTransformer } from './decimal-transformer.js';
import { Produktionsstudio } from './produktionsstudio.entity.js';
import { Produzent } from './produzent.entity.js';
import { dbType } from '../../config/db.js';

/**
 * Alias-Typ für gültige Strings bei der Streaming-Anbieter eines Filmes.
 */
export type StreamingAnbieter = 'NETFLIX' | 'AMAZON' | 'PARAMOUNT' | 'DISNEY';

/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

@Entity()
export class Film {
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @VersionColumn()
    readonly version: number | undefined;

    @Column('varchar')
    readonly titel!: string;

    @Column('int')
    @ApiProperty({ example: 5, type: Number })
    readonly bewertung: number | undefined;

    @Column('decimal', {
        precision: 8,
        scale: 2,
        transformer: new DecimalTransformer(),
    })
    @ApiProperty({ example: 1, type: Number })
    readonly preis!: number;

    @Column('decimal', {
        precision: 4,
        scale: 3,
        transformer: new DecimalTransformer(),
    })
    @ApiProperty({ example: 0.1, type: Number })
    readonly rabatt: number | undefined;

    @Column('date')
    @ApiProperty({ example: '2021-01-31' })
    readonly veroeffentlichungsdatum: Date | string | undefined;

    @Column('varchar')
    @ApiProperty({
        example: 'https://www.imdb.com/title/tt0073486/',
        type: String,
    })
    readonly imdbEintrag: string | undefined;

    @CreateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly erzeugt: Date | undefined;

    @UpdateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly aktualisiert: Date | undefined;

    @Column('simple-array')
    genres: string[] | null | undefined;

    @Column('varchar')
    @ApiProperty({ example: 'NETFLIX', type: String })
    readonly anbieter: StreamingAnbieter | undefined;

    @OneToOne(
        () => Produktionsstudio,
        (produktionsstudio) => produktionsstudio.film,
        {
            cascade: ['insert', 'remove'],
        },
    )
    readonly produktionsstudio: Produktionsstudio | undefined;

    @OneToMany(() => Produzent, (produzent) => produzent.film, {
        cascade: ['insert', 'remove'],
    })
    readonly produzenten: Produzent[] | undefined;

    public toString = () =>
        JSON.stringify({
            id: this.id,
            version: this.version,
            preis: this.preis,
            rabatt: this.rabatt,
            veroeffentlichungsdatum: this.veroeffentlichungsdatum,
            erzeugt: this.erzeugt,
            aktualisiert: this.aktualisiert,
            bewertung: this.bewertung,
            genres: this.genres,
            anbieter: this.anbieter,
            imdbEintrag: this.imdbEintrag,
            titel: this.titel,
        });
}
