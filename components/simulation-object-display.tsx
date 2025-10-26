"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  <CollapsibleTrigger asChild>
    <Button
      variant="ghost"
      className="w-full justify-start p-0 h-auto font-medium text-left"
      onClick={() => toggleSection(section)}
    >
      {expandedSections.has(section) ? (
        <ChevronDown className="w-4 h-4 mr-2" />
      ) : (
        <ChevronRight className="w-4 h-4 mr-2" />
      )}
      <Icon className="w-4 h-4 mr-2" />
      {title}
      {children}
    </Button>
  </CollapsibleTrigger>
);

interface SimulationObjectDisplayProps {
  simulation: Simulation;
  aiElements?: AIElementsUsage;
}

export function SimulationObjectDisplay({
  simulation,
  aiElements,
}: SimulationObjectDisplayProps) {
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
    <div className="space-y-4">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            {simulation.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{simulation.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{simulation.type}</Badge>
            <Badge variant="outline">{simulation.complexity}</Badge>
            {simulation.genre && (
              <Badge variant="outline">{simulation.genre}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Environment */}
      <Card>
        <CardHeader>
          <SectionHeader
            title="Environment"
            icon={Settings}
            section="environment"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            <Badge variant="outline" className="ml-auto">
              {simulation.environment.scale}
            </Badge>
          </SectionHeader>
        </CardHeader>
        <Collapsible open={expandedSections.has("environment")}>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-2">
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
          <CardHeader>
            <SectionHeader
              title="Characters"
              icon={Users}
              section="characters"
              expandedSections={expandedSections}
              toggleSection={toggleSection}
            >
              <Badge variant="outline" className="ml-auto">
                {simulation.characters.length}
              </Badge>
            </SectionHeader>
          </CardHeader>
          <Collapsible open={expandedSections.has("characters")}>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {simulation.characters.map((character, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h4 className="font-semibold">{character.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {character.role}
                      </p>
                      {character.personality && (
                        <p className="text-sm mt-1">
                          <strong>Personality:</strong> {character.personality}
                        </p>
                      )}
                      {character.abilities &&
                        character.abilities.length > 0 && (
                          <div className="mt-2">
                            <strong className="text-sm">Abilities:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {character.abilities.map((ability, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {ability}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Objectives */}
      <Card>
        <CardHeader>
          <SectionHeader
            title="Objectives"
            icon={Target}
            section="objectives"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            <Badge variant="outline" className="ml-auto">
              {simulation.objectives.length}
            </Badge>
          </SectionHeader>
        </CardHeader>
        <Collapsible open={expandedSections.has("objectives")}>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {simulation.objectives.map((objective, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{objective.title}</h4>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            objective.type === "primary"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {objective.type}
                        </Badge>
                        {objective.difficulty && (
                          <Badge variant="outline">
                            {objective.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {objective.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Mechanics */}
      <Card>
        <CardHeader>
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
              <div className="space-y-3">
                <div>
                  <strong>Interaction:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {simulation.mechanics.interaction.map(
                      (interaction, index) => (
                        <li key={index} className="text-sm">
                          {interaction}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <p>
                  <strong>Progression:</strong>{" "}
                  {simulation.mechanics.progression}
                </p>
                <div>
                  <strong>Feedback:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {simulation.mechanics.feedback.map((feedback, index) => (
                      <li key={index} className="text-sm">
                        {feedback}
                      </li>
                    ))}
                  </ul>
                </div>
                <p>
                  <strong>Difficulty:</strong>{" "}
                  <Badge variant="outline">
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
        <CardHeader>
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
              <div className="space-y-3">
                <p>
                  <strong>Target Audience:</strong>{" "}
                  {simulation.educational.targetAudience}
                </p>
                {simulation.educational.learningOutcomes && (
                  <div>
                    <strong>Learning Outcomes:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {simulation.educational.learningOutcomes.map(
                        (outcome, index) => (
                          <li key={index} className="text-sm">
                            {outcome}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
                {simulation.educational.prerequisites && (
                  <div>
                    <strong>Prerequisites:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {simulation.educational.prerequisites.map(
                        (prereq, index) => (
                          <li key={index} className="text-sm">
                            {prereq}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
                {simulation.educational.assessment && (
                  <p>
                    <strong>Assessment:</strong>{" "}
                    {simulation.educational.assessment}
                  </p>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* AI Elements */}
      {aiElements && (
        <Card>
          <CardHeader>
            <SectionHeader
              title="AI Elements"
              icon={Code}
              section="aiElements"
              expandedSections={expandedSections}
              toggleSection={toggleSection}
            >
              <Badge variant="outline" className="ml-auto">
                {aiElements.components.length}
              </Badge>
            </SectionHeader>
          </CardHeader>
          <Collapsible open={expandedSections.has("aiElements")}>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <strong>Components:</strong>
                    <div className="space-y-2 mt-2">
                      {aiElements.components.map((component, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <h4 className="font-semibold">{component.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {component.usage}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {aiElements.interactions && (
                    <div>
                      <strong>Interactions:</strong>
                      <div className="space-y-2 mt-2">
                        {aiElements.interactions.map((interaction, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">
                                {interaction.type}
                              </h4>
                              <Badge variant="outline">
                                {interaction.component}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {interaction.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {simulation.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
