import { db } from "../db/db.ts";
import { v4 as uuidv4 } from "uuid";

export const tasksService = {
  async getAll(query: any) {
    let sql = "SELECT * FROM Tasks WHERE 1=1";

    if (query.search) {
      sql += ` AND title LIKE '%${query.search}%'`;
    }

    if (query.sortBy) {
      sql += ` ORDER BY ${query.sortBy} ${query.sortDir || "ASC"}`;
    }

    if (query.page && query.pageSize) {
      const page = parseInt(query.page as string) || 1;
      const pageSize = parseInt(query.pageSize as string) || 10;
      const offset = (page - 1) * pageSize;

      sql += ` LIMIT ${pageSize} OFFSET ${offset}`;
    }

    return db.all(sql);
  },

  async getById(id: string) {
    return db.get("SELECT * FROM Tasks WHERE id = ?", [id]);
  },

  async create(data: any) {
    const id = uuidv4();

    await db.run(
      `INSERT INTO Tasks VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.date,
        data.location,
        data.capacity,
        data.description,
        data.userId || null
      ]
    );

    return { id, ...data };
  },

  async update(id: string, data: any) {
    await db.run(
      `UPDATE Tasks SET title=?, date=?, location=?, capacity=?, description=? WHERE id=?`,
      [data.title, data.date, data.location, data.capacity, data.description, id]
    );

    return this.getById(id);
  },

  async delete(id: string) {
    const res = await db.run(`DELETE FROM Tasks WHERE id=?`, [id]);
    return (res.changes ?? 0) > 0; // ✅ FIX
  },

  async getByDate(from: string, to: string) {
    return db.all(
      `SELECT * FROM Tasks WHERE date BETWEEN ? AND ? ORDER BY date`,
      [from, to]
    );
  },

  async getWithUsers() {
    return db.all(`
      SELECT t.*, u.name
      FROM Tasks t
      LEFT JOIN Users u ON u.id = t.userId
    `);
  },

  async count() {
    return db.get(`SELECT COUNT(*) as count FROM Tasks`);
  }
};