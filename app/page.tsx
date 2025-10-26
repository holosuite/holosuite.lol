import { PromptSubmission } from "@/components/prompt-submission";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create AI-Powered Interactive Simulations | Holosuite",
  description:
    "Transform your ideas into immersive AI-powered simulations. Create interactive stories, generate custom images with Imagen 4.0, and produce cinematic videos with Veo 3.1. Start building your simulation today.",
  keywords: [
    "AI simulation creator",
    "interactive story generator",
    "AI-powered entertainment",
    "simulation builder",
    "dynamic storytelling",
    "AI content creation",
    "interactive experiences",
    "story simulation platform",
  ],
  openGraph: {
    title: "Create AI-Powered Interactive Simulations | Holosuite",
    description:
      "Transform your ideas into immersive AI-powered simulations. Create interactive stories, generate custom images, and produce cinematic videos.",
    url: "/",
    images: [
      {
        url: "/og-home.png",
        width: 1200,
        height: 630,
        alt: "Holosuite - Create AI-Powered Interactive Simulations",
      },
    ],
  },
  twitter: {
    title: "Create AI-Powered Interactive Simulations | Holosuite",
    description:
      "Transform your ideas into immersive AI-powered simulations. Create interactive stories, generate custom images, and produce cinematic videos.",
  },
};

