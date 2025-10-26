import { SimulationListItem } from "@/components/simulation-list-item";
import { PromptSubmission } from "@/components/prompt-submission";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface Simulation {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  initial_prompt?: string;
  simulation_object?: string;
  ai_elements_usage?: string;
}

async function getSimulations(): Promise<Simulation[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/simulations`,
      {
        method: "GET",
        cache: "no-store", // Ensure we get fresh data
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch simulations");
    }

    const data = await response.json();
    return data.simulations || [];
  } catch (error) {
    console.error("Error fetching simulations:", error);
    return [];
  }
}

export default async function SimulationsPage() {
  const simulations = await getSimulations();

  return (
    <div
      className="min-h-screen bg-background text-foreground page-transition"
      data-page-content
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-background/90 border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-0">
            <div className="text-2xl font-bold text-foreground tracking-tight">
              holosuite
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary -ml-0.5 mb-3"></div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition"
            >
              Home
            </Link>
            <Link href="/simulations" className="text-primary font-medium">
              Simulations
            </Link>
          </div>
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 hover:scale-105 hover:shadow-lg text-primary-foreground font-medium rounded-full px-6 transition-all duration-200 ease-in-out"
          >
            <Link href="/">
              <Plus className="w-4 h-4 mr-2" />
              New Simulation
            </Link>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Start Building Section */}
          <div className="mb-12">
            <PromptSubmission />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Your Simulations
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage and explore all your AI-powered simulations
            </p>
          </div>

          {/* Simulations List */}
          {simulations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No simulations yet
              </h3>
              <p className="text-muted-foreground">
                Use the form above to create your first simulation
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Your Simulations
                </h2>
                <p className="text-muted-foreground">
                  Click on any simulation to continue building or editing
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {simulations.map((simulation) => (
                  <SimulationListItem
                    key={simulation.id}
                    simulation={simulation}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
