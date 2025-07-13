import { openDatabaseSync } from "expo-sqlite";

// Open the database
const db = openDatabaseSync("beSober.db");

//
// ────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────
//

export type Counter = {
  id: number;
  name: string;
  startDate: string;
  lastUpdated: string;
  counter: number;
};

export type DefaultCounter = {
  id: number;
  name: string;  
  startDate: string;
  lastUpdated: string;
  longestStreak: number;
};

//
// ────────────────────────────────────────────────────────────────
// COUNTERS TABLE (Custom User-Created)
// ────────────────────────────────────────────────────────────────
//

export const initDB = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS counters (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        startDate TEXT NOT NULL,
        lastUpdated TEXT NOT NULL,
        counter INTEGER NOT NULL
      );
    `);
  } catch (e) {
    console.error("Failed to init counters table:", e);
  }
};

export const addCounter = async (name: string) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    await db.runAsync(
      `INSERT INTO counters (name, startDate, lastUpdated, counter) VALUES (?, ?, ?, ?);`,
      name,
      today,
      today,
      0
    );
  } catch (e) {
    console.error("Failed to add counter:", e);
  }
};

export const getCounters = async (): Promise<Counter[]> => {
  try {
    const result = await db.getAllAsync(`SELECT * FROM counters;`);
    return result as Counter[];
  } catch (e) {
    console.error("Failed to fetch counters:", e);
    return [];
  }
};

export const updateDailyCounters = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    await db.runAsync(
      `UPDATE counters
       SET counter = counter + 1,
           lastUpdated = ?
       WHERE lastUpdated < ?;`,
      today,
      today
    );
  } catch (e) {
    console.error("Failed to update counters:", e);
  }
};

export const deleteCounter = async (id: number) => {
  try {
    await db.runAsync(`DELETE FROM counters WHERE id = ?;`, id);
  } catch (e) {
    console.error("Failed to delete counter:", e);
  }
};

export const resetCounter = async (id: number) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    await db.runAsync(
      `UPDATE counters
       SET counter = 0,
           startDate = ?,
           lastUpdated = ?
       WHERE id = ?;`,
      today,
      today,
      id
    );
  } catch (e) {
    console.error("Failed to reset counter:", e);
  }
};

export const updateLabel = async (id: number, newName: string) => {
  try {
    await db.runAsync(`UPDATE counters SET name = ? WHERE id = ?;`, newName, id);
  } catch (e) {
    console.error("Failed to update label:", e);
  }
};

export const seedMockData = async () => {
  const today = new Date();
  const toISOString = (daysAgo: number) =>
    new Date(today.getTime() - daysAgo * 86400000).toISOString().split("T")[0];

  const mockData = [
    { name: "No Smoking", daysAgo: 5 },
    { name: "No Alcohol", daysAgo: 12 },
    { name: "No Sugar", daysAgo: 20 },
  ];

  try {
    for (const item of mockData) {
      const startDate = toISOString(item.daysAgo);
      const lastUpdated = toISOString(0);
      const counter = item.daysAgo + 1;

      await db.runAsync(
        `INSERT INTO counters (name, startDate, lastUpdated, counter) VALUES (?, ?, ?, ?);`,
        item.name,
        startDate,
        lastUpdated,
        counter
      );
    }
  } catch (e) {
    console.error("Failed to seed mock data:", e);
  }
};

//
// ────────────────────────────────────────────────────────────────
// DEFAULT COUNTER TABLE (Permanent + Longest Streak)
// ────────────────────────────────────────────────────────────────
//

export const initDefaultCounter = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS default_counter (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        startDate TEXT NOT NULL,
        lastUpdated TEXT NOT NULL,
        longestStreak INTEGER DEFAULT 0
      );
    `);

    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO default_counter (name, startDate, lastUpdated, longestStreak)
       SELECT 'Sobriety Default', ?, ?, 0
       WHERE NOT EXISTS (SELECT 1 FROM default_counter LIMIT 1);`,
      now,
      now
    );
  } catch (e) {
    console.error("Failed to init default_counter:", e);
  }
};

export const getDefaultCounter = async (): Promise<DefaultCounter | null> => {
  try {
    const result = await db.getFirstAsync(`SELECT * FROM default_counter LIMIT 1;`);
    return result as DefaultCounter;
  } catch (e) {
    console.error("Failed to fetch default_counter:", e);
    return null;
  }
};

export const resetDefaultCounter = async () => {
  try {
    const existing = await getDefaultCounter();
    if (!existing) return;

    const now = new Date();
    const start = new Date(existing.startDate);
    const streakDays = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const longestStreak = Math.max(existing.longestStreak, streakDays);
    const nowISO = now.toISOString();

    await db.runAsync(
      `UPDATE default_counter
       SET startDate = ?, lastUpdated = ?, longestStreak = ?
       WHERE id = ?;`,
      nowISO,
      nowISO,
      longestStreak,
      existing.id
    );
  } catch (e) {
    console.error("Failed to reset default counter:", e);
  }
};





















