import { neon } from "@neondatabase/serverless";
import { randomUUID } from "./uuid";
import { SimulationMessage } from "./simulation";

// Database connection
const sql = neon(process.env.DATABASE_URL || "");

// Helper function to check if database is available
function checkDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for database operations");
  }
}

// Database row interface for simulations
interface SimulationRow {
  id: string;
  initial_prompt: string | null;
  simulation_object: string | null;
  ai_elements_usage: string | null;
  created_at: string;
  updated_at: string;
}

// Generic type for SQL query results
type SqlRow = Record<string, unknown>;

// Database row interface for runs
interface RunRow {
  id: string;
  simulation_id: string;
  status: string;
  current_turn: number;
  title?: string;
  created_at: string;
  updated_at: string;
}

// Database row interface for videos
interface VideoRow {
  id: string;
  run_id: string;
  video_url: string | null;
  status: string;
  generation_prompt: string | null;
  created_at: string;
  completed_at: string | null;
}

// Database row interface for turns
interface TurnRow {
  id: string;
  run_id: string;
  turn_number: number;
  user_prompt: string;
  ai_response: string;
  image_url: string | null;
  image_prompt: string | null;
  suggested_options: string[] | null;
  created_at: string;
}

// Database row interface for videos (unused)
// interface VideoRow {
//   id: string;
//   run_id: string;
//   video_url: string | null;
//   status: string;
//   generation_prompt: string | null;
//   created_at: string;
//   completed_at: string | null;
// }

// Initialize database schema
export async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log("⚠️ DATABASE_URL not found, skipping database initialization");
    return;
  }

  try {
    // Simulations table
    await sql`
      CREATE TABLE IF NOT EXISTS simulations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        initial_prompt TEXT,
        simulation_object TEXT,
        ai_elements_usage TEXT
      )
    `;

    // Messages table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        simulation_id UUID NOT NULL,
        from_role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar VARCHAR(500) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
      )
    `;

    // Runs table for story simulation runs
    await sql`
      CREATE TABLE IF NOT EXISTS runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        simulation_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        current_turn INTEGER DEFAULT 0,
        title VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
      )
    `;

    // Turns table for story progression
    await sql`
      CREATE TABLE IF NOT EXISTS turns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_id UUID NOT NULL,
        turn_number INTEGER NOT NULL,
        user_prompt TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        image_url TEXT,
        image_prompt TEXT,
        suggested_options TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE
      )
    `;

    // Videos table for generated highlight videos
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_id UUID NOT NULL,
        video_url TEXT,
        status VARCHAR(20) DEFAULT 'generating',
        generation_prompt TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE
      )
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_simulation_id ON messages(simulation_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_runs_simulation_id ON runs(simulation_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_turns_run_id ON turns(run_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_turns_turn_number ON turns(turn_number)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_run_id ON videos(run_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status)`;

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Simulation model
export class SimulationModel {
  static async create(
    initialPrompt?: string,
    simulationObject?: unknown,
    aiElementsUsage?: unknown,
  ): Promise<string> {
    checkDatabaseConnection();
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

    await sql`
      INSERT INTO simulations (id, initial_prompt, simulation_object, ai_elements_usage)
      VALUES (${id}, ${initialPrompt || null}, ${simulationObject ? JSON.stringify(simulationObject) : null}, ${aiElementsUsage ? JSON.stringify(aiElementsUsage) : null})
    `;

    console.log("✅ Simulation created:", { id });
    return id;
  }

  static async getById(id: string): Promise<SimulationRow | null> {
    checkDatabaseConnection();
    const result = await sql`
      SELECT * FROM simulations WHERE id = ${id}
    `;
    return (result[0] as SimulationRow) || null;
  }

  static async getAll() {
    checkDatabaseConnection();
    return await sql`
      SELECT * FROM simulations ORDER BY created_at DESC
    `;
  }

  static async update(
    id: string,
    status?: string,
    initialPrompt?: string,
    simulationObject?: unknown,
    aiElementsUsage?: unknown,
  ) {
    console.log("🔄 Updating simulation in database:", {
      id,
      hasStatus: !!status,
      hasPrompt: !!initialPrompt,
      hasSimulationObject: !!simulationObject,
      hasAiElementsUsage: !!aiElementsUsage,
    });

    const updates = [];

    if (status !== undefined) {
      updates.push("status = " + sql`${status}`);
    }
    if (initialPrompt !== undefined) {
      updates.push("initial_prompt = " + sql`${initialPrompt}`);
    }
    if (simulationObject !== undefined) {
      updates.push(
        "simulation_object = " +
          sql`${simulationObject ? JSON.stringify(simulationObject) : null}`,
      );
    }
    if (aiElementsUsage !== undefined) {
      updates.push(
        "ai_elements_usage = " +
          sql`${aiElementsUsage ? JSON.stringify(aiElementsUsage) : null}`,
      );
    }

    if (updates.length === 0) return;

    updates.push("updated_at = CURRENT_TIMESTAMP");

    await sql`
      UPDATE simulations 
      SET ${sql.unsafe(updates.join(", "))}
      WHERE id = ${id}
    `;

    console.log("✅ Simulation updated:", { id });
  }

