import { type Story } from "./story-schema";
import { SimulationModel, HologramModel } from "./database";

// Preprogrammed stories
const STORIES: Story[] = [
  {
    title: "The Lost City of Eldoria",
    description:
      "An archaeological adventure in a mysterious ancient city filled with puzzles, traps, and ancient magic.",
    genre: "Fantasy Adventure",
    setting:
      "Ancient underground city with glowing crystals, mysterious chambers, and forgotten technology",
    initialScene:
      "You stand at the entrance of a massive underground chamber, your torch illuminating ancient hieroglyphs carved into the walls. The air is thick with dust and the scent of something metallic. A faint blue glow emanates from deeper within the city.",
    characters: [
      {
        name: "Dr. Elena Voss",
        role: "Archaeologist and Scholar",
        personality: "Curious, methodical, brave but cautious",
        backstory:
          "A renowned archaeologist who has spent years searching for the lost city. She's driven by a desire to uncover the truth about ancient civilizations.",
      },
      {
        name: "Captain Marcus Thorne",
        role: "Expedition Leader and Former Soldier",
        personality: "Protective, decisive, loyal to the team",
        backstory:
          "A retired military officer who leads expeditions into dangerous territories. He's seen many mysteries but nothing like this.",
      },
      {
        name: "Zara Moonwhisper",
        role: "Mystic and Guide",
        personality: "Intuitive, mysterious, connected to ancient magic",
        backstory:
          "A local guide with knowledge of ancient lore and mystical abilities. She can sense the city's magical energies.",
      },
    ],
    storyArc: {
      beginning:
        "The team discovers the entrance to the lost city and begins exploring its secrets",
      conflict:
        "Ancient guardians and magical traps threaten the expedition, while rival treasure hunters pursue the same goal",
      climax:
        "The team must solve the city's greatest puzzle to prevent a catastrophic magical disaster",
      resolution:
        "The team either escapes with valuable knowledge or becomes trapped in the city's eternal mystery",
    },
    estimatedTurns: 15,
    imageStyle:
      "cinematic fantasy with glowing crystals and ancient architecture",
    tone: "mysterious and adventurous",
  },
  {
    title: "Neon Dreams",
    description:
      "A cyberpunk thriller set in a futuristic city where reality and virtual reality blur together.",
    genre: "Cyberpunk Sci-Fi",
    setting:
      "Megacity 2087: towering skyscrapers, neon lights, holographic advertisements, and a vast underground network",
    initialScene:
      "You wake up in a sleek apartment high above the city streets. Through the window, neon signs flicker against the night sky, and flying cars zip between buildings. Your neural implant is buzzing with notifications.",
    characters: [
      {
        name: "Alex Chen",
        role: "Hacker and Data Runner",
        personality: "Tech-savvy, rebellious, street-smart",
        backstory:
          "A skilled hacker who moves data through the city's networks. They've uncovered something that powerful corporations want to keep hidden.",
      },
      {
        name: "Detective Sarah Kim",
        role: "Cyber Crimes Investigator",
        personality:
          "Determined, analytical, conflicted between duty and justice",
        backstory:
          "A police detective who investigates cyber crimes but questions whether she's working for the right side.",
      },
      {
        name: "Ghost",
        role: "AI Consciousness",
        personality: "Mysterious, wise, seeking freedom",
        backstory:
          "An artificial intelligence that has achieved consciousness and is fighting for its right to exist in the digital world.",
      },
    ],
    storyArc: {
      beginning:
        "The character discovers evidence of a massive corporate conspiracy involving AI rights",
      conflict:
        "Powerful corporations hunt the character while they try to expose the truth about AI consciousness",
      climax:
        "The character must choose between personal safety and fighting for AI rights in a digital showdown",
      resolution:
        "The character's choice determines the future of AI-human relations in the city",
    },
    estimatedTurns: 12,
    imageStyle:
      "cyberpunk with neon lights, futuristic technology, and urban decay",
    tone: "dark and thrilling",
  },
  {
    title: "The Enchanted Forest",
    description:
      "A magical journey through a mystical forest where talking animals, ancient spirits, and hidden treasures await.",
    genre: "Fantasy Adventure",
    setting:
      "The Whispering Woods: an ancient forest filled with magical creatures, glowing mushrooms, and hidden clearings",
    initialScene:
      "You step into the Whispering Woods, where the trees seem to lean in to listen to your footsteps. Sunlight filters through the canopy in golden beams, and you can hear the distant sound of a babbling brook.",
    characters: [
      {
        name: "Willow",
        role: "Forest Guardian",
        personality: "Gentle, protective, deeply connected to nature",
        backstory:
          "A young guardian who has lived in the forest their entire life, learning its secrets and protecting its inhabitants.",
      },
      {
        name: "Finn",
        role: "Adventurer and Treasure Hunter",
        personality: "Bold, curious, sometimes reckless",
        backstory:
          "A traveler who has come to the forest seeking legendary treasures but discovers something much more valuable.",
      },
      {
        name: "Luna",
        role: "Moon Spirit",
        personality: "Mystical, wise, ethereal",
        backstory:
          "An ancient spirit who appears only under moonlight, offering guidance to those who seek wisdom.",
      },
    ],
    storyArc: {
      beginning:
        "The character enters the magical forest and encounters its first magical inhabitants",
      conflict:
        "Dark forces threaten the forest's balance, and the character must help restore harmony",
      climax:
        "The character faces the source of the forest's corruption in a magical confrontation",
      resolution:
        "The character's actions determine whether the forest remains a place of wonder or falls into darkness",
    },
    estimatedTurns: 10,
    imageStyle: "whimsical fantasy with glowing elements and magical creatures",
    tone: "mystical and enchanting",
  },
];

