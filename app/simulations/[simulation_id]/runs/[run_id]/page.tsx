"use client";

import { useState, useCallback, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Download,
  Image as ImageIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Home,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { EditableTitle } from "@/components/editable-title";

interface Turn {
  id: string;
  turnNumber: number;
  userPrompt: string;
  aiResponse: string;
  imageUrl?: string;
  imagePrompt?: string;
  suggestedOptions?: string[];
  createdAt: string;
}

interface RunData {
  id: string;
  status: string;
  currentTurn: number;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

interface Simulation {
  id: string;
  title: string;
  description: string;
  genre: string;
  setting: string;
  estimatedTurns: number;
}

// Hologram interface removed - no longer needed

interface VideoData {
  videoId: string;
  status: string;
  videoUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export default function RunDetailPage({
  params,
}: {
  params: Promise<{ simulation_id: string; run_id: string }>;
}) {
  const resolvedParams = use(params);
  const [runData, setRunData] = useState<RunData | null>(null);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingTurn, setIsSubmittingTurn] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Check video status
  const checkVideoStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/simulations/${resolvedParams.simulation_id}/runs/${resolvedParams.run_id}/video`,
      );

      if (response.ok) {
        const data = await response.json();
        setVideoData({
          videoId: data.videoId,
          status: data.status,
          videoUrl: data.videoUrl,
          createdAt: data.createdAt,
          completedAt: data.completedAt,
        });
      }
    } catch (error) {
      console.error("Error checking video status:", error);
    }
  }, [resolvedParams.simulation_id, resolvedParams.run_id]);

  // Load run data
  useEffect(() => {
    const loadRunData = async () => {
      try {
        const response = await fetch(
          `/api/simulations/${resolvedParams.simulation_id}/runs/${resolvedParams.run_id}`,
        );

        if (response.ok) {
          const data = await response.json();
          setRunData(data.run);
          setSimulation(data.simulation);
          setTurns(data.turns);

          // Check for existing video
          if (data.run.status === "completed") {
            await checkVideoStatus();
          }
        } else {
          console.error("Failed to load run data");
        }
      } catch (error) {
        console.error("Error loading run data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRunData();
  }, [resolvedParams.simulation_id, resolvedParams.run_id, checkVideoStatus]);

  // Update run title
  const handleTitleUpdate = async (newTitle: string) => {
    try {
      const response = await fetch(
        `/api/simulations/${resolvedParams.simulation_id}/runs/${resolvedParams.run_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTitle }),
        },
      );

      if (response.ok) {
        // Update local state
        setRunData((prev) => (prev ? { ...prev, title: newTitle } : null));
      } else {
        throw new Error("Failed to update title");
      }
    } catch (error) {
      console.error("Error updating title:", error);
      throw error; // Re-throw to let EditableTitle handle the error
    }
  };

  // Submit turn
  const handleSubmitTurn = useCallback(
    async (actionText?: string) => {
      const prompt = actionText || selectedOption || customPrompt.trim();
      if (isSubmittingTurn || !prompt) return;

      setIsSubmittingTurn(true);
      try {
        const response = await fetch(
          `/api/simulations/${resolvedParams.simulation_id}/runs/${resolvedParams.run_id}/turns`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          setTurns((prev) => [...prev, data.turn]);
          setRunData((prev) =>
            prev ? { ...prev, currentTurn: data.turn.turnNumber } : null,
          );
          setCustomPrompt("");
          setSelectedOption(null);
        } else {
          console.error("Failed to submit turn");
        }
      } catch (error) {
        console.error("Error submitting turn:", error);
      } finally {
        setIsSubmittingTurn(false);
      }
    },
    [
      resolvedParams.simulation_id,
      resolvedParams.run_id,
      customPrompt,
      selectedOption,
      isSubmittingTurn,
    ],
  );

  // Generate video
  const handleGenerateVideo = useCallback(async () => {
    if (isGeneratingVideo || !runData) return;

    setIsGeneratingVideo(true);
    try {
      const response = await fetch(
        `/api/simulations/${resolvedParams.simulation_id}/runs/${resolvedParams.run_id}/video`,
        {
          method: "POST",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setVideoData({
          videoId: data.videoId,
          status: "generating",
          createdAt: new Date().toISOString(),
        });

        // Start polling for completion
        // Video status will be checked automatically
      } else {
        console.error("Failed to start video generation");
      }
    } catch (error) {
      console.error("Error starting video generation:", error);
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [
    resolvedParams.simulation_id,
    resolvedParams.run_id,
    isGeneratingVideo,
    runData,
  ]);

  // Poll video status
  const pollVideoStatus = useCallback(async () => {
    if (!videoData || videoData.status !== "generating") return;

    try {
      const response = await fetch(
        `/api/simulations/${resolvedParams.simulation_id}/runs/${resolvedParams.run_id}/video`,
      );

      if (response.ok) {
        const data = await response.json();
        setVideoData((prev) => ({
          ...prev!,
          status: data.status,
          videoUrl: data.videoUrl,
          completedAt: data.completedAt,
        }));

        // Continue polling if still generating
        if (data.status === "generating") {
          setTimeout(() => {
            pollVideoStatus();
          }, 5000);
        }
      }
    } catch (error) {
      console.error("Error polling video status:", error);
    }
  }, [resolvedParams.simulation_id, resolvedParams.run_id, videoData]);

  // Complete story
  const handleCompleteStory = useCallback(async () => {
    if (!runData) return;

    try {
      const response = await fetch(
        `/api/simulations/${resolvedParams.simulation_id}/runs/${resolvedParams.run_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "completed" }),
        },
      );

      if (response.ok) {
        setRunData((prev) => (prev ? { ...prev, status: "completed" } : null));
      }
    } catch (error) {
      console.error("Error completing story:", error);
    }
  }, [resolvedParams.simulation_id, resolvedParams.run_id, runData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Loading Story Run...</h1>
          <p className="text-sm text-muted-foreground">
            Run ID: {resolvedParams.run_id}
          </p>
        </div>
      </div>
    );
  }

  if (!runData || !simulation) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
          <h1 className="text-xl font-semibold mb-2">Story Run Not Found</h1>
          <p className="text-sm text-muted-foreground">
            The requested story run could not be found.
          </p>
        </div>
      </div>
    );
  }

  const progressPercentage =
    (runData.currentTurn / simulation.estimatedTurns) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <div>
                <EditableTitle
                  title={runData.title || simulation.title}
                  onSave={handleTitleUpdate}
                  placeholder="Enter conversation name..."
                />
                <p className="text-muted-foreground">
                  Detective Mystery • Turn {runData.currentTurn + 1} of{" "}
                  {simulation.estimatedTurns}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  runData.status === "completed" ? "default" : "secondary"
                }
              >
                {runData.status === "completed" ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {runData.status}
              </Badge>
              {runData.status === "active" && (
                <Button onClick={handleCompleteStory} variant="outline">
                  Complete Story
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Story Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Story Turns */}
            {turns.map((turn) => (
              <Card key={turn.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Turn {turn.turnNumber}
                    </CardTitle>
                    <Badge variant="outline">
                      {new Date(turn.createdAt).toLocaleTimeString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* User Action */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Your Action:
                    </p>
                    <p className="text-sm">&ldquo;{turn.userPrompt}&rdquo;</p>
                  </div>

                  {/* AI Response */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Story Continues:
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {turn.aiResponse}
                    </p>
                  </div>

                  {/* Generated Image */}
                  {turn.imageUrl && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Scene Image
                      </p>
                      <div className="relative rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={turn.imageUrl}
                          alt={`Scene from turn ${turn.turnNumber}`}
                          width={400}
                          height={256}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Suggested Options */}
                  {turn.suggestedOptions &&
                    turn.suggestedOptions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Next Actions:
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {turn.suggestedOptions.map((option, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-left justify-start h-auto p-3"
                              onClick={() => {
                                setSelectedOption(option);
                                setCustomPrompt("");
                                // Auto-submit the selected option
                                handleSubmitTurn(option);
                              }}
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            ))}

            {/* Input Area */}
            {runData.status === "active" && (
              <Card>
                <CardHeader>
                  <CardTitle>What do you do next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Custom Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Or describe your own action:
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => {
                        setCustomPrompt(e.target.value);
                        setSelectedOption(null);
                      }}
                      placeholder="Describe what you want to do..."
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={() => handleSubmitTurn()}
                    disabled={
                      isSubmittingTurn ||
                      (!customPrompt.trim() && !selectedOption)
                    }
                    className="w-full"
                  >
                    {isSubmittingTurn ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Video Section */}
            {runData.status === "completed" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Story Highlights Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!videoData ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Generate a highlight video of your story adventure
                      </p>
                      <Button
                        onClick={handleGenerateVideo}
                        disabled={isGeneratingVideo}
                      >
                        {isGeneratingVideo ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Generate Video
                          </>
                        )}
                      </Button>
                    </div>
                  ) : videoData.status === "generating" ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Generating your story highlights video...
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        This may take a few minutes
                      </p>
                    </div>
                  ) : videoData.status === "completed" && videoData.videoUrl ? (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden bg-muted">
                        <video
                          src={videoData.videoUrl}
                          controls
                          className="w-full h-64 object-cover"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <p>
                            Generated on{" "}
                            {new Date(videoData.completedAt!).toLocaleString()}
                          </p>
                          {videoData.videoUrl?.includes(
                            "blob.vercel-storage.com",
                          ) && (
                            <p className="text-green-600 text-xs mt-1">
                              ✓ Stored permanently - available anytime
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (videoData?.videoUrl) {
                              window.open(
                                `/api/videos/${videoData.videoId}/download`,
                                "_blank",
                              );
                            }
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
                      <p className="text-muted-foreground">
                        Video generation failed. Please try again.
                      </p>
                      <Button onClick={handleGenerateVideo} className="mt-4">
                        Try Again
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Story Info */}
            <Card>
              <CardHeader>
                <CardTitle>Story Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Genre:
                  </p>
                  <p className="text-sm">{simulation.genre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Setting:
                  </p>
                  <p className="text-sm">{simulation.setting}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Progress:
                  </p>
                  <p className="text-sm">
                    {runData.currentTurn + 1} / {simulation.estimatedTurns}{" "}
                    turns
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
