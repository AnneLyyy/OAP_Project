import { db } from "../db/db.ts";
import { v4 as uuidv4 } from "uuid";

export const tasksService = {
  async getAll(query: any) {
  let sql = "SELECT * FROM Tasks WHERE 1=1";
  const params: any[] = [];

  if (query.search) {
    sql += " AND title LIKE ?";
    params.push(`%${query.search}%`);
  }

  if (query.sortBy) {
    const allowed = ["title", "date", "location", "capacity"];

    if (allowed.includes(query.sortBy)) {
      sql += ` ORDER BY ${query.sortBy} ${query.sortDir === "desc" ? "DESC" : "ASC"}`;
    }
  } else {
    sql += " ORDER BY date DESC";
  }

  if (query.page && query.pageSize) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    sql += " LIMIT ? OFFSET ?";
    params.push(pageSize, offset);
  }

  return (await db).all(sql, params);
},

  async getById(id: string) {
    return (await db).get("SELECT * FROM Tasks WHERE id = ?", [id]);
  },

  async findDuplicate(title: string, date: string, excludeId?: string) {
    const database = await db;

    if (excludeId) {
      return database.get(
        "SELECT * FROM Tasks WHERE LOWER(title) = LOWER(?) AND date = ? AND id <> ?",
        [title, date, excludeId]
      );
    }

    return database.get(
      "SELECT * FROM Tasks WHERE LOWER(title) = LOWER(?) AND date = ?",
      [title, date]
    );
  },

  async create(data: any) {
  const id = uuidv4();

  await (await db).run(
    `
    INSERT INTO Tasks 
    (id, title, date, location, capacity, description, userId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      data.title,
      data.date,
      data.location,
      data.capacity,
      data.description ?? null,
      data.userId ?? null
    ]
  );

  console.log("Task inserted:", id);

  return { id, ...data };
},

  async update(id: string, data: any) {
    const current = await this.getById(id);

    if (!current) {
      return null;
    }

    const updated = {
      title: data.title ?? current.title,
      date: data.date ?? current.date,
      location: data.location ?? current.location,
      capacity: data.capacity ?? current.capacity,
      description: data.description ?? current.description
    };

    await (await db).run(
      `UPDATE Tasks SET title=?, date=?, location=?, capacity=?, description=? WHERE id=?`,
      [updated.title, updated.date, updated.location, updated.capacity, updated.description, id]
    );

    return this.getById(id);
  },

  async replace(id: string, data: any) {
    const current = await this.getById(id);

    if (!current) {
      return null;
    }

    await (await db).run(
      `UPDATE Tasks SET title=?, date=?, location=?, capacity=?, description=? WHERE id=?`,
      [data.title, data.date, data.location, data.capacity, data.description ?? null, id]
    );

    return this.getById(id);
  },

  async delete(id: string) {
    const res = await (await db).run(`DELETE FROM Tasks WHERE id=?`, [id]);
    return (res.changes ?? 0) > 0;
  },

  async getByDate(from: string, to: string) {
    return (await db).all(
      `SELECT * FROM Tasks WHERE date BETWEEN ? AND ? ORDER BY date`,
      [from, to]
    );
  },

  async getTopCapacity(limit = 3) {
    return (await db).all(
      `SELECT *
       FROM Tasks
       WHERE date >= date('now', '-3 month')
       ORDER BY capacity DESC, date DESC
       LIMIT ?`,
      [limit]
    );
  },

  async getWithUsers() {
    return (await db).all(`
      SELECT t.*, u.name
      FROM Tasks t
      LEFT JOIN Users u ON u.id = t.userId
    `);
  },

  async count() {
    return (await db).get(`SELECT COUNT(*) as count FROM Tasks`);
  }
};