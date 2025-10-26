"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Play, Clock } from "lucide-react";
import Link from "next/link";

interface StorySimulation {
  id: string;
  title: string;
  description: string;
  genre: string;
  setting: string;
  estimatedTurns: number;
  characterCount: number;
}

export function StorySimulationsList() {
  const [simulations, setSimulations] = useState<StorySimulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorySimulations = async () => {
      try {
        // Get all simulations and filter for story types
        const response = await fetch("/api/simulations");
        if (response.ok) {
          const data = await response.json();
          const storySimulations =
            data.simulations
              ?.filter((sim: any) => {
                try {
                  const simObj = JSON.parse(sim.simulation_object || "{}");
                  return simObj.type === "story";
                } catch {
                  return false;
                }
              })
              .map((sim: any) => {
                const simObj = JSON.parse(sim.simulation_object || "{}");
                return {
                  id: sim.id,
                  title:
                    simObj.title || simObj.story?.title || "Interactive Story",
                  description: simObj.story?.description || "",
                  genre: simObj.story?.genre || "",
                  setting: simObj.story?.setting || "",
                  estimatedTurns: simObj.story?.estimatedTurns || 10,
                  characterCount: simObj.story?.characters?.length || 0,
                };
              }) || [];

          setSimulations(storySimulations);
        }
      } catch (error) {
        console.error("Error loading story simulations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorySimulations();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          Loading story simulations...
        </div>
      </div>
    );
  }

  if (simulations.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          No story simulations available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {simulations.map((simulation) => (
        <Card key={simulation.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{simulation.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {simulation.genre}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {simulation.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>{simulation.setting}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{simulation.characterCount} characters</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>~{simulation.estimatedTurns} turns</span>
              </div>
            </div>

            <Link href={`/simulations/${simulation.id}`}>
              <Button className="w-full" variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Start Story
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
