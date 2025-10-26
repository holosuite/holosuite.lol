import type { Metadata } from "next";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

// Generate metadata for individual simulation pages
export async function generateMetadata({
  params,
}: {
  params: Promise<{ simulation_id: string }>;
}): Promise<Metadata> {
  const { simulation_id } = await params;

  try {
    // Fetch simulation data for metadata
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/simulations/${simulation_id}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (response.ok) {
      const simulation = await response.json();
      const title = simulation.title || "Interactive Simulation";
      const description =
        simulation.description ||
        "An immersive AI-powered interactive simulation experience.";

      return {
        title: `${title} | Interactive Simulation`,
        description: `${description} Experience this dynamic story simulation powered by Google Gemini AI with custom image generation and cinematic video production.`,
        keywords: [
          "interactive simulation",
          "AI-powered story",
          "dynamic storytelling",
          "simulation experience",
          "interactive entertainment",
          "AI story generation",
          "simulation platform",
        ],
        openGraph: {
          title: `${title} | Interactive Simulation`,
          description: `${description} Experience this dynamic story simulation powered by AI.`,
          url: `/simulations/${simulation_id}`,
          images: [
            {
              url: simulation.image_url || "/og-simulation.png",
              width: 1200,
              height: 630,
              alt: `${title} - Interactive Simulation`,
            },
          ],
        },
        twitter: {
          title: `${title} | Interactive Simulation`,
          description: `${description} Experience this dynamic story simulation powered by AI.`,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching simulation metadata:", error);
  }

  // Fallback metadata
  return {
    title: "Interactive Simulation | Holosuite",
    description:
      "Experience an immersive AI-powered interactive simulation with dynamic storytelling, custom image generation, and cinematic video production.",
  };
}

export default function SimulationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
