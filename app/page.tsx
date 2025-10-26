import { PromptSubmission } from "@/components/prompt-submission";

export default function Home() {
  const models = [
    "Claude 4.5",
    "GPT-5",
    "Gemini 2.5",
    "Grok 4",
  ];

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
            <a
              href="/simulations"
              className="text-foreground hover:text-primary transition"
            >
              Simulations
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section with Prompt */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
              Create Immersive AI Simulations
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by Google Gemini AI. Generate interactive simulations, AI characters, and story-driven experiences through natural language.
            </p>
          </div>

          {/* Simulation Generation Prompt */}
          <div className="mb-20">
            <PromptSubmission />
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
              <div key={key} className="px-6 py-3 bg-card rounded-full border border-border">
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
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium mb-4">
              How it Works
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Step 001 */}
            <div className="space-y-6">
              <div className="bg-card/50 rounded-3xl p-8 border border-border backdrop-blur-sm">
                <div className="aspect-square bg-gradient-to-br from-card/10 to-transparent rounded-2xl mb-6 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-card/30 to-card/10 flex items-center justify-center">
                    <div className="text-muted-foreground text-lg font-medium text-center">
                      <div className="text-2xl mb-2">💭</div>
                      <div>Natural Language Input</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm font-mono">
                  [ 001 ]
                </p>
                <h3 className="text-3xl font-bold text-foreground">
                  Describe your vision
                </h3>
                <p className="text-muted-foreground text-lg">
                  Simply describe the simulation you want to create in natural language. Our AI understands your intent and requirements.
                </p>
              </div>
            </div>

            {/* Step 002 */}
            <div className="space-y-6">
              <div className="bg-card/50 rounded-3xl p-8 border border-border backdrop-blur-sm">
                <div className="aspect-square bg-gradient-to-br from-card/10 to-transparent rounded-2xl mb-6 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-card/30 to-card/10 flex items-center justify-center">
                    <div className="text-muted-foreground text-lg font-medium text-center">
                      <div className="text-2xl mb-2">🤖</div>
                      <div>AI Generation</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm font-mono">
                  [ 002 ]
                </p>
                <h3 className="text-3xl font-bold text-foreground">
                  AI builds your simulation
                </h3>
                <p className="text-muted-foreground text-lg">
                  Google Gemini AI generates comprehensive simulation specifications, character holograms, and interactive story elements.
                </p>
              </div>
            </div>

            {/* Step 003 */}
            <div className="space-y-6">
              <div className="bg-card/50 rounded-3xl p-8 border border-border backdrop-blur-sm">
                <div className="aspect-square bg-gradient-to-br from-card/10 to-transparent rounded-2xl mb-6 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-card/30 to-card/10 flex items-center justify-center">
                    <div className="text-muted-foreground text-lg font-medium text-center">
                      <div className="text-2xl mb-2">🎭</div>
                      <div>Dynamic Characters</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm font-mono">
                  [ 003 ]
                </p>
                <h3 className="text-3xl font-bold text-foreground">
                  Interact with AI characters
                </h3>
                <p className="text-muted-foreground text-lg">
                  AI-generated holograms bring your simulation to life with responsive, contextual interactions and unique personalities.
                </p>
              </div>
            </div>

            {/* Step 004 */}
            <div className="space-y-6">
              <div className="bg-card/50 rounded-3xl p-8 border border-border backdrop-blur-sm">
                <div className="aspect-square bg-gradient-to-br from-card/10 to-transparent rounded-2xl mb-6 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-card/30 to-card/10 flex items-center justify-center">
                    <div className="text-muted-foreground text-lg font-medium text-center">
                      <div className="text-2xl mb-2">🌍</div>
                      <div>Immersive Experience</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm font-mono">
                  [ 004 ]
                </p>
                <h3 className="text-3xl font-bold text-foreground">
                  Experience your world
                </h3>
                <p className="text-muted-foreground text-lg">
                  Dive into fully immersive simulations with turn-based storytelling, dynamic responses, and evolving narratives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Message Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl lg:text-6xl font-bold text-foreground mb-8">
              Built for creators and storytellers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're creating interactive fiction, educational simulations, or immersive entertainment experiences, Holosuite brings your ideas to life.
            </p>
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
