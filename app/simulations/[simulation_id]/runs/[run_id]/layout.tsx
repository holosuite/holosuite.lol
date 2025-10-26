import type { Metadata } from "next";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

// Generate metadata for run detail pages
export async function generateMetadata({
  params,
}: {
  params: Promise<{ simulation_id: string; run_id: string }>;
}): Promise<Metadata> {
  const { simulation_id, run_id } = await params;

  try {
    // Fetch simulation and run data for metadata
    const [simulationResponse, runResponse] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/simulations/${simulation_id}`,
        { method: "GET", cache: "no-store" },
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/simulations/${simulation_id}/runs/${run_id}`,
        { method: "GET", cache: "no-store" },
      ),
    ]);

    if (simulationResponse.ok && runResponse.ok) {
      const simulation = await simulationResponse.json();
      const run = await runResponse.json();

      const simulationTitle = simulation.title || "Interactive Simulation";
      const runTitle = run.title || "Story Run";

      return {
        title: `${runTitle} | ${simulationTitle} Story Run`,
        description: `Experience "${runTitle}" - an interactive story run from "${simulationTitle}". Follow the narrative journey with AI-generated images, dynamic storytelling, and immersive character interactions powered by Google Gemini AI.`,
        keywords: [
          "story run",
          "interactive narrative",
          "AI storytelling",
          "dynamic story experience",
          "character interaction",
          "story progression",
          "narrative simulation",
          "AI story run",
        ],
        openGraph: {
          title: `${runTitle} | ${simulationTitle} Story Run`,
          description: `Experience "${runTitle}" - an interactive story run with AI-generated images and dynamic storytelling.`,
          url: `/simulations/${simulation_id}/runs/${run_id}`,
          images: [
            {
              url: run.image_url || simulation.image_url || "/og-run.png",
              width: 1200,
              height: 630,
              alt: `${runTitle} - Interactive Story Run`,
            },
          ],
        },
        twitter: {
          title: `${runTitle} | ${simulationTitle} Story Run`,
          description: `Experience "${runTitle}" - an interactive story run with AI-generated images and dynamic storytelling.`,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching run metadata:", error);
  }

  // Fallback metadata
  return {
    title: "Story Run | Interactive Simulation",
    description:
      "Experience an interactive story run with AI-generated images, dynamic storytelling, and immersive character interactions.",
  };
}

export default function RunLayout({ children }: { children: React.ReactNode }) {
  return children;
}
