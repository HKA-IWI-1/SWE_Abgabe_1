/* eslint-disable sonarjs/no-duplicate-string */
// @eslint-community/eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
    type Film,
    type StreamingAnbieter,
} from '../../src/film/entity/film.entity.js';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type GraphQLFormattedError } from 'graphql';
import { type GraphQLRequest } from '@apollo/server';
import { HttpStatus } from '@nestjs/common';

// eslint-disable-next-line jest/no-export
export interface GraphQLResponseBody {
    data?: Record<string, any> | null;
    errors?: readonly [GraphQLFormattedError];
}

type FilmDTO = Omit<
    Film,
    'produzenten' | 'aktualisiert' | 'erzeugt' | 'rabatt'
> & {
    rabatt: string;
};

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const idVorhanden = '1';
const produktionsstudioVorhanden = 'Bavaria Film';
const teilProduktionsstudioVorhanden = 'a';
const produktionsstudioNichtVorhanden = 'AAAAAAAAAAAA';
const bewertungVorhanden = 3;
const bewertungNichtVorhanden = 99;

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GraphQL Queries', () => {
    let client: AxiosInstance;
    const graphqlPath = 'graphql';

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}/`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: () => true,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Suche Film zu vorhandener ID', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    film(id: "${idVorhanden}") {
                        version
                        titel 
                        bewertung 
                        preis
                        veroeffentlichungsdatum 
                        imdbEintrag
                        genres
                        anbieter 
                        produktionsstudio {
                          name
                        }
                        rabatt(short: true)
                      }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { film } = data.data!;
        const result: FilmDTO = film;

        expect(result.produktionsstudio?.name).toMatch(/^\w/u);
        expect(result.version).toBeGreaterThan(-1);
        expect(result.id).toBeUndefined();
    });

    test('Suche Film zu nicht vorhandener ID', async () => {
        // given
        const id = '9999';
        const body: GraphQLRequest = {
            query: `
            {
                film(id: "${id}") {
                    produktionsstudio {
                        name
                    }
                }
            }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.film).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toBe(`Es gibt keinen Film mit der ID ${id}.`);
        expect(path).toBeDefined();
        expect(path![0]).toBe('film');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test('Suche Filme zu vorhandenen Produktionsstudio', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
            {
                filme(suchkriterien: {produktionsstudio: "${produktionsstudioVorhanden}"}) {
                    version
                    titel 
                    bewertung 
                    preis
                    veroeffentlichungsdatum 
                    imdbEintrag
                    genres
                    anbieter 
                    produktionsstudio {
                      name
                    }
                    rabatt(short: true)
                  }
            }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { filme } = data.data!;

        expect(filme).not.toHaveLength(0);

        const filmeArray: FilmDTO[] = filme;

        filmeArray.forEach((film) => {
            expect(film.produktionsstudio?.name).toBe(
                produktionsstudioVorhanden,
            );
        });
    });

    test('Suche Filme zu vorhandenen Produktionsstudio mit Teilstring a', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
            {
                filme(suchkriterien: {produktionsstudio: "${teilProduktionsstudioVorhanden}"}) {
                    titel 
                    produktionsstudio {
                      name
                    }
                    rabatt(short: true)
                  }
            }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { filme } = data.data!;

        expect(filme).not.toHaveLength(0);

        expect(filme).not.toHaveLength(0);

        const filmeArray: FilmDTO[] = filme;
        filmeArray
            .map((film) => film.produktionsstudio)
            .forEach((produktionsstudio) =>
                expect(produktionsstudio?.name.toLowerCase()).toEqual(
                    expect.stringContaining(teilProduktionsstudioVorhanden),
                ),
            );
    });

    test('Suche Filme zu nicht vorhandenen Produktionsstudio', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
            {
                filme(suchkriterien: {produktionsstudio: "${produktionsstudioNichtVorhanden}"}) {
                    produktionsstudio {
                        name
                    }
                }
            }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.filme).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toMatch(/^Keine Filme gefunden:/u);
        expect(path).toBeDefined();
        expect(path![0]).toBe('filme');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test('Suche Filme zu vorhandener Bewertung', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
            {
                filme(suchkriterien: {bewertung: ${bewertungVorhanden}}) {                    titel 
                    bewertung 
                    preis
                    veroeffentlichungsdatum 
                    imdbEintrag
                    genres
                    anbieter 
                  }
            }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { filme } = data.data!;

        expect(filme).not.toHaveLength(0);

        const filmeArray: FilmDTO[] = filme;

        filmeArray.forEach((film) => {
            expect(film.bewertung).toBe(bewertungVorhanden);
        });
    });

    test('Vorhandene Bewertung und Teilstring', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
            {
                filme(suchkriterien: {
                        bewertung: ${bewertungVorhanden},
                        produktionsstudio: "${produktionsstudioVorhanden}"
                }) {
                    titel 
                    bewertung 
                    produktionsstudio {
                      name
                    }
                  }
            }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { filme } = data.data!;

        expect(filme).not.toHaveLength(0);

        const filmeArray: FilmDTO[] = filme;

        filmeArray.forEach((film) => {
            const { bewertung, produktionsstudio } = film;

            expect(bewertung).toBe(bewertungVorhanden);
            expect(produktionsstudio?.name.toLowerCase()).toEqual(
                expect.stringContaining(teilProduktionsstudioVorhanden),
            );
        });
    });

    test('Suche Filme zu nicht vorhandener Bewertung', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
            {
                filme(suchkriterien: {bewertung: ${bewertungNichtVorhanden}}) {
                    titel
                    bewertung
                }
            }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.filme).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toMatch(/^Keine Filme gefunden:/u);
        expect(path).toBeDefined();
        expect(path![0]).toBe('filme');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test('Suche Filme von Streaminganbieter "NETFLIX"', async () => {
        // given
        const streamingAnbieter: StreamingAnbieter = 'NETFLIX';
        const body: GraphQLRequest = {
            query: `
            {
                filme(suchkriterien: {anbieter: ${streamingAnbieter}}) {
                    titel 
                    anbieter 
                    produktionsstudio {
                      name
                    }
                  }
            }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { filme } = data.data!;

        expect(filme).not.toHaveLength(0);

        const filmeArray: FilmDTO[] = filme;

        filmeArray.forEach((film) => {
            const { anbieter, produktionsstudio } = film;

            expect(anbieter).toBe(streamingAnbieter);
            expect(produktionsstudio?.name).toBeDefined();
        });
    });

    test('Suche Filme von einem nicht vorhandenen Anbieter', async () => {
        // given
        const anbieterNichtVorhanden = 'UNGUELTIG';
        const body: GraphQLRequest = {
            query: `
            {
                filme(suchkriterien: {anbieter: ${anbieterNichtVorhanden}}) {
                    titel
                    anbieter
                }
            }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data).toBeUndefined();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { extensions } = error;

        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('GRAPHQL_VALIDATION_FAILED');
    });
});

/* eslint-enable sonarjs/no-duplicate-string */
/* eslint-enable @typescript-eslint/no-unsafe-assignment */
/* eslint-enable max-lines */
