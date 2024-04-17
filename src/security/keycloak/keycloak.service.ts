/* eslint-disable camelcase, @typescript-eslint/naming-convention */
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
    type KeycloakConnectOptions,
    type KeycloakConnectOptionsFactory,
} from 'nest-keycloak-connect';
import axios, {
    type AxiosInstance,
    type AxiosResponse,
    type RawAxiosRequestHeaders,
} from 'axios';
import { keycloakConnectOptions, paths } from '../../config/keycloak.js';
import { Injectable } from '@nestjs/common';
import { getLogger } from '../../logger/logger.js';

const { authServerUrl, clientId, secret } = keycloakConnectOptions;

interface Login {
    readonly username: string | undefined;
    readonly password: string | undefined;
}

@Injectable()
export class KeycloakService implements KeycloakConnectOptionsFactory {
    readonly #loginHeaders: RawAxiosRequestHeaders;

    readonly #keycloakClient: AxiosInstance;

    readonly #logger = getLogger(KeycloakService.name);

    constructor() {
        const authorization = Buffer.from(
            `${clientId}:${secret}`,
            'utf8',
        ).toString('base64');
        this.#loginHeaders = {
            Authorization: `Basic ${authorization}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        };

        this.#keycloakClient = axios.create({
            baseURL: authServerUrl!,
        });
        this.#logger.debug('keycloakClient=%o', this.#keycloakClient.defaults);
    }

    createKeycloakConnectOptions(): KeycloakConnectOptions {
        return keycloakConnectOptions;
    }

    async login({ username, password }: Login) {
        this.#logger.debug('login: username=%s', username);
        if (username === undefined || password === undefined) {
            return;
        }

        const loginBody = `grant_type=password&username=${username}&password=${password}`;
        let response: AxiosResponse<Record<string, number | string>>;
        try {
            response = await this.#keycloakClient.post(
                paths.accessToken,
                loginBody,
                { headers: this.#loginHeaders },
            );
        } catch {
            this.#logger.warn('login: Fehler bei %s', paths.accessToken);
            return;
        }

        this.#logPayload(response);
        this.#logger.debug('login: response.data=%o', response.data);
        return response.data;
    }

    async refresh(refresh_token: string | undefined) {
        this.#logger.debug('refresh: refresh_token=%s', refresh_token);
        if (refresh_token === undefined) {
            return;
        }

        // https://stackoverflow.com/questions/51386337/refresh-access-token-via-refresh-token-in-keycloak
        const refreshBody = `grant_type=refresh_token&refresh_token=${refresh_token}`;
        let response: AxiosResponse<Record<string, number | string>>;
        try {
            response = await this.#keycloakClient.post(
                paths.accessToken,
                refreshBody,
                { headers: this.#loginHeaders },
            );
        } catch {
            this.#logger.warn(
                'refresh: Fehler bei POST-Request: path=%s, body=%o',
                paths.accessToken,
                refreshBody,
            );
            return;
        }
        this.#logger.debug('refresh: response.data=%o', response.data);
        return response.data;
    }

    #logPayload(response: AxiosResponse<Record<string, string | number>>) {
        const { access_token } = response.data;
        const [, payloadStr] = (access_token as string).split('.');

        if (payloadStr === undefined) {
            return;
        }
        const payloadDecoded = atob(payloadStr);

        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        const payload = JSON.parse(payloadDecoded);
        const { azp, exp, resource_access } = payload;
        this.#logger.debug('#logPayload: exp=%s', exp);
        const { roles } = resource_access[azp]; // eslint-disable-line security/detect-object-injection
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */

        this.#logger.debug('#logPayload: roles=%o', roles);
    }
}

/* eslint-enable camelcase, @typescript-eslint/naming-convention */
