CREATE SCHEMA IF NOT EXISTS AUTHORIZATION film;

ALTER ROLE film SET search_path = 'film';

CREATE TYPE streaminganbieter as ENUM ('NETFLIX', 'AMAZON', 'PARAMOUNT', 'DISNEY');

CREATE TABLE IF NOT EXISTS film
(

    id                      INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE filmspace,

    version                 INTEGER       NOT NULL DEFAULT 0,

    titel                   varchar(40)   NOT NULL,

    bewertung               INTEGER,

    preis                   DECIMAL(8, 2) NOT NULL,

    rabatt                  DECIMAL(4, 3),

    veroeffentlichungsdatum DATE,

    imdb_eintrag             varchar(40),

    erzeugt                 TIMESTAMP     NOT NULL DEFAULT NOW(),

    aktualisiert            TIMESTAMP     NOT NULL DEFAULT NOW(),

    genres                   VARCHAR(64),

    anbieter                streaminganbieter
) TABLESPACE filmspace;

CREATE TABLE IF NOT EXISTS produktionsstudio
(

    id      INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE filmspace,

    name    VARCHAR(40) NOT NULL,

    film_id INTEGER     NOT NULL UNIQUE USING INDEX TABLESPACE filmspace REFERENCES film
) TABLESPACE filmspace;

CREATE TABLE IF NOT EXISTS produzent
(
    id       INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE filmspace,

    vorname  VARCHAR(40) NOT NULL,

    nachname VARCHAR(40) NOT NULL,

    film_id  INTEGER     NOT NULL REFERENCES film
) TABLESPACE filmspace;

CREATE INDEX IF NOT EXISTS produzent_film_id_idx ON produzent (film_id) TABLESPACE filmspace;
