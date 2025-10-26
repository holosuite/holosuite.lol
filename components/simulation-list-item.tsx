"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Gamepad2, MessageSquare } from "lucide-react";
import Link from "next/link";

interface SimulationListItemProps {
  simulation: {
    id: string;
    created_at: string;
    updated_at: string;
    status: string;
    initial_prompt?: string;
    simulation_object?: string;
    ai_elements_usage?: string;
  };
}

export function SimulationListItem({ simulation }: SimulationListItemProps) {
  const createdDate = new Date(simulation.created_at);
  const updatedDate = new Date(simulation.updated_at);

  // Parse simulation object if available
  let simulationName = "Untitled Simulation";
  let simulationDescription = "No description available";

  if (simulation.simulation_object) {
    try {
      const simObj = JSON.parse(simulation.simulation_object);
      simulationName = simObj.name || simulationName;
      simulationDescription = simObj.description || simulationDescription;
    } catch (error) {
      console.error("Error parsing simulation object:", error);
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg mb-2">
              <Gamepad2 className="w-5 h-5 text-primary" />
              {simulationName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {simulationDescription}
            </p>
          </div>
          <Badge
            variant={simulation.status === "active" ? "default" : "secondary"}
            className="ml-4"
          >
            {simulation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Created {createdDate.toLocaleDateString()}
            </div>
            {updatedDate.getTime() !== createdDate.getTime() && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Updated {updatedDate.toLocaleDateString()}
              </div>
            )}
          </div>
          <Button asChild size="sm">
            <Link href={`/simulations/${simulation.id}`}>Open Simulation</Link>
          </Button>
        </div>
        {simulation.initial_prompt && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">
              Initial Prompt:
            </p>
            <p className="text-sm line-clamp-2">{simulation.initial_prompt}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
