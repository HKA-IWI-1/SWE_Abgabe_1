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

-- https://www.sqlite.org/lang_dropindex.html
DROP INDEX IF EXISTS produzent_film_id_idx;
DROP INDEX IF EXISTS film_titel_idx;

-- https://www.sqlite.org/lang_droptable.html
DROP TABLE IF EXISTS produzent;
DROP TABLE IF EXISTS produktionsstudio;
DROP TABLE IF EXISTS film;
