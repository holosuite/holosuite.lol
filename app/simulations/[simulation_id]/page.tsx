"use client";

import { useState, useCallback, use, useEffect } from "react";
import { Actions, Action } from "@/components/ai-elements/actions";
import {
  Message,
  MessageContent,
  MessageAvatar,
} from "@/components/ai-elements/message";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputMessage,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import type { ChatStatus } from "ai";
import {
  SimulationMessage,
  MESSAGE_ACTIONS,
  createInitialMessages,
  createUserMessage,
} from "@/lib/simulation";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Info,
  GitFork,
  Play,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import { SimulationCard } from "@/components/simulation-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Simulation, AIElementsUsage } from "@/lib/simulation-schema";

// Type definition for run objects
interface Run {
  id: string;
  status: string;
  currentTurn: number;
  createdAt: string;
  updatedAt: string;
}

export default function SimulationPage({
  params,
}: {
  params: Promise<{ simulation_id: string }>;
}) {
  const resolvedParams = use(params);
  const [messages, setMessages] = useState<SimulationMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [simulationObject, setSimulationObject] = useState<Simulation | null>(
    null,
  );
  const [aiElementsUsage, setAiElementsUsage] =
    useState<AIElementsUsage | null>(null);
  const [showSimulationDetails, setShowSimulationDetails] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [isUpdatingState, setIsUpdatingState] = useState(false);
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);

  // Load runs
  const loadRuns = useCallback(async () => {
    setIsLoadingRuns(true);
    try {
      const response = await fetch(
        `/api/simulations/${resolvedParams.simulation_id}/runs`,
      );
      if (response.ok) {
        const data = await response.json();
        setRuns(data.runs || []);
        console.log("🏃 Runs loaded:", data.runs?.length || 0);
      }
    } catch (error) {
      console.error("Error loading runs:", error);
    } finally {
      setIsLoadingRuns(false);
    }
  }, [resolvedParams.simulation_id]);

  // Load simulation data from API
  useEffect(() => {
    const loadSimulation = async () => {
      try {
        const response = await fetch(
          `/api/simulations/${resolvedParams.simulation_id}`,
        );
        if (response.ok) {
          const data = await response.json();
          console.log("🔍 Simulation data loaded:", {
            hasSimulation: !!data.simulation,
            hasSimulationObject: !!data.simulation?.simulation_object,
            hasAiElementsUsage: !!data.simulation?.ai_elements_usage,
            messagesCount: data.messages?.length || 0,
            simulationObjectContent: data.simulation?.simulation_object,
          });
          setMessages(data.messages);

          // Load simulation object if available
          if (data.simulation?.simulation_object) {
            try {
              const simObj = JSON.parse(data.simulation.simulation_object);
              setSimulationObject(simObj);
            } catch (error) {
              console.error("Error parsing simulation object:", error);
            }
          }

          // Load AI elements usage if available
          if (data.simulation?.ai_elements_usage) {
            try {
              const aiElements = JSON.parse(data.simulation.ai_elements_usage);
              setAiElementsUsage(aiElements);
            } catch (error) {
              console.error("Error parsing AI elements usage:", error);
            }
          }
        } else {
          // Fallback to initial messages if simulation not found
          setMessages(createInitialMessages());
        }
      } catch (error) {
        console.error("Error loading simulation:", error);
        setMessages(createInitialMessages());
      } finally {
        setIsLoading(false);
      }
    };

    loadSimulation();
    loadRuns();
  }, [resolvedParams.simulation_id, loadRuns]);

  // Update simulation state function
  const handleUpdateSimulationState = useCallback(
    async (updatePrompt: string) => {
      if (isUpdatingState || !simulationObject) return;

      setIsUpdatingState(true);
      try {
        const response = await fetch(
          `/api/simulations/${resolvedParams.simulation_id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              updatePrompt,
              currentSimulationObject: simulationObject,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update simulation state");
        }

        const {
          updatedSimulationObject,
          updatedAiElementsUsage,
          userMessage,
          assistantMessage,
        } = await response.json();

        // Update local state
        setSimulationObject(updatedSimulationObject);
        setAiElementsUsage(updatedAiElementsUsage);

        // Add messages to conversation
        setMessages((prev) => [...prev, userMessage, assistantMessage]);
      } catch (error) {
        console.error("Error updating simulation state:", error);
      } finally {
        setIsUpdatingState(false);
      }
    },
    [simulationObject, isUpdatingState, resolvedParams.simulation_id],
  );

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);
      if (!(hasText || hasAttachments)) {
        return;
      }

      // Add user message immediately
      const userMessage = createUserMessage(message.text || "Sent files");
      setMessages((prev) => [...prev, userMessage]);
      setStatus("submitted");

      try {
        const messageContent = message.text || "Sent files";

        // Check if this is an update command
        const isUpdate = isUpdateCommand(messageContent);
        console.log("🔍 Update command detection:", {
          messageContent,
          isUpdate,
          hasSimulationObject: !!simulationObject,
          willUpdate: isUpdate && simulationObject,
        });

        if (isUpdate && simulationObject) {
          // Handle as state update
          console.log("🔄 Triggering state update...");
          await handleUpdateSimulationState(messageContent);
          setStatus(undefined);
        } else {
          // Handle as regular message
          const response = await fetch(
            `/api/simulations/${resolvedParams.simulation_id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: messageContent,
                from: "user",
                name: "You",
                avatar: "https://github.com/vercel.png",
              }),
            },
          );

          if (response.ok) {
            const { assistantMessage } = await response.json();
            setStatus("streaming");

            // Simulate streaming delay
            setTimeout(() => {
              setMessages((prev) => [...prev, assistantMessage]);
              setStatus(undefined);
            }, 2000);
          } else {
            throw new Error("Failed to send message");
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setStatus(undefined);
      }
    },
    [
      resolvedParams.simulation_id,
      handleUpdateSimulationState,
      simulationObject,
    ],
  );

  // Fork simulation function
  const handleForkSimulation = useCallback(async () => {
    if (isForking) return;

    setIsForking(true);
    try {
      // Create a duplicate simulation with the same data
      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt:
            messages.find((m) => m.fromRole === "user")?.content ||
            "Forked simulation",
          simulationObject: simulationObject,
          aiElementsUsage: aiElementsUsage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fork simulation");
      }

      const { simulationId } = await response.json();

      // Navigate to the new simulation
      window.location.href = `/simulations/${simulationId}`;
    } catch (error) {
      console.error("Error forking simulation:", error);
      setIsForking(false);
    }
  }, [messages, simulationObject, aiElementsUsage, isForking]);

  // Check if message contains update commands
  const isUpdateCommand = (content: string): boolean => {
    const updateKeywords = [
      "update",
      "change",
      "modify",
      "add",
      "remove",
      "set",
      "make",
      "transform",
      "convert",
      "adjust",
      "edit",
      "revise",
      "alter",
    ];
    const lowerContent = content.toLowerCase();
    return updateKeywords.some((keyword) => lowerContent.includes(keyword));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground text-sm font-bold">S</span>
          </div>
          <h1 className="text-xl font-semibold mb-2">Loading Simulation...</h1>
          <p className="text-sm text-muted-foreground">
            ID: {resolvedParams.simulation_id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground page-transition"
      data-page-content
    >
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">
                  S
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">Simulation Builder</h1>
                <p className="text-sm text-muted-foreground">
                  ID: {resolvedParams.simulation_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleForkSimulation}
                disabled={isForking}
                className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 hover:shadow-lg transition-all duration-200 ease-in-out disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                <GitFork className="w-4 h-4" />
                {isForking ? "Forking..." : "Fork"}
              </Button>
              {simulationObject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setShowSimulationDetails(!showSimulationDetails)
                  }
                  className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200 ease-in-out"
                >
                  {showSimulationDetails ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {showSimulationDetails ? "Hide" : "Show"} Details
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                AI-Powered Simulation Design
                {isUpdatingState && (
                  <span className="ml-2 text-primary">• Updating...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Chat Interface - Left Side */}
        <div
          className={`flex flex-col ${simulationObject ? "w-2/3" : "w-full"} border-r border-border`}
        >
          <Conversation className="flex-1">
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState
                  title="Start building your simulation"
                  description="Describe what kind of simulation you'd like to create and I'll help you design it."
                  icon={
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl">🎮</span>
                    </div>
                  }
                />
              ) : (
                messages.map((message) => (
                  <Message
                    from={message.fromRole}
                    key={message.key}
                    className={`flex flex-col gap-2 ${
                      message.fromRole === "assistant"
                        ? "items-start"
                        : "items-end"
                    }`}
                  >
                    <MessageAvatar name={message.name} src={message.avatar} />
                    <MessageContent>{message.content}</MessageContent>
                    {message.fromRole === "assistant" && (
                      <Actions className="mt-2">
                        {MESSAGE_ACTIONS.map((action) => (
                          <Action key={action.label} label={action.label}>
                            <action.icon className="w-4 h-4" />
                          </Action>
                        ))}
                      </Actions>
                    )}
                  </Message>
                ))
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {/* Input Area */}
          <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-6 py-4">
              <PromptInput onSubmit={handleSubmit}>
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
                <PromptInputTextarea placeholder="Describe your simulation idea or manage holograms (e.g., 'create hologram Captain Nova', 'update hologram wardrobe', 'remove hologram Dr. Smith')..." />
                <PromptInputFooter>
                  <PromptInputTools>
                    <PromptInputActionMenu>
                      <PromptInputActionMenuTrigger />
                      <PromptInputActionMenuContent>
                        <PromptInputActionAddAttachments />
                      </PromptInputActionMenuContent>
                    </PromptInputActionMenu>
                  </PromptInputTools>
                  <PromptInputSubmit status={status} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>
        </div>

        {/* Simulation Details - Right Side */}
        {simulationObject && showSimulationDetails && (
          <div className="w-1/3 bg-gradient-to-b from-background to-muted/20 overflow-y-auto border-l border-border/50">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Simulation Details
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Overview and management
                  </p>
                </div>
              </div>
              <SimulationCard
                simulation={simulationObject}
                aiElements={aiElementsUsage || undefined}
              />

              {/* Simulation Runs Section */}
              {simulationObject && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Simulation Runs
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {runs.length} {runs.length === 1 ? "run" : "runs"}{" "}
                          created
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            `/api/simulations/${resolvedParams.simulation_id}/runs`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                            },
                          );
                          if (response.ok) {
                            const { runId } = await response.json();
                            window.location.href = `/simulations/${resolvedParams.simulation_id}/runs/${runId}`;
                          }
                        } catch (error) {
                          console.error("Error creating run:", error);
                        }
                      }}
                      size="sm"
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Play className="w-4 h-4" />
                      Start New Run
                    </Button>
                  </div>

                  {isLoadingRuns ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Loading runs...
                      </div>
                    </div>
                  ) : runs.length > 0 ? (
                    <div className="space-y-4">
                      {runs.map((run) => (
                        <Card
                          key={run.id}
                          className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-border/50 hover:border-primary/20 group"
                        >
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                      Run #{run.id.slice(-6)}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={
                                          run.status === "completed"
                                            ? "default"
                                            : run.status === "active"
                                              ? "secondary"
                                              : "outline"
                                        }
                                        className={`text-xs ${
                                          run.status === "completed"
                                            ? "bg-green-100 text-green-700 border-green-200"
                                            : run.status === "active"
                                              ? "bg-blue-100 text-blue-700 border-blue-200"
                                              : "bg-gray-100 text-gray-700 border-gray-200"
                                        }`}
                                      >
                                        {run.status === "completed" ? (
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                        ) : (
                                          <Clock className="w-3 h-3 mr-1" />
                                        )}
                                        {run.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="ml-11">
                                  <p className="text-sm text-muted-foreground">
                                    Turn {run.currentTurn + 1} • Started{" "}
                                    {new Date(
                                      run.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Last updated:{" "}
                                    {new Date(
                                      run.updatedAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  window.location.href = `/simulations/${resolvedParams.simulation_id}/runs/${run.id}`;
                                }}
                                className="ml-4 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                              >
                                {run.status === "completed"
                                  ? "View"
                                  : "Continue"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-6 bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed border-border/50 rounded-xl hover:border-primary/20 transition-colors duration-200">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">
                        Ready to Begin?
                      </h4>
                      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                        Start your first simulation run and experience the
                        interactive story you&apos;ve created.
                      </p>
                      <Button
                        onClick={async () => {
                          try {
                            const response = await fetch(
                              `/api/simulations/${resolvedParams.simulation_id}/runs`,
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                              },
                            );
                            if (response.ok) {
                              const { runId } = await response.json();
                              window.location.href = `/simulations/${resolvedParams.simulation_id}/runs/${runId}`;
                            }
                          } catch (error) {
                            console.error("Error creating run:", error);
                          }
                        }}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <Play className="w-4 h-4" />
                        Start Your First Run
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State for Right Side */}
        {simulationObject && !showSimulationDetails && (
          <div className="w-1/3 bg-gradient-to-b from-background to-muted/10 border-l border-border/50 flex items-center justify-center">
            <div className="text-center text-muted-foreground px-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-primary/60" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Simulation Ready
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                Your simulation is complete and ready to run
              </p>
              <p className="text-xs text-muted-foreground">
                Click &quot;Show Details&quot; to view and manage
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
