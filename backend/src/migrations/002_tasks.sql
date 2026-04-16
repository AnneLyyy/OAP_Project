CREATE TABLE IF NOT EXISTS Tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  description TEXT,
  userId TEXT,
  FOREIGN KEY (userId) REFERENCES Users(id)
);