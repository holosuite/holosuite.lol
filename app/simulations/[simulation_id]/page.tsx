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
import { Eye, EyeOff, Info, GitFork } from "lucide-react";
import { SimulationCard } from "@/components/simulation-card";
import type { Simulation, AIElementsUsage } from "@/lib/simulation-schema";

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
  }, [resolvedParams.simulation_id]);

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
    [
      simulationObject,
      isUpdatingState,
      resolvedParams.simulation_id,
    ],
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
    [resolvedParams.simulation_id, handleUpdateSimulationState, simulationObject],
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
            messages.find((m) => m.from === "user")?.content ||
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
                    from={message.from}
                    key={message.key}
                    className={`flex flex-col gap-2 ${
                      message.from === "assistant" ? "items-start" : "items-end"
                    }`}
                  >
                    <MessageAvatar name={message.name} src={message.avatar} />
                    <MessageContent>{message.content}</MessageContent>
                    {message.from === "assistant" && (
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
                <PromptInputTextarea placeholder="Describe your simulation idea..." />
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
          <div className="w-1/3 bg-muted/30 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Info className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Simulation Details</h2>
              </div>
              <SimulationCard
                simulation={simulationObject}
                aiElements={aiElementsUsage || undefined}
              />
            </div>
          </div>
        )}

        {/* Empty State for Right Side */}
        {simulationObject && !showSimulationDetails && (
          <div className="w-1/3 bg-muted/10 border-l border-border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Simulation details available</p>
              <p className="text-xs">Click &quot;Show Details&quot; to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
