import { db } from "./db.ts";

export async function initDb() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

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

    CREATE TABLE IF NOT EXISTS UserStats (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      totalUsers INTEGER NOT NULL
    );
  `);
}