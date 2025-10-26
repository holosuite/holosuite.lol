import { NextRequest, NextResponse } from "next/server";
import { VideoModel } from "@/lib/database";

// GET /api/videos/[video_id]/download - Download video file
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

    // Check if we have a local cached version
    const localVideoPath = join(
      process.cwd(),
      "public",
      "videos",
      `${video.id}.mp4`,
    );

    if (existsSync(localVideoPath)) {
      // Return local file URL for streaming
      return NextResponse.json({
        videoUrl: `/videos/${video.id}.mp4`,
        isLocal: true,
      });
    }

    // Download and cache if not local
    try {
      const videoBuffer = await videoGenerationService.downloadVideo(
        video.video_url,
      );

      // Ensure videos directory exists
      const videosDir = join(process.cwd(), "public", "videos");
      if (!existsSync(videosDir)) {
        await mkdir(videosDir, { recursive: true });
      }

      // Save to local storage
      await writeFile(localVideoPath, videoBuffer);

      console.log("✅ Video cached for streaming:", { videoId: video.id });

      return NextResponse.json({
        videoUrl: `/videos/${video.id}.mp4`,
        isLocal: true,
      });
    } catch (downloadError) {
      console.error("❌ Error caching video:", downloadError);

      // Return original URL as fallback
      return NextResponse.json({
        videoUrl: video.video_url,
        isLocal: false,
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
