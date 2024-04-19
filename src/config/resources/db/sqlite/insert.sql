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

-- "Konzeption und Realisierung eines aktiven Datenbanksystems"
-- "Verteilte Komponenten und Datenbankanbindung"
-- "Design Patterns"
-- "Freiburger Chorbuch"
-- "Maschinelle Lernverfahren zur Behandlung von Bonitätsrisiken im Mobilfunkgeschäft"
-- "Software Pioneers"

INSERT INTO film(id, version, titel, bewertung, preis, rabatt, veroeffentlichungsdatum, imdbEintrag, erzeugt, aktualisiert, genres, anbieter) VALUES
   (1,0,'Software Thriller',4,10.11,0.011,'2024-01-01','https://www.imdb.com/title/ty0094486/','2024-01-01 00:00:00','2024-01-01 00:00:00','Thriller','NETFLIX');
INSERT INTO film(id, version, titel, bewertung, preis, rabatt, veroeffentlichungsdatum, imdbEintrag, erzeugt, aktualisiert, genres, anbieter) VALUES
   (2,0,'Tier Doku',3,20.22,0.022,'2024-02-02','https://www.imdb.com/title/ab0098486/','2024-02-02 00:00:00','2024-02-02 00:00:00','Dokumentation','AMAZON');
INSERT INTO film(id, version, titel, bewertung, preis, rabatt, veroeffentlichungsdatum, imdbEintrag, erzeugt, aktualisiert, genres, anbieter) VALUES
   (3,0,'Architektur 2',1,30.33,0.033,'2024-03-03','https://www.imdb.com/title/dj0098437/','2024-03-03 00:00:00','2024-03-03 00:00:00','Dokumentation,Geschichte','PARAMOUNT');
INSERT INTO film(id, version, titel, bewertung, preis, rabatt, veroeffentlichungsdatum, imdbEintrag, erzeugt, aktualisiert, genres, anbieter) VALUES
   (4,0,'Best of HKA',5,40.44,0.044,'2024-04-04','https://www.imdb.com/title/sl0472437/','2024-04-04 00:00:00','2024-04-04 00:00:00','Komödie','DISNEY');
INSERT INTO film(id, version, titel, bewertung, preis, rabatt, veroeffentlichungsdatum, imdbEintrag, erzeugt, aktualisiert, genres, anbieter) VALUES
   (5,0,'Der fliegende PC',4,50.55,0.055,'2024-05-05','https://www.imdb.com/title/sl0472572/','2024-05-05 00:00:00','2024-05-05 00:00:00','Science-Fiction','NETFLIX');

INSERT INTO produktionsstudio(id, name, film_id) VALUES
    (1,'Constantin Film',1);
INSERT INTO produktionsstudio(id, name, film_id) VALUES
    (2,'Bavaria Film',2);
INSERT INTO produktionsstudio(id, name, film_id) VALUES
    (3,'Pinewood Studios',3);
INSERT INTO produktionsstudio(id, name, film_id) VALUES
    (4,'BW Film',4);
INSERT INTO produktionsstudio(id, name, film_id) VALUES
    (5,'SF Studios',5);

INSERT INTO produzent(id, vorname, nachname, film_id) VALUES
    (1,'Frank','Müller',1);
INSERT INTO produzent(id, vorname, nachname, film_id) VALUES
    (2,'Gustav','Gans',1);
INSERT INTO produzent(id, vorname, nachname, film_id) VALUES
    (3,'Robert','Rühl',2);
INSERT INTO produzent(id, vorname, nachname, film_id) VALUES
    (4,'Sofia','Sahl',2);
INSERT INTO produzent(id, vorname, nachname, film_id) VALUES
    (5,'Peter','Putz',3);
INSERT INTO produzent(id, vorname, nachname, film_id) VALUES
    (6,'Anette','Ahne',4);
INSERT INTO produzent(id, vorname, nachname, film_id) VALUES
    (7,'Susi','Schnell',5);
INSERT INTO produzent(id, vorname, nachname, film_id) VALUES
    (8,'Bettina','Burg',5);