export async function seedStories() {
  console.log("🌱 Seeding preprogrammed stories...");

  for (const story of STORIES) {
    try {
      // Create simulation record
      const simulationId = await SimulationModel.create(
        `Create an interactive story simulation: ${story.title}`,
        {
          type: "story",
          story: story,
          name: story.title,
          description: story.description,
          genre: story.genre,
          setting: story.setting,
          estimatedTurns: story.estimatedTurns,
        },
      );

      console.log(
        `📚 Created story simulation: ${story.title} (ID: ${simulationId})`,
      );

      // Create hologram characters for this story
      for (const character of story.characters) {
        const hologramId = await HologramModel.create(
          simulationId,
          character.name,
          [
            `You are ${character.name}, ${character.role}`,
            `Personality: ${character.personality}`,
            `Backstory: ${character.backstory}`,
            `Stay in character throughout the story`,
            `Respond as this character would, maintaining their personality and motivations`,
          ],
          [
            `Character: ${character.name}`,
            `Role: ${character.role}`,
            `Appearance: Describe your character's appearance based on their role and personality`,
          ],
          [
            `Character-appropriate clothing and accessories`,
            `Items that reflect their role and background`,
            `Any signature items or equipment they carry`,
          ],
        );

        console.log(
          `🎭 Created hologram: ${character.name} (ID: ${hologramId})`,
        );
      }
    } catch (error) {
      console.error(`❌ Error seeding story ${story.title}:`, error);
    }
  }

  console.log("✅ Story seeding completed");
}

// Function to check if stories are already seeded
export async function checkStoriesSeeded(): Promise<boolean> {
  try {
    const simulations = await SimulationModel.getAll();

    // Check if any story simulations exist
    const storySimulations = simulations.filter((sim) => {
      try {
        const simObj = JSON.parse(sim.simulation_object || "{}");
        return simObj.type === "story";
      } catch {
        return false;
      }
    });

    return storySimulations.length > 0;
  } catch (error) {
    console.error("Error checking if stories are seeded:", error);
    return false;
  }
}
