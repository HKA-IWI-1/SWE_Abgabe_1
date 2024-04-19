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
 * Das Modul enthält die Konfiguration für _Keycloak_.
 * @packageDocumentation
 */
import {
    type KeycloakConnectConfig,
    PolicyEnforcementMode,
    TokenValidation,
} from 'nest-keycloak-connect';
import { Agent } from 'node:https';
import { config } from './app.js';
import { env } from './env.js';
import { httpsOptions } from './https.js';

const { keycloak } = config;
const authServerUrl =
    (keycloak?.authServerUrl as string | undefined) ?? 'http://localhost:8080';
const realm = (keycloak?.realm as string | undefined) ?? 'acme';
// Todo: ggf. den Buch-Client verwenden?
const clientId = (keycloak?.clientId as string | undefined) ?? 'buch-client';
const tokenValidation =
    (keycloak?.tokenValidation as TokenValidation | undefined) ??
    (TokenValidation.ONLINE as TokenValidation);

const { CLIENT_SECRET, NODE_ENV } = env;

export const keycloakConnectOptions: KeycloakConnectConfig = {
    authServerUrl,
    realm,
    clientId,
    secret:
        CLIENT_SECRET ??
        'ERROR: Umgebungsvariable CLIENT_SECRET nicht gesetzt!',
    policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
    tokenValidation,
};
if (NODE_ENV === 'development') {
    console.debug('keycloakConnectOptions = %o', keycloakConnectOptions);
} else {
    const { secret, ...keycloakConnectOptionsLog } = keycloakConnectOptions;
    console.debug('keycloakConnectOptions = %o', keycloakConnectOptionsLog);
}

export const paths = {
    accessToken: `realms/${realm}/protocol/openid-connect/token`,
    userInfo: `realms/${realm}/protocol/openid-connect/userinfo`,
    introspect: `realms/${realm}/protocol/openid-connect/token/introspect`,
};

export const httpsAgent = new Agent({
    requestCert: true,
    rejectUnauthorized: false,
    ca: httpsOptions.cert as Buffer,
});
