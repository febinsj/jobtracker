import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Briefcase, Calendar, Share2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background gradient-light">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">Job Tracker</span>
        </div>
        <div className="flex gap-4">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
          Track Your Job Search
          <br />
          Like a Pro
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Organize applications, manage interviews, and land your dream job with our powerful
          Kanban-style job tracker. Complete with analytics, reminders, and collaboration features.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Everything You Need</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Briefcase className="h-10 w-10 text-primary" />}
            title="Kanban Boards"
            description="Visualize your job search pipeline with drag-and-drop cards. Paste full job descriptions and expand them on demand."
          />
          <FeatureCard
            icon={<Calendar className="h-10 w-10 text-chart-2" />}
            title="Smart Reminders"
            description="Never miss a deadline or follow-up. Get notified about upcoming interviews and application deadlines."
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-success" />}
            title="Analytics"
            description="Track your application success rate, interview conversion, and identify patterns in your job search."
          />
          <FeatureCard
            icon={<Share2 className="h-10 w-10 text-warning" />}
            title="Share Boards"
            description="Collaborate with mentors or career coaches by sharing read-only views of your job search progress."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-primary text-primary-foreground rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of job seekers who are organizing their search with Job Tracker
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Free Account <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-4 text-sm opacity-75">50 jobs free • No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">© 2026 Job Tracker. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow-md hover:border-primary/30 transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}