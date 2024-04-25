/*
 * Copyright (c) 2024 - present Luca Breisinger
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
 * Das Modul besteht aus der Controller-Klasse für die Authentifizierung an der
 * REST-Schnittstelle.
 * @packageDocumentation
 */
// eslint-disable-next-line max-classes-per-file
import {
    ApiConsumes,
    ApiOkResponse,
    ApiOperation,
    ApiProperty,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Res,
    UseInterceptors,
} from '@nestjs/common';
import { KeycloakService } from './keycloak.service.js';
import { Public } from 'nest-keycloak-connect';
import { Response } from 'express';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { getLogger } from '../../logger/logger.js';
import { paths } from '../../config/paths.js';

/** Entity-Klasse für Login-Daten. */
export class Login {
    /** Benutzername */
    @ApiProperty({ example: 'admin', type: String })
    username: string | undefined;

    /** Passwort */
    @ApiProperty({ example: 'p', type: String })
    password: string | undefined;
}

/** Entity-Klasse für Refresh-Token. */
export class Refresh {
    /** Refresh Token */
    @ApiProperty({ example: 'alg.payload.signature', type: String })
    refresh_token: string | undefined; // eslint-disable-line @typescript-eslint/naming-convention, camelcase
}

/**
 * Die Controller-Klasse für die Authentifizierung.
 */
@Controller(paths.auth)
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Authentifizierung und Autorisierung')
export class LoginController {
    readonly #keycloakService: KeycloakService;

    readonly #logger = getLogger(LoginController.name);

    constructor(keycloakService: KeycloakService) {
        this.#keycloakService = keycloakService;
    }

    @Post(paths.login)
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
    @ApiOperation({ summary: 'Login mit Benutzername und Passwort' })
    @ApiOkResponse({ description: 'Erfolgreich eingeloggt!' })
    @ApiUnauthorizedResponse({
        description: 'Benutzername oder Passwort sind nicht korrekt!',
    })
    async login(@Body() { username, password }: Login, @Res() res: Response) {
        this.#logger.debug('login: username=%s', username);

        const result = await this.#keycloakService.login({
            username,
            password,
        });
        if (result === undefined) {
            return res.sendStatus(HttpStatus.UNAUTHORIZED);
        }

        return res.json(result).send();
    }

    @Post(paths.refresh)
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
    @ApiOperation({ summary: 'Refresh für vorhandenen Token' })
    @ApiOkResponse({ description: 'Erfolgreich aktualisiert!' })
    @ApiUnauthorizedResponse({
        description: 'Ungültiger Token!',
    })
    async refresh(@Body() body: Refresh, @Res() res: Response) {
        // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention
        const { refresh_token } = body;
        this.#logger.debug('refresh: refresh_token=%s', refresh_token);

        const result = await this.#keycloakService.refresh(refresh_token);
        if (result === undefined) {
            return res.sendStatus(HttpStatus.UNAUTHORIZED);
        }

        return res.json(result).send();
    }
}