export default function Home() {
  const models = ["Claude 4.5", "GPT-5", "Gemini 2.5", "Grok 4"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-background/90 border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-0">
            <div className="text-2xl font-bold text-foreground tracking-tight">
              holosuite
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary -ml-0.5 mb-3"></div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-foreground hover:text-primary transition"
            >
              How It Works
            </a>
            <Link
              href="/simulations"
              className="text-foreground hover:text-primary transition"
            >
              Simulations
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Prompt */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Simulation Generation Prompt */}
          <div className="mb-20">
            <PromptSubmission />
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-6 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <p className="text-sm font-mono text-primary tracking-wider">
              THE NEXT GENERATION OF ENTERTAINMENT
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              The software behind the Holodeck
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Where are the all-in-one, commercialized holodeck-like
              experiences? The software problem is complex, but with
              cutting-edge generative AI, we&apos;re pushing boundaries.
              Holosuite Entertainment is building the infrastructure for
              developing and running holodeck programs—
              <span className="text-foreground font-semibold">
                Holodeck-as-a-Service
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      {/* LLM Models Marquee */}
      <section className="py-12 border-y border-border">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Powered by leading AI models
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {models.map((model, key) => (
              <div
                key={key}
                className="px-6 py-3 bg-card rounded-full border border-border"
              >
                <span className="text-sm font-medium text-foreground">
                  {model}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-32 px-6 bg-gradient-to-b from-background to-card"
      >
        <div className="container mx-auto">
          <div className="mb-20 flex justify-center">
            <div className="inline-block">
              <h2 className="text-5xl font-bold text-foreground mb-2">
                How it works
              </h2>
              <div className="h-1 bg-primary rounded-full"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Step 001 */}
            <div className="space-y-4">
              <div className="bg-card/50 rounded-2xl p-6 border border-border backdrop-blur-sm">
                <div className="aspect-video bg-gradient-to-br from-card/10 to-transparent rounded-xl overflow-hidden flex items-center justify-center">
                  <div className="text-muted-foreground text-base font-medium text-center">
                    <div className="text-4xl mb-2">💭</div>
                    <div>Natural Language Input</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-mono tracking-wider">
                  STEP 001
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  Describe your vision
                </h3>
                <p className="text-muted-foreground text-base">
                  Simply describe the simulation you want to create in natural
                  language. Our AI understands your intent and requirements.
                </p>
              </div>
            </div>

            {/* Step 002 */}
            <div className="space-y-4">
              <div className="bg-card/50 rounded-2xl p-6 border border-border backdrop-blur-sm">
                <div className="aspect-video bg-gradient-to-br from-card/10 to-transparent rounded-xl overflow-hidden flex items-center justify-center">
                  <div className="text-muted-foreground text-base font-medium text-center">
                    <div className="text-4xl mb-2">🤖</div>
                    <div>AI Generation</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-mono tracking-wider">
                  STEP 002
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  AI builds your simulation
                </h3>
                <p className="text-muted-foreground text-base">
                  Google Gemini AI generates comprehensive simulation
                  specifications, character holograms, and interactive story
                  elements.
                </p>
              </div>
            </div>

            {/* Step 003 */}
            <div className="space-y-4">
              <div className="bg-card/50 rounded-2xl p-6 border border-border backdrop-blur-sm">
                <div className="aspect-video bg-gradient-to-br from-card/10 to-transparent rounded-xl overflow-hidden flex items-center justify-center">
                  <div className="text-muted-foreground text-base font-medium text-center">
                    <div className="text-4xl mb-2">🎭</div>
                    <div>Dynamic Characters</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-mono tracking-wider">
                  STEP 003
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  Interact with AI characters
                </h3>
                <p className="text-muted-foreground text-base">
                  AI-generated holograms bring your simulation to life with
                  responsive, contextual interactions and unique personalities.
                </p>
              </div>
            </div>

            {/* Step 004 */}
            <div className="space-y-4">
              <div className="bg-card/50 rounded-2xl p-6 border border-border backdrop-blur-sm">
                <div className="aspect-video bg-gradient-to-br from-card/10 to-transparent rounded-xl overflow-hidden flex items-center justify-center">
                  <div className="text-muted-foreground text-base font-medium text-center">
                    <div className="text-4xl mb-2">🌍</div>
                    <div>Immersive Experience</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-mono tracking-wider">
                  STEP 004
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  Experience your world
                </h3>
                <p className="text-muted-foreground text-base">
                  Dive into fully immersive simulations with turn-based
                  storytelling, dynamic responses, and evolving narratives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Story Journey */}
      <section className="py-32 px-6 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 flex justify-center">
            <div className="inline-block">
              <h2 className="text-5xl font-bold text-foreground mb-2">
                Your interactive journey
              </h2>
              <div className="h-1 bg-primary rounded-full"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Choose Your Story */}
            <div className="bg-background/50 rounded-2xl p-8 border border-border space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Choose your story
              </h3>
              <p className="text-muted-foreground">
                Select from our curated library of interactive holographic
                programs or create your own custom simulation from scratch.
              </p>
            </div>

            {/* Live the Experience */}
            <div className="bg-background/50 rounded-2xl p-8 border border-border space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Live the experience
              </h3>
              <p className="text-muted-foreground">
                Step into your character&apos;s shoes. Each turn, choose from
                AI-suggested actions or craft your own path through the
                narrative.
              </p>
            </div>

            {/* Keep the Memories */}
            <div className="bg-background/50 rounded-2xl p-8 border border-border space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🎬</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Keep the memories
              </h3>
              <p className="text-muted-foreground">
                Your journey becomes a cinematic keepsake. AI generates a recap
                video from your adventure&apos;s highlights using Veo 3.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm font-mono text-primary tracking-wider mb-4">
              CORE CAPABILITIES
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Holodeck infrastructure, powered by AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Combining vast databases, intelligent control systems, and
              generative AI to create the next generation of immersive
              entertainment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Vast Simulation Database */}
            <div className="bg-card/50 rounded-2xl p-8 border border-border backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🗄️</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    Vast simulation database
                  </h3>
                  <p className="text-muted-foreground">
                    Access a Netflix-like library of holographic programs.
                    Project detailed historical events, fictional worlds, and
                    custom scenarios with incredible accuracy.
                  </p>
                </div>
              </div>
            </div>

            {/* Perceptual AI Agents */}
            <div className="bg-card/50 rounded-2xl p-8 border border-border backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">👁️</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    Perceptual AI agents
                  </h3>
                  <p className="text-muted-foreground">
                    Holographic characters with unique personalities maintain
                    immersion, responding naturally without breaking the fourth
                    wall.
                  </p>
                </div>
              </div>
            </div>

            {/* Natural Control Systems */}
            <div className="bg-card/50 rounded-2xl p-8 border border-border backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎙️</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    Natural control systems
                  </h3>
                  <p className="text-muted-foreground">
                    Control programs via voice commands, intuitive interfaces,
                    or custom prompts. &quot;Computer, end program&quot; when
                    you&apos;re ready to exit.
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Content Generation */}
            <div className="bg-card/50 rounded-2xl p-8 border border-border backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">✨</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    Dynamic content generation
                  </h3>
                  <p className="text-muted-foreground">
                    Each story turn generates contextual descriptions and
                    images. AI maintains visual continuity throughout your
                    adventure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Message Section */}
      <section className="py-32 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-mono text-primary tracking-wider">
                THE FUTURE OF ENTERTAINMENT
              </p>
              <h2 className="text-5xl lg:text-6xl font-bold text-foreground">
                Built for creators and storytellers
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Whether you&apos;re creating interactive fiction, educational
                simulations, or immersive entertainment experiences, Holosuite
                provides the infrastructure to bring your vision to life.
              </p>
            </div>
            <div className="pt-8">
              <blockquote className="text-lg italic text-muted-foreground max-w-2xl mx-auto border-l-4 border-primary pl-6">
                &quot;I have no interest in altering someone&apos;s perception
                of who they are and what the world is… other than that they
                might understand that it&apos;s also funny.&quot;
                <footer className="text-sm font-medium text-foreground mt-2">
                  — Brent Spiner
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card/50 rounded-3xl p-12 border border-border backdrop-blur-sm text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                Ready to explore new worlds?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Start creating your own holographic simulations today. The only
                limit is your imagination.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full px-8 py-4 text-lg transition-all hover:scale-105"
              >
                Create Simulation
              </a>
              <Link
                href="/simulations"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium rounded-full px-8 py-4 text-lg transition-all hover:scale-105"
              >
                Browse Library
              </Link>
            </div>
            <div className="pt-8 border-t border-border">
              <p className="text-2xl font-mono text-primary tracking-wide">
                🖖 Live long and prosper
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                &quot;Computer, end program&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-card">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="flex items-center gap-0 text-4xl font-bold text-foreground">
              <span className="tracking-tight">holosuite</span>
              <div className="w-2.5 h-2.5 rounded-full bg-primary -ml-1 mb-6"></div>
            </div>

            <div className="flex items-center gap-8">
              <a
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Terms of Service
              </a>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-4">
              Created with AI at Cal Hacks 12
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
