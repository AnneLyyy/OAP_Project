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

  async rebuildStats() {
    const database = await db;
    const updatedAt = new Date().toISOString();

    await database.run("DELETE FROM TaskStats");

    const longestTitle = await database.get(`
      SELECT title, LENGTH(title) as titleLength
      FROM Tasks
      ORDER BY LENGTH(title) DESC, title ASC
      LIMIT 1
    `);

    const biggestCapacity = await database.get(`
      SELECT title, capacity
      FROM Tasks
      ORDER BY capacity DESC, title ASC
      LIMIT 1
    `);

    const timeline = await database.get(`
      SELECT
        COALESCE(SUM(CASE WHEN date >= date('now') THEN 1 ELSE 0 END), 0) as upcomingEvents,
        COALESCE(SUM(CASE WHEN date < date('now') THEN 1 ELSE 0 END), 0) as pastEvents
      FROM Tasks
    `);

    const byMonth = await database.all(`
      SELECT
        strftime('%Y-%m', date) as month,
        COUNT(*) as count
      FROM Tasks
      GROUP BY month
      ORDER BY month
    `); 

    await database.run(
      `
      INSERT INTO TaskStats (
        id,
        longestTitle,
        longestTitleLength,
        biggestCapacity,
        biggestCapacityTitle,
        upcomingEvents,
        pastEvents,
        byMonth,
        updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        uuidv4(),
        longestTitle?.title ?? "-",
        longestTitle?.titleLength ?? 0,
        biggestCapacity?.capacity ?? 0,
        biggestCapacity?.title ?? "-",
        timeline?.upcomingEvents ?? 0,
        timeline?.pastEvents ?? 0,
        JSON.stringify(byMonth),
        updatedAt
      ]
    );
  },

  async getStats() {
    await this.rebuildStats();

    const row = await (await db).get(`
      SELECT *
      FROM TaskStats
      ORDER BY updatedAt DESC
      LIMIT 1
    `);

    return {
      longestTitle: row?.longestTitle ?? "-",
      longestTitleLength: row?.longestTitleLength ?? 0,
      biggestCapacity: row?.biggestCapacity ?? 0,
      biggestCapacityTitle: row?.biggestCapacityTitle ?? "-",
      upcomingEvents: row?.upcomingEvents ?? 0,
      pastEvents: row?.pastEvents ?? 0,
      byMonth: row?.byMonth ? JSON.parse(row.byMonth) : [],
      updatedAt: row?.updatedAt ?? new Date().toISOString()
    };
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

    await this.rebuildStats();

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

    await this.rebuildStats();

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

    await this.rebuildStats();

    return this.getById(id);
  },

  async delete(id: string) {
    const res = await (await db).run(`DELETE FROM Tasks WHERE id=?`, [id]);

    await this.rebuildStats();

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
