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

import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { Film } from '../entity/film.entity.js';
import { FilmReadService } from '../service/film-read.service.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { Public } from 'nest-keycloak-connect';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { type Suchkriterien } from '../service/suchkriterien.js';
import { getLogger } from '../../logger/logger.js';

export interface IdInput {
    readonly id: number;
}

export interface SuchkriterienInput {
    readonly suchkriterien: Suchkriterien;
}

@Resolver((_: any) => Film)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class FilmQueryResolver {
    readonly #service: FilmReadService;

    readonly #logger = getLogger(FilmQueryResolver.name);

    constructor(service: FilmReadService) {
        this.#service = service;
    }

    @Query('film')
    @Public()
    async findById(@Args() { id }: IdInput) {
        this.#logger.debug('findById: id=%d', id);

        const film = await this.#service.findById({ id });

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                'findById: film=%s, produktionsstudio=o',
                film.toString(),
                film.produktionsstudio,
            );
        }
        return film;
    }

    @Query('filme')
    @Public()
    async find(@Args() input: SuchkriterienInput | undefined) {
        this.#logger.debug('find: input=%o', input);
        const filme = await this.#service.find(input?.suchkriterien);
        this.#logger.debug('find: filme=%o', filme);
        return filme;
    }

    @ResolveField('rabatt')
    rabatt(@Parent() film: Film, short: boolean | undefined) {
        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                'rabatt: film=%s, short=%s',
                film.toString(),
                short,
            );
        }
        const rabatt = film.rabatt ?? 0;
        const shortStr = short === undefined || short ? '%' : 'Prozent';
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return `${(rabatt * 100).toFixed(2)} ${shortStr}`;
    }
}
