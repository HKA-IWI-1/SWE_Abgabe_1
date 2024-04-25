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

// eslint-disable-next-line max-classes-per-file
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard, Roles } from 'nest-keycloak-connect';
import { IsInt, IsNumberString, Min } from 'class-validator';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { type Film } from '../entity/film.entity.js';
import { FilmDTO } from '../rest/filmDTO.entity.js';
import { FilmWriteService } from '../service/film-write.service.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { type IdInput } from './film-query.resolver.js';
import { type Produktionsstudio } from '../entity/produktionsstudio.entity.js';
import { type Produzent } from '../entity/produzent.entity.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { getLogger } from '../../logger/logger.js';

export interface CreatePayLoad {
    readonly id: number;
}

export interface UpdatePayLoad {
    readonly version: number;
}

export class FilmUpdateDTO extends FilmDTO {
    @IsNumberString()
    readonly id!: string;

    @IsInt()
    @Min(0)
    readonly version!: number;
}

@Resolver()
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class FilmMutationResolver {
    readonly #service: FilmWriteService;

    readonly #logger = getLogger(FilmMutationResolver.name);

    constructor(service: FilmWriteService) {
        this.#service = service;
    }

    @Mutation()
    @Roles({ roles: ['admin', 'user'] })
    async create(@Args('input') filmDTO: FilmDTO) {
        this.#logger.debug('create: filmDTO=%o', filmDTO);

        const film = this.#filmDtoToFilm(filmDTO);
        const id = await this.#service.create(film);

        this.#logger.debug('createFilm: id=%d', id);
        const payload: CreatePayLoad = { id };
        return payload;
    }

    @Mutation()
    @Roles({ roles: ['admin', 'user'] })
    async update(@Args('input') filmDTO: FilmUpdateDTO) {
        this.#logger.debug('update: film=%o', filmDTO);

        const film = this.#filmUpdateDtoToFilm(filmDTO);
        const versionStr = `"${filmDTO.version.toString()}"`;

        const versionResult = await this.#service.update({
            id: Number.parseInt(filmDTO.id, 10),
            film,
            version: versionStr,
        });

        this.#logger.debug('updateFilm: versionResult=%d', versionResult);
        const payload: UpdatePayLoad = { version: versionResult };
        return payload;
    }

    @Mutation()
    @Roles({ roles: ['admin'] })
    async delete(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('delete: id=%s', idStr);
        const deletePerformed = await this.#service.delete(idStr);
        this.#logger.debug('deleteFilm: deletePerformed=%s', deletePerformed);
        return deletePerformed;
    }

    #filmDtoToFilm(filmDTO: FilmDTO): Film {
        const produktionsstudioDTO = filmDTO.produktionsstudio;
        const produktionsstudio: Produktionsstudio = {
            id: undefined,
            name: produktionsstudioDTO.name,
            film: undefined,
        };
        const produzenten = filmDTO.produzenten?.map((produzentDTO) => {
            const produzent: Produzent = {
                id: undefined,
                vorname: produzentDTO.vorname,
                nachname: produzentDTO.nachname,
                film: undefined,
            };
            return produzent;
        });
        const film: Film = {
            id: undefined,
            version: undefined,
            titel: filmDTO.titel,
            preis: filmDTO.preis,
            rabatt: filmDTO.rabatt,
            veroeffentlichungsdatum: filmDTO.veroeffentlichungsdatum,
            bewertung: filmDTO.bewertung,
            genres: filmDTO.genres,
            anbieter: filmDTO.anbieter,
            imdbEintrag: filmDTO.imdbEintrag,
            produktionsstudio,
            produzenten,
            erzeugt: new Date(),
            aktualisiert: new Date(),
        };

        film.produktionsstudio!.film = film;
        return film;
    }

    #filmUpdateDtoToFilm(filmDTO: FilmUpdateDTO): Film {
        return {
            id: undefined,
            version: undefined,
            titel: filmDTO.titel,
            preis: filmDTO.preis,
            rabatt: filmDTO.rabatt,
            veroeffentlichungsdatum: filmDTO.veroeffentlichungsdatum,
            bewertung: filmDTO.bewertung,
            genres: filmDTO.genres,
            anbieter: filmDTO.anbieter,
            imdbEintrag: filmDTO.imdbEintrag,
            produktionsstudio: undefined,
            produzenten: undefined,
            erzeugt: undefined,
            aktualisiert: new Date(),
        };
    }
}
