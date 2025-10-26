import { NextRequest, NextResponse } from "next/server";
import { VideoModel } from "@/lib/database";
import { put } from "@vercel/blob";
import { videoGenerationService } from "@/lib/ai-video-service";

// GET /api/videos/[video_id]/download - Download video file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ video_id: string }> },
) {
  try {
    const resolvedParams = await params;

    // Get video record
    const video = await VideoModel.getById(resolvedParams.video_id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (video.status !== "completed" || !video.video_url) {
      return NextResponse.json(
        { error: "Video not ready for download" },
        { status: 400 },
      );
    }

    // Check if it's a Vercel Blob URL (persistent)
    if (video.video_url.includes("blob.vercel-storage.com")) {
      // Redirect to the Vercel Blob URL for direct download
      return NextResponse.redirect(video.video_url);
    }

    // If it's a temporary Google URL, redirect to it (might still work)
    return NextResponse.redirect(video.video_url);
  } catch (error) {
    console.error("❌ Error serving video:", error);
    return NextResponse.json(
      { error: "Failed to serve video" },
      { status: 500 },
    );
  }
}

// GET /api/videos/[video_id]/stream - Stream video for playback
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ video_id: string }> },
) {
  try {
    const resolvedParams = await params;

    // Get video record
    const video = await VideoModel.getById(resolvedParams.video_id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (video.status !== "completed" || !video.video_url) {
      return NextResponse.json(
        { error: "Video not ready for streaming" },
        { status: 400 },
      );
    }

    // Check if it's already a Vercel Blob URL
    if (video.video_url.includes("blob.vercel-storage.com")) {
      return NextResponse.json({
        videoUrl: video.video_url,
        isPersistent: true,
      });
    }

    // Download and upload to Vercel Blob for persistent storage
    try {
      const videoBuffer = await videoGenerationService.downloadVideo(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        video.video_url as any,
      );

      // Upload to Vercel Blob
      const blob = await put(`${video.id}.mp4`, videoBuffer, {
        access: "public",
        contentType: "video/mp4",
      });

      // Update video record with persistent URL
      await VideoModel.updateUrl(video.id, blob.url);

      console.log("✅ Video uploaded to Vercel Blob:", {
        videoId: video.id,
        blobUrl: blob.url,
      });

      return NextResponse.json({
        videoUrl: blob.url,
        isPersistent: true,
      });
    } catch (downloadError) {
      console.error("❌ Error uploading video to blob:", downloadError);

      // Return original URL as fallback
      return NextResponse.json({
        videoUrl: video.video_url,
        isPersistent: false,
      });
    }
  } catch (error) {
    console.error("❌ Error preparing video stream:", error);
    return NextResponse.json(
      { error: "Failed to prepare video stream" },
      { status: 500 },
    );
  }
}
