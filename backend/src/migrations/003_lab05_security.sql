INSERT OR IGNORE INTO Users (id, name) VALUES ('user-1', 'Анна');
INSERT OR IGNORE INTO Users (id, name) VALUES ('user-2', 'Богдан');
INSERT OR IGNORE INTO Users (id, name) VALUES ('user-3', 'Марія');

UPDATE Tasks SET userId = 'user-1' WHERE userId IS NULL OR userId = '';
