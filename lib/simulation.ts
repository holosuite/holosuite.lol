import { generateUUID } from "./uuid";
import { RefreshCcwIcon, ThumbsUpIcon, ThumbsDownIcon } from "lucide-react";

export interface SimulationMessage {
  key: string;
  from: "user" | "assistant";
  content: string;
  name: string;
  avatar: string;
}

export const SIMULATION_CONSTANTS = {
  ASSISTANT_NAME: "Simulation Builder",
  ASSISTANT_AVATAR: "https://github.com/openai.png",
  USER_NAME: "You",
  USER_AVATAR: "https://github.com/vercel.png",
  WELCOME_MESSAGE:
    "Welcome to your simulation builder! I'm your AI simulation designer. I can help you create immersive experiences tailored to your needs. What kind of simulation would you like to build today?",
} as const;

export const MESSAGE_ACTIONS = [
  {
    label: "Regenerate",
    icon: RefreshCcwIcon,
  },
  {
    label: "Good response",
    icon: ThumbsUpIcon,
  },
  {
    label: "Bad response",
    icon: ThumbsDownIcon,
  },
] as const;

export function createInitialMessages(): SimulationMessage[] {
  return [
    {
      key: generateUUID(),
      from: "assistant",
      content: SIMULATION_CONSTANTS.WELCOME_MESSAGE,
      name: SIMULATION_CONSTANTS.ASSISTANT_NAME,
      avatar: SIMULATION_CONSTANTS.ASSISTANT_AVATAR,
    },
  ];
}

export function createUserMessage(content: string): SimulationMessage {
  return {
    key: generateUUID(),
    from: "user",
    content,
    name: SIMULATION_CONSTANTS.USER_NAME,
    avatar: SIMULATION_CONSTANTS.USER_AVATAR,
  };
}

export function createAssistantMessage(content: string): SimulationMessage {
  return {
    key: generateUUID(),
    from: "assistant",
    content,
    name: SIMULATION_CONSTANTS.ASSISTANT_NAME,
    avatar: SIMULATION_CONSTANTS.ASSISTANT_AVATAR,
  };
}

export function generateSimulationResponse(prompt: string): string {
  return `I understand you want to work on: "${prompt}". I'll analyze your request and create a comprehensive simulation design, making intelligent assumptions to fill in any gaps. I'll design interactive environments, character behaviors, dynamic scenarios, and technical implementation details. You can always iterate and refine any aspects I've imagined - I'm here to build upon your vision with creative and practical solutions.`;
}
