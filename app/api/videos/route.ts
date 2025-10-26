import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database";

// GET /api/videos - List all completed videos
export async function GET() {
  try {
    // Get all completed videos with their run and simulation details
    const videos = await sql`
      SELECT 
        v.*,
        r.simulation_id,
        r.user_hologram_id,
        s.title as simulation_title,
        h.name as hologram_name
      FROM videos v
      JOIN runs r ON v.run_id = r.id
      JOIN simulations s ON r.simulation_id = s.id
      JOIN holograms h ON r.user_hologram_id = h.id
      WHERE v.status = 'completed' AND v.video_url IS NOT NULL
      ORDER BY v.completed_at DESC
    `;

    console.log("📹 Retrieved completed videos:", { count: videos.length });

    return NextResponse.json({
      videos: videos.map((video) => ({
        videoId: video.id,
        videoUrl: video.video_url,
        isPersistent: video.video_url?.includes("blob.vercel-storage.com"),
        simulationTitle: video.simulation_title,
        hologramName: video.hologram_name,
        completedAt: video.completed_at,
        downloadUrl: `/api/videos/${video.id}/download`,
        streamUrl: `/api/videos/${video.id}/stream`,
      })),
    });
  } catch (error) {
    console.error("❌ Error listing videos:", error);
    return NextResponse.json(
      { error: "Failed to list videos" },
      { status: 500 },
    );
  }
}
