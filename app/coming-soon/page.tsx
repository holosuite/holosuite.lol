import Link from "next/link";

export const metadata = {
  title: "Coming Soon | Holosuite",
  description: "This feature is coming soon. Check back later.",
};

// TODO: Add a link to waitlist page.

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
          Coming soon
        </h1>
        <p className="text-lg text-muted-foreground">
          We&apos;re building something exciting. The simulation experience will
          be available here soon.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full px-6 py-3 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
