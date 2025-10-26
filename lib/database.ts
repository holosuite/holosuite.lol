import Database from "better-sqlite3";
import { randomUUID } from "./uuid";
import { SimulationMessage } from "./simulation";

// Database row interface for messages
interface MessageRow {
  key: string;
  from_role: string;
  content: string;
  name: string;
  avatar: string;
}

const db = new Database("simulations.db");

// Initialize database schema
export function initializeDatabase() {
  // Simulations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS simulations (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active',
      initial_prompt TEXT,
      simulation_object TEXT,
      ai_elements_usage TEXT
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      simulation_id TEXT NOT NULL,
      from_role TEXT NOT NULL CHECK (from_role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_simulation_id ON messages(simulation_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
  `);

  console.log("Database initialized successfully");
}

// Simulation model
export class SimulationModel {
  static create(
    initialPrompt?: string,
    simulationObject?: unknown,
    aiElementsUsage?: unknown,
  ): string {
    const id = randomUUID();

    console.log("🗄️ Creating simulation in database:", {
      id,
      hasPrompt: !!initialPrompt,
      hasSimulationObject: !!simulationObject,
      hasAiElementsUsage: !!aiElementsUsage,
      simulationObjectSize: simulationObject
        ? JSON.stringify(simulationObject).length
        : 0,
    });

    const result = db
      .prepare(
        `
      INSERT INTO simulations (id, initial_prompt, simulation_object, ai_elements_usage)
      VALUES (?, ?, ?, ?)
    `,
      )
      .run(
        id,
        initialPrompt || null,
        simulationObject ? JSON.stringify(simulationObject) : null,
        aiElementsUsage ? JSON.stringify(aiElementsUsage) : null,
      );

    console.log("✅ Database insert result:", {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid,
    });
    return id;
  }

  static getById(id: string) {
    return db
      .prepare(
        `
      SELECT * FROM simulations WHERE id = ?
    `,
      )
      .get(id);
  }

  static getAll() {
    return db
      .prepare(
        `
      SELECT * FROM simulations ORDER BY created_at DESC
    `,
      )
      .all();
  }

  static updateStatus(id: string, status: string) {
    db.prepare(
      `
      UPDATE simulations 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
    ).run(status, id);
  }

  static updateSimulationObject(
    id: string,
    simulationObject?: unknown,
    aiElementsUsage?: unknown,
  ) {
    console.log("🔄 Updating simulation object in database:", {
      id,
      hasSimulationObject: !!simulationObject,
      hasAiElementsUsage: !!aiElementsUsage,
    });

    const result = db
      .prepare(
        `
      UPDATE simulations 
      SET simulation_object = ?, ai_elements_usage = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      )
      .run(
        simulationObject ? JSON.stringify(simulationObject) : null,
        aiElementsUsage ? JSON.stringify(aiElementsUsage) : null,
        id,
      );

    console.log("✅ Database update result:", {
      changes: result.changes,
    });
    return result;
  }

  static delete(id: string) {
    db.prepare(`DELETE FROM simulations WHERE id = ?`).run(id);
  }
}

// Message model
export class MessageModel {
  static create(simulationId: string, message: SimulationMessage): string {
    const id = randomUUID();

    db.prepare(
      `
      INSERT INTO messages (id, simulation_id, from_role, content, name, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run(
      id,
      simulationId,
      message.from,
      message.content,
      message.name,
      message.avatar,
    );

    return id;
  }

  static getBySimulationId(simulationId: string): SimulationMessage[] {
    const rows = db
      .prepare(
        `
      SELECT id as key, from_role as from_role, content, name, avatar, created_at
      FROM messages 
      WHERE simulation_id = ? 
      ORDER BY created_at ASC
    `,
      )
      .all(simulationId);

    return (rows as MessageRow[]).map((row) => ({
      key: row.key,
      from: row.from_role as "user" | "assistant",
      content: row.content,
      name: row.name,
      avatar: row.avatar,
    }));
  }

  static deleteBySimulationId(simulationId: string) {
    db.prepare(`DELETE FROM messages WHERE simulation_id = ?`).run(
      simulationId,
    );
  }

  static delete(id: string) {
    db.prepare(`DELETE FROM messages WHERE id = ?`).run(id);
  }
}

// Initialize database on module load
initializeDatabase();

export { db };
