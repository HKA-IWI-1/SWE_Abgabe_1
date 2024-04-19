-- Copyright (C) 2023 - present Luca Breisinger
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with this program.  If not, see <https://www.gnu.org/licenses/>.

-- https://docs.python.org/dev/library/sqlite3.html#sqlite3-cli
-- sqlite3 buch.sqlite

-- https://sqlite.org/lang_createtable.html
-- https://sqlite.org/stricttables.html ab 3.37.0
-- https://sqlite.org/syntax/column-constraint.html
-- https://sqlite.org/autoinc.html
-- https://sqlite.org/stricttables.html: INT, INTEGER, REAL, TEXT
-- https://sqlite.org/lang_createindex.html
-- https://stackoverflow.com/questions/37619526/how-can-i-change-the-default-sqlite-timezone

CREATE TABLE IF NOT EXISTS film (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    version                     INTEGER NOT NULL DEFAULT 0,
    titel                       TEXT NOT NULL UNIQUE,
    bewertung                   INTEGER NOT NULL CHECK (bewertung >= 0 AND bewertung <= 5),
    preis                       REAL,
    rabatt                      REAL,
    veroeffentlichungsdatum     TEXT,
    imdbEintrag                 TEXT,
    erzeugt                     TEXT NOT NULL,
    aktualisiert                TEXT NOT NULL,
    anbieter                    TEXT
);
CREATE INDEX IF NOT EXISTS film_titel_idx ON film(titel);

CREATE TABLE IF NOT EXISTS produktionsstudio (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    name                        TEXT NOT NULL,
    film_id                     INTEGER NOT NULL UNIQUE REFERENCES film
);

CREATE TABLE IF NOT EXISTS produzent (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    vorname                     TEXT NOT NULL,
    nachname                    TEXT NOT NULL,
    film_id                     INTEGER NOT NULL REFERENCES film
);
CREATE INDEX IF NOT EXISTS produzent_film_id_idx ON produzent(film_id);
