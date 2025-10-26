import { NextRequest, NextResponse } from "next/server";
import { VideoModel } from "@/lib/database";

// GET /api/videos/[video_id]/stream - Get video URL for streaming
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ video_id: string }> },
) {
  try {
    const resolvedParams = await params;

    // Get video record
    const video = VideoModel.getById(resolvedParams.video_id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (video.status !== "completed" || !video.video_url) {
      return NextResponse.json(
        { error: "Video not ready for streaming" },
        { status: 400 },
      );
    }

    // Return the video URL (Vercel Blob URLs are persistent)
    return NextResponse.json({
      videoUrl: video.video_url,
      isPersistent: video.video_url.includes("blob.vercel-storage.com"),
      videoId: video.id,
    });
  } catch (error) {
    console.error("❌ Error preparing video stream:", error);
    return NextResponse.json(
      { error: "Failed to prepare video stream" },
      { status: 500 },
    );
  }
}
