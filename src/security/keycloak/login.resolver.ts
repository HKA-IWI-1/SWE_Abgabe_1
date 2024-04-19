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
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { BadUserInputError } from '../../film/graphql/errors.js';
import { KeycloakService } from './keycloak.service.js';
import { Public } from 'nest-keycloak-connect';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { UseInterceptors } from '@nestjs/common';
import { getLogger } from '../../logger/logger.js';

export interface LoginInput {
    /** Username */
    readonly username: string;
    /** Password */
    readonly password: string;
}

export interface RefreshInput {
    readonly refresh_token: string; // eslint-disable-line @typescript-eslint/naming-convention
}

@Resolver('login')
@UseInterceptors(ResponseTimeInterceptor)
export class LoginResolver {
    readonly #keycloakService: KeycloakService;
    readonly #logger = getLogger(LoginResolver.name);

    constructor(keycloakService: KeycloakService) {
        this.#keycloakService = keycloakService;
    }

    @Mutation()
    @Public()
    async login(@Args() { username, password }: LoginInput) {
        this.#logger.debug('login: username=%s', username);

        const result = await this.#keycloakService.login({
            username,
            password,
        });
        if (result === undefined) {
            throw new BadUserInputError(
                'Falscher Benutzername oder falsches Passwort',
            );
        }

        this.#logger.debug('login: result=%o', result);
        return result;
    }

    @Mutation()
    @Public()
    async refresh(@Args() input: RefreshInput) {
        this.#logger.debug('refresh: input=%o', input);
        // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention
        const { refresh_token } = input;

        const result = await this.#keycloakService.refresh(refresh_token);
        if (result === undefined) {
            throw new BadUserInputError('Falscher Token');
        }

        this.#logger.debug('refresh: result=%o', result);
        return result;
    }
}
