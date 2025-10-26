import Database from "better-sqlite3";
import { randomUUID } from "./uuid";
import { SimulationMessage } from "./simulation";

// Database row interface for holograms
interface HologramRow {
  id: string;
  simulation_id: string;
  name: string;
  acting_instructions: string;
  descriptions: string;
  wardrobe: string;
  created_at: string;
  updated_at: string;
}

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

  // Holograms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS holograms (
      id TEXT PRIMARY KEY,
      simulation_id TEXT NOT NULL,
      name TEXT NOT NULL,
      acting_instructions TEXT NOT NULL,
      descriptions TEXT NOT NULL,
      wardrobe TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_simulation_id ON messages(simulation_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_holograms_simulation_id ON holograms(simulation_id);
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

// Hologram model
export class HologramModel {
  static create(
    simulationId: string,
    name: string,
    actingInstructions: string[],
    descriptions: string[],
    wardrobe: string[],
  ): string {
    const id = randomUUID();

    console.log("🗄️ Creating hologram in database:", {
      id,
      simulationId,
      name,
      actingInstructionsCount: actingInstructions.length,
      descriptionsCount: descriptions.length,
      wardrobeCount: wardrobe.length,
    });

    const result = db
      .prepare(
        `
      INSERT INTO holograms (id, simulation_id, name, acting_instructions, descriptions, wardrobe)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        id,
        simulationId,
        name,
        JSON.stringify(actingInstructions),
        JSON.stringify(descriptions),
        JSON.stringify(wardrobe),
      );

    console.log("✅ Hologram insert result:", {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid,
    });
    return id;
  }

  static getById(id: string) {
    const row = db
      .prepare(
        `
      SELECT * FROM holograms WHERE id = ?
    `,
      )
      .get(id) as HologramRow | undefined;

    if (!row) return null;

    return {
      ...row,
      acting_instructions: JSON.parse(row.acting_instructions),
      descriptions: JSON.parse(row.descriptions),
      wardrobe: JSON.parse(row.wardrobe),
    };
  }

  static getBySimulationId(simulationId: string) {
    const rows = db
      .prepare(
        `
      SELECT * FROM holograms WHERE simulation_id = ? ORDER BY created_at ASC
    `,
      )
      .all(simulationId) as HologramRow[];

    return rows.map((row) => ({
      ...row,
      acting_instructions: JSON.parse(row.acting_instructions),
      descriptions: JSON.parse(row.descriptions),
      wardrobe: JSON.parse(row.wardrobe),
    }));
  }

  static update(
    id: string,
    name?: string,
    actingInstructions?: string[],
    descriptions?: string[],
    wardrobe?: string[],
  ) {
    console.log("🔄 Updating hologram in database:", {
      id,
      hasName: !!name,
      hasActingInstructions: !!actingInstructions,
      hasDescriptions: !!descriptions,
      hasWardrobe: !!wardrobe,
    });

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (actingInstructions !== undefined) {
      updates.push("acting_instructions = ?");
      values.push(JSON.stringify(actingInstructions));
    }
    if (descriptions !== undefined) {
      updates.push("descriptions = ?");
      values.push(JSON.stringify(descriptions));
    }
    if (wardrobe !== undefined) {
      updates.push("wardrobe = ?");
      values.push(JSON.stringify(wardrobe));
    }

    if (updates.length === 0) return;

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const result = db
      .prepare(
        `
      UPDATE holograms 
      SET ${updates.join(", ")} 
      WHERE id = ?
    `,
      )
      .run(...values);

    console.log("✅ Hologram update result:", {
      changes: result.changes,
    });
    return result;
  }

  static transfer(id: string, targetSimulationId: string) {
    console.log("🔄 Transferring hologram:", {
      hologramId: id,
      targetSimulationId,
    });

    const result = db
      .prepare(
        `
      UPDATE holograms 
      SET simulation_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      )
      .run(targetSimulationId, id);

    console.log("✅ Hologram transfer result:", {
      changes: result.changes,
    });
    return result;
  }

  static delete(id: string) {
    console.log("🗑️ Deleting hologram:", { id });
    const result = db.prepare(`DELETE FROM holograms WHERE id = ?`).run(id);
    console.log("✅ Hologram delete result:", {
      changes: result.changes,
    });
    return result;
  }

  static deleteBySimulationId(simulationId: string) {
    console.log("🗑️ Deleting holograms by simulation:", { simulationId });
    const result = db
      .prepare(`DELETE FROM holograms WHERE simulation_id = ?`)
      .run(simulationId);
    console.log("✅ Holograms delete result:", {
      changes: result.changes,
    });
    return result;
  }
}

// Initialize database on module load
initializeDatabase();

export { db };
