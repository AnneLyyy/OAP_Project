import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "data/app.db");

console.log("DB PATH:", DB_PATH);

export const db = open({
    filename: DB_PATH,
    driver: sqlite3.Database,
});