  static async delete(id: string) {
    await sql`
      DELETE FROM simulations WHERE id = ${id}
    `;
    console.log("✅ Simulation deleted:", { id });
  }
}

// Message model
export class MessageModel {
  static async create(
    simulationId: string,
    fromRole: "user" | "assistant",
    content: string,
    name: string,
    avatar: string,
  ): Promise<string> {
    const id = randomUUID();

    console.log("💬 Creating message in database:", {
      id,
      simulationId,
      fromRole,
      contentLength: content.length,
      name,
    });

    await sql`
      INSERT INTO messages (id, simulation_id, from_role, content, name, avatar)
      VALUES (${id}, ${simulationId}, ${fromRole}, ${content}, ${name}, ${avatar})
    `;

    console.log("✅ Message created:", { id });
    return id;
  }

  static async getBySimulationId(
    simulationId: string,
  ): Promise<SimulationMessage[]> {
    const rows = await sql`
      SELECT * FROM messages 
      WHERE simulation_id = ${simulationId} 
      ORDER BY created_at ASC
    `;

    return rows.map(
      (row: SqlRow) =>
        ({
          key: row.key || randomUUID(),
          fromRole: row.from_role as "user" | "assistant",
          content: row.content,
          name: row.name,
          avatar: row.avatar,
        }) as SimulationMessage,
    );
  }

  static async deleteBySimulationId(simulationId: string) {
    await sql`
      DELETE FROM messages WHERE simulation_id = ${simulationId}
    `;
    console.log("✅ Messages deleted for simulation:", { simulationId });
  }
}

// Run model
export class RunModel {
  static async create(simulationId: string): Promise<string> {
    const id = randomUUID();

    console.log("🏃 Creating run in database:", {
      id,
      simulationId,
    });

    await sql`
      INSERT INTO runs (id, simulation_id)
      VALUES (${id}, ${simulationId})
    `;

    console.log("✅ Run created:", { id });
    return id;
  }

