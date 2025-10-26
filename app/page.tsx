import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { PromptSubmission } from "@/components/prompt-submission";
import { LightRays } from "@/components/ui/light-rays";
import { StorySimulationsList } from "@/components/story-simulations-list";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-background text-foreground page-transition"
      data-page-content
    >
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
              href="#faqs"
              className="text-foreground hover:text-primary transition"
            >
              FAQs
            </a>
            <a
              href="#the-future"
              className="text-foreground hover:text-primary transition"
            >
              The Future
            </a>
          </div>
          <Button className="bg-primary hover:bg-primary/90 hover:scale-105 hover:shadow-lg text-primary-foreground font-medium rounded-full px-6 transition-all duration-200 ease-in-out">
            <Plus className="w-4 h-4 mr-2" />
            Book a call
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <LightRays
          count={6}
          color="rgba(255, 255, 255, 0.4)"
          blur={25}
          speed={6}
          length="50vh"
        />
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                  Immersive Simulation Experiences
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Cutting-edge simulation and entertainment services that
                  transport you to new worlds and experiences.
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 hover:scale-105 hover:shadow-lg text-primary-foreground font-medium rounded-full px-8 py-6 text-lg transition-all duration-200 ease-in-out">
                <Plus className="w-5 h-5 mr-2" />
                Book a call
              </Button>

              {/* Video Mockup */}
              <div className="mt-12">
                <div className="relative bg-card/10 rounded-3xl p-6 backdrop-blur-sm border border-border">
                  <div className="aspect-video bg-gradient-to-br from-card/20 to-transparent rounded-2xl overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-card/30 to-card/10 flex items-center justify-center">
                      <div className="text-muted-foreground text-lg font-medium">
                        Simulation Preview
                      </div>
                    </div>
                  </div>
                </div>

                {/* LinkedIn Notification Cards */}
                <div className="mt-6 space-y-3">
                  <div className="bg-card rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary"></div>
                      <div className="flex-1">
                        <p className="text-card-foreground font-medium">
                          Eric Lay
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Founder & CEO of Buildflow
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">...</div>
                    </div>
                  </div>
                  <div className="bg-card rounded-2xl p-4 shadow-lg ml-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/80"></div>
                      <div className="flex-1">
                        <p className="text-card-foreground font-medium">
                          David Campbell
                        </p>
                        <p className="text-sm text-muted-foreground">
                          CFO of Compose, scheduled a meeting
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">1d</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Additional Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="relative space-y-6">
                  {/* Circular pattern or dots */}
                  <div className="grid grid-cols-12 gap-2">
                    {Array.from({ length: 144 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-muted"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prompt Submission Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto">
          <PromptSubmission />
        </div>
      </section>

      {/* Logo Marquee */}
      <section className="py-12 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between gap-12 overflow-hidden">
            <div className="h-8 w-20 bg-secondary rounded flex items-center justify-center opacity-60 grayscale">
              <span className="text-xs text-muted-foreground">Mapped</span>
            </div>
            <div className="h-8 w-20 bg-secondary rounded flex items-center justify-center opacity-60 grayscale">
              <span className="text-xs text-muted-foreground">HubSpot</span>
            </div>
            <div className="h-8 w-20 bg-secondary rounded flex items-center justify-center opacity-60 grayscale">
              <span className="text-xs text-muted-foreground">LinkedIn</span>
            </div>
            <div className="h-8 w-20 bg-secondary rounded flex items-center justify-center opacity-60 grayscale">
              <span className="text-xs text-muted-foreground">a16z</span>
            </div>
            <div className="h-8 w-20 bg-secondary rounded flex items-center justify-center opacity-60 grayscale">
              <span className="text-xs text-muted-foreground">Juniper</span>
            </div>
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
                      <div className="text-2xl mb-2">🎨</div>
                      <div>Simulation Designer</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm font-mono">
                  [ 001 ]
                </p>
                <h3 className="text-3xl font-bold text-foreground">
                  Meet your simulation designer
                </h3>
                <p className="text-muted-foreground text-lg">
                  We pair you with a world-class simulation expert who designs
                  immersive experiences tailored to your entertainment needs and
                  objectives.
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
                      <div>AI Simulation</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm font-mono">
                  [ 002 ]
                </p>
                <h3 className="text-3xl font-bold text-foreground">
                  Advanced AI simulation
                </h3>
                <p className="text-muted-foreground text-lg">
                  Our AI systems create dynamic, responsive environments that
                  adapt to user interactions in real-time.
                </p>
              </div>
            </div>

            {/* Step 003 */}
            <div className="space-y-6">
              <div className="bg-card/50 rounded-3xl p-8 border border-border backdrop-blur-sm">
                <div className="aspect-square bg-gradient-to-br from-card/10 to-transparent rounded-2xl mb-6 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-card/30 to-card/10 flex items-center justify-center">
                    <div className="text-muted-foreground text-lg font-medium text-center">
                      <div className="text-2xl mb-2">✨</div>
                      <div>Human Creativity</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm font-mono">
                  [ 003 ]
                </p>
                <h3 className="text-3xl font-bold text-foreground">
                  Human creativity
                </h3>
                <p className="text-muted-foreground text-lg">
                  Our designers craft compelling narratives and experiences that
                  blend cutting-edge technology with human storytelling.
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
                  Immersive experiences
                </h3>
                <p className="text-muted-foreground text-lg">
                  Experience fully immersive simulations that transport you to
                  new worlds and create unforgettable entertainment moments.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button className="bg-accent hover:bg-accent/90 hover:scale-105 hover:shadow-lg text-accent-foreground font-medium rounded-full px-8 py-6 text-lg transition-all duration-200 ease-in-out">
              <Plus className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-6 bg-card">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-6">
            <div className="bg-card/50 rounded-3xl p-8 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-accent text-sm font-mono">
                  [ PIPELINE GENERATED ]
                </p>
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-5xl font-bold text-foreground">$50M+</h3>
            </div>

            <div className="bg-card/50 rounded-3xl p-8 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-accent text-sm font-mono">
                  [ TOTAL IMPRESSIONS ]
                </p>
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-5xl font-bold text-foreground">9.3M+</h3>
            </div>

            <div className="bg-card/50 rounded-3xl p-8 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-accent text-sm font-mono">
                  [ MEETINGS BOOKED ]
                </p>
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-5xl font-bold text-foreground">750+</h3>
            </div>

            <div className="bg-card/50 rounded-3xl p-8 border border-border">
              <div className="flex gap-1 h-32 items-end">
                {[
                  40, 35, 55, 45, 60, 38, 48, 52, 58, 42, 65, 50, 72, 48, 58,
                  62, 55, 68, 52, 75, 60, 70, 58, 78, 65, 82, 70, 88, 75, 85,
                ].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-accent rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Simulations Section */}
      <section className="py-32 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-muted-foreground text-sm font-mono mb-4">
              [ INTERACTIVE STORIES ]
            </p>
            <h2 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Choose Your Adventure
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Immerse yourself in interactive story simulations where you choose
              your character, make decisions that shape the narrative, and
              generate visual highlights of your journey.
            </p>
          </div>

          <StorySimulationsList />

          <div className="text-center mt-12">
            <Button className="bg-primary hover:bg-primary/90 hover:scale-105 hover:shadow-lg text-primary-foreground font-medium rounded-full px-8 py-6 text-lg transition-all duration-200 ease-in-out">
              <BookOpen className="w-5 h-5 mr-2" />
              Explore All Stories
            </Button>
          </div>
        </div>
      </section>

      {/* Message Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-muted-foreground text-sm font-mono mb-4">
              [ BUILT TO CONVERT ]
            </p>
            <h2 className="text-5xl lg:text-6xl font-bold text-foreground mb-12">
              The message to everyone is a message to no one.
            </h2>
          </div>

          <div className="bg-card/50 rounded-3xl p-12 border border-border">
            <h3 className="text-3xl font-bold text-foreground mb-8">
              Traditional outbound is dead...
            </h3>
            <p className="text-5xl font-bold text-accent mb-8">
              Content is king.
            </p>
            <Button className="bg-accent hover:bg-accent/90 hover:scale-105 hover:shadow-lg text-accent-foreground font-medium rounded-full px-8 py-6 text-lg transition-all duration-200 ease-in-out">
              <Plus className="w-5 h-5 mr-2" />
              Get started
            </Button>
          </div>

          <div className="mt-12 bg-secondary rounded-3xl p-12 border border-border">
            <p className="text-accent text-sm font-mono mb-4">[ TOP SECRET ]</p>
            <h3 className="text-3xl font-bold text-secondary-foreground mb-6">
              Coming soon..
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
              We&apos;re building a fully autonomous AI marketer embedded inside
              your company. If you run marketing at a 200+ person company, we
              have limited spots for design partners.
            </p>
            <Button className="bg-accent hover:bg-accent/90 hover:scale-105 hover:shadow-lg text-accent-foreground font-medium rounded-full px-8 py-6 text-lg transition-all duration-200 ease-in-out">
              <Plus className="w-5 h-5 mr-2" />
              Inquire within
            </Button>
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

            <div className="flex items-center gap-6">
              <a
                href="https://linkedin.com"
                className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition"
              >
                <svg
                  className="w-5 h-5 text-foreground"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition"
              >
                <svg
                  className="w-5 h-5 text-foreground"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition"
              >
                <svg
                  className="w-5 h-5 text-foreground"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            <Button className="bg-accent hover:bg-accent/90 hover:scale-105 hover:shadow-lg text-accent-foreground font-medium rounded-full px-8 py-6 text-lg transition-all duration-200 ease-in-out">
              <Plus className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
