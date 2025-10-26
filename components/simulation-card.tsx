"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Gamepad2,
  Users,
  Target,
  Settings,
  GraduationCap,
  Code,
  Star,
  Layers,
} from "lucide-react";
import type { Simulation, AIElementsUsage } from "@/lib/simulation-schema";

// Move SectionHeader outside of component to avoid React hooks rule
const SectionHeader = ({
  title,
  icon: Icon,
  section,
  children,
  expandedSections,
  toggleSection,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  section: string;
  children?: React.ReactNode;
  expandedSections: Set<string>;
  toggleSection: (section: string) => void;
}) => (
  <Button
    variant="ghost"
    className="w-full justify-start p-0 h-auto font-medium text-left text-sm"
    onClick={() => toggleSection(section)}
  >
    {expandedSections.has(section) ? (
      <ChevronDown className="w-3 h-3 mr-2" />
    ) : (
      <ChevronRight className="w-3 h-3 mr-2" />
    )}
    <Icon className="w-3 h-3 mr-2" />
    {title}
    {children}
  </Button>
);

interface SimulationCardProps {
  simulation: Simulation;
  aiElements?: AIElementsUsage;
}

export function SimulationCard({
  simulation,
  aiElements,
}: SimulationCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["overview"]),
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="space-y-3">
      {/* Overview Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gamepad2 className="w-4 h-4" />
            {simulation.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {simulation.description}
          </p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {simulation.type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {simulation.complexity}
            </Badge>
            {simulation.genre && (
              <Badge variant="outline" className="text-xs">
                {simulation.genre}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Environment */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            title="Environment"
            icon={Settings}
            section="environment"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            <Badge variant="outline" className="ml-auto text-xs">
              {simulation.environment.scale}
            </Badge>
          </SectionHeader>
        </CardHeader>
        <Collapsible open={expandedSections.has("environment")}>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-2 text-xs">
                <p>
                  <strong>Setting:</strong> {simulation.environment.setting}
                </p>
                <p>
                  <strong>Atmosphere:</strong>{" "}
                  {simulation.environment.atmosphere}
                </p>
                {simulation.environment.timePeriod && (
                  <p>
                    <strong>Time Period:</strong>{" "}
                    {simulation.environment.timePeriod}
                  </p>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Characters */}
      {simulation.characters && simulation.characters.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader
              title="Characters"
              icon={Users}
              section="characters"
              expandedSections={expandedSections}
              toggleSection={toggleSection}
            >
              <Badge variant="outline" className="ml-auto text-xs">
                {simulation.characters.length}
              </Badge>
            </SectionHeader>
          </CardHeader>
          <Collapsible open={expandedSections.has("characters")}>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {simulation.characters.slice(0, 3).map((character, index) => (
                    <div key={index} className="border rounded p-2 text-xs">
                      <h4 className="font-medium">{character.name}</h4>
                      <p className="text-muted-foreground">{character.role}</p>
                    </div>
                  ))}
                  {simulation.characters.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{simulation.characters.length - 3} more
                    </p>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Objectives */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            title="Objectives"
            icon={Target}
            section="objectives"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            <Badge variant="outline" className="ml-auto text-xs">
              {simulation.objectives.length}
            </Badge>
          </SectionHeader>
        </CardHeader>
        <Collapsible open={expandedSections.has("objectives")}>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {simulation.objectives.slice(0, 3).map((objective, index) => (
                  <div key={index} className="border rounded p-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{objective.title}</h4>
                      <Badge
                        variant={
                          objective.type === "primary" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {objective.type}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {objective.description}
                    </p>
                  </div>
                ))}
                {simulation.objectives.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{simulation.objectives.length - 3} more
                  </p>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Mechanics */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            title="Mechanics"
            icon={Settings}
            section="mechanics"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        </CardHeader>
        <Collapsible open={expandedSections.has("mechanics")}>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-2 text-xs">
                <div>
                  <strong>Interaction:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {simulation.mechanics.interaction
                      .slice(0, 3)
                      .map((interaction, index) => (
                        <li key={index}>{interaction}</li>
                      ))}
                  </ul>
                </div>
                <p>
                  <strong>Progression:</strong>{" "}
                  {simulation.mechanics.progression}
                </p>
                <p>
                  <strong>Difficulty:</strong>{" "}
                  <Badge variant="outline" className="text-xs">
                    {simulation.mechanics.difficulty}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Educational Aspects */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            title="Educational"
            icon={GraduationCap}
            section="educational"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        </CardHeader>
        <Collapsible open={expandedSections.has("educational")}>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-2 text-xs">
                <p>
                  <strong>Target Audience:</strong>{" "}
                  {simulation.educational.targetAudience}
                </p>
                {simulation.educational.learningOutcomes && (
                  <div>
                    <strong>Learning Outcomes:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {simulation.educational.learningOutcomes
                        .slice(0, 3)
                        .map((outcome, index) => (
                          <li key={index}>{outcome}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* AI Elements */}
      {aiElements && (
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader
              title="AI Elements"
              icon={Code}
              section="aiElements"
              expandedSections={expandedSections}
              toggleSection={toggleSection}
            >
              <Badge variant="outline" className="ml-auto text-xs">
                {aiElements.components.length}
              </Badge>
            </SectionHeader>
          </CardHeader>
          <Collapsible open={expandedSections.has("aiElements")}>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div>
                    <strong className="text-xs">Components:</strong>
                    <div className="space-y-1 mt-1">
                      {aiElements.components
                        .slice(0, 3)
                        .map((component, index) => (
                          <div
                            key={index}
                            className="border rounded p-2 text-xs"
                          >
                            <h4 className="font-medium">{component.name}</h4>
                            <p className="text-muted-foreground">
                              {component.usage}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Implementation Details */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            title="Implementation"
            icon={Layers}
            section="implementation"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        </CardHeader>
        <Collapsible open={expandedSections.has("implementation")}>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-2 text-xs">
                <div>
                  <strong>Platforms:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {simulation.implementation.platform.map(
                      (platform, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {platform}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
                {simulation.implementation.estimatedDuration && (
                  <p>
                    <strong>Duration:</strong>{" "}
                    {simulation.implementation.estimatedDuration}
                  </p>
                )}
                {simulation.implementation.multiplayer && (
                  <Badge variant="outline" className="text-xs">
                    Multiplayer
                  </Badge>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Star className="w-3 h-3" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1">
            {simulation.tags.slice(0, 8).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {simulation.tags.length > 8 && (
              <Badge variant="outline" className="text-xs">
                +{simulation.tags.length - 8}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
