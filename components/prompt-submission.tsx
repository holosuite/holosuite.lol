"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function PromptSubmission() {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to create simulation");
      }

      const { simulationId } = await response.json();

      // Navigate directly to the new simulation page
      router.push(`/simulations/${simulationId}`);
    } catch (error) {
      console.error("Error creating simulation:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Start Building Your Simulation
          </h2>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Describe your vision and our AI simulation builder will help you
          create it
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the simulation you'd like to create... (e.g., 'A space exploration game where players discover new planets and civilizations')"
            className="min-h-[160px] resize-none text-lg p-6 placeholder:text-lg placeholder:italic placeholder:opacity-60"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={!prompt.trim() || isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full px-10 py-7 text-xl min-w-[240px] transition-all hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-6 h-6 mr-2" />
                Create Simulation
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-base text-muted-foreground">
          Our AI will analyze your prompt and start building your simulation
          immediately
        </p>
      </div>
    </div>
  );
}
