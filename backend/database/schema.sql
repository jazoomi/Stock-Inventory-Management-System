-- raw ingredients table
CREATE TABLE IF NOT EXISTS raw_ingredients(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT,
    price FLOAT NOT NULL,
    threshold INTEGER,
    serving FLOAT NOT NULL

);
-- assembled ingredients table
CREATE TABLE IF NOT EXISTS assembled_ingredients(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    recipe TEXT NOT NULL, -- raw ingredients combined 
    price FLOAT NOT NULL -- combinging prices of raws
    
);
-- combo deals table
CREATE TABLE IF NOT EXISTS combo(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    items TEXT NOT NULL, -- assmbled ingredients combined
    price FLOAT -- combining ingredients price of assembled

);