  static async getById(id: string): Promise<RunRow | null> {
    const result = await sql`
      SELECT * FROM runs WHERE id = ${id}
    `;
    const row = result[0] as SqlRow;
    if (!row) return null;

    return {
      id: row.id as string,
      simulation_id: row.simulation_id as string,
      status: row.status as string,
      current_turn: row.current_turn as number,
      title: row.title as string | undefined,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
  }

  static async getBySimulationId(simulationId: string) {
    return await sql`
      SELECT * FROM runs WHERE simulation_id = ${simulationId} ORDER BY created_at DESC
    `;
  }

  static async updateStatus(id: string, status: string) {
    await sql`
      UPDATE runs 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    console.log("✅ Run status updated:", { id, status });
  }

  static async updateTitle(id: string, title: string) {
    await sql`
      UPDATE runs 
      SET title = ${title}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    console.log("✅ Run title updated:", { id, title });
  }

  static async updateCurrentTurn(id: string, currentTurn: number) {
    await sql`
      UPDATE runs 
      SET current_turn = ${currentTurn}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    console.log("✅ Run current turn updated:", { id, currentTurn });
  }

  static async delete(id: string) {
    await sql`
      DELETE FROM runs WHERE id = ${id}
    `;
    console.log("✅ Run deleted:", { id });
  }

  static async deleteBySimulationId(simulationId: string) {
    await sql`
      DELETE FROM runs WHERE simulation_id = ${simulationId}
    `;
    console.log("✅ Runs deleted for simulation:", { simulationId });
  }
}

// Turn model
export class TurnModel {
  static async create(
    runId: string,
    turnNumber: number,
    userPrompt: string,
    aiResponse: string,
    imageUrl?: string,
    imagePrompt?: string,
    suggestedOptions?: string[],
  ): Promise<string> {
    const id = randomUUID();

    console.log("🔄 Creating turn in database:", {
      id,
      runId,
      turnNumber,
      userPromptLength: userPrompt.length,
      aiResponseLength: aiResponse.length,
      hasImage: !!imageUrl,
      hasSuggestedOptions: !!suggestedOptions,
    });

    await sql`
      INSERT INTO turns (id, run_id, turn_number, user_prompt, ai_response, image_url, image_prompt, suggested_options)
      VALUES (${id}, ${runId}, ${turnNumber}, ${userPrompt}, ${aiResponse}, ${imageUrl || null}, ${imagePrompt || null}, ${suggestedOptions ? JSON.stringify(suggestedOptions) : null})
    `;

    console.log("✅ Turn created:", { id });
    return id;
  }

  static async getById(id: string) {
    const result = await sql`
      SELECT * FROM turns WHERE id = ${id}
    `;
    return (result[0] as SqlRow) || null;
  }

  static async getByRunId(runId: string): Promise<TurnRow[]> {
    const rows = await sql`
      SELECT * FROM turns WHERE run_id = ${runId} ORDER BY turn_number ASC
    `;

    return rows.map((row: SqlRow) => ({
      id: row.id as string,
      run_id: row.run_id as string,
      turn_number: row.turn_number as number,
      user_prompt: row.user_prompt as string,
      ai_response: row.ai_response as string,
      image_url: row.image_url as string | null,
      image_prompt: row.image_prompt as string | null,
      suggested_options: row.suggested_options
        ? JSON.parse(row.suggested_options as string)
        : null,
      created_at: row.created_at as string,
    }));
  }

  static async getLatestByRunId(runId: string): Promise<TurnRow | null> {
    const result = await sql`
      SELECT * FROM turns WHERE run_id = ${runId} ORDER BY turn_number DESC LIMIT 1
    `;
    const row = result[0] as SqlRow;
    if (!row) return null;

    return {
      id: row.id as string,
      run_id: row.run_id as string,
      turn_number: row.turn_number as number,
      user_prompt: row.user_prompt as string,
      ai_response: row.ai_response as string,
      image_url: row.image_url as string | null,
      image_prompt: row.image_prompt as string | null,
      suggested_options: row.suggested_options
        ? JSON.parse(row.suggested_options as string)
        : null,
      created_at: row.created_at as string,
    };
  }

  static async delete(id: string) {
    await sql`
      DELETE FROM turns WHERE id = ${id}
    `;
    console.log("✅ Turn deleted:", { id });
  }

  static async deleteByRunId(runId: string) {
    await sql`
      DELETE FROM turns WHERE run_id = ${runId}
    `;
    console.log("✅ Turns deleted for run:", { runId });
  }
}

// Video model
export class VideoModel {
  static async create(
    runId: string,
    generationPrompt: string,
  ): Promise<string> {
    const id = randomUUID();

    console.log("🎬 Creating video in database:", {
      id,
      runId,
      generationPromptLength: generationPrompt.length,
    });

    await sql`
      INSERT INTO videos (id, run_id, generation_prompt)
      VALUES (${id}, ${runId}, ${generationPrompt})
    `;

    console.log("✅ Video created:", { id });
    return id;
  }

  static async getById(id: string): Promise<VideoRow | null> {
    const result = await sql`
      SELECT * FROM videos WHERE id = ${id}
    `;
    const row = result[0] as SqlRow;
    if (!row) return null;

    return {
      id: row.id as string,
      run_id: row.run_id as string,
      video_url: row.video_url as string | null,
      status: row.status as string,
      generation_prompt: row.generation_prompt as string | null,
      created_at: row.created_at as string,
      completed_at: row.completed_at as string | null,
    };
  }

  static async getByRunId(runId: string) {
    return await sql`
      SELECT * FROM videos WHERE run_id = ${runId} ORDER BY created_at DESC
    `;
  }

  static async updateStatus(id: string, status: string, videoUrl?: string) {
    const updates = [
      "status = " + sql`${status}`,
      "updated_at = CURRENT_TIMESTAMP",
    ];

    if (videoUrl) {
      updates.push("video_url = " + sql`${videoUrl}`);
    }

    if (status === "completed") {
      updates.push("completed_at = CURRENT_TIMESTAMP");
    }

    await sql`
      UPDATE videos 
      SET ${sql.unsafe(updates.join(", "))}
      WHERE id = ${id}
    `;

    console.log("✅ Video status update result:", { id, status });
  }

  static async updateUrl(id: string, videoUrl: string) {
    await sql`
      UPDATE videos 
      SET video_url = ${videoUrl}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    console.log("✅ Video URL updated:", { id, videoUrl });
  }

  static async delete(id: string) {
    await sql`
      DELETE FROM videos WHERE id = ${id}
    `;
    console.log("✅ Video deleted:", { id });
  }

  static async deleteByRunId(runId: string) {
    await sql`
      DELETE FROM videos WHERE run_id = ${runId}
    `;
    console.log("✅ Videos deleted for run:", { runId });
  }
}

// Export sql for direct queries when needed
export { sql };
