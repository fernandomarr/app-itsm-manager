import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, Zap, BarChart } from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">IT</span>
            </div>
            <span className="font-semibold">ITSM Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Modern IT Service Management
            <span className="text-primary"> for Growing Teams</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Streamline your IT operations with our comprehensive platform for incident,
            request, problem, and change management. Built for scalability and ease of use.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-incident/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-incident" />
            </div>
            <h3 className="font-semibold mb-2">Incident Management</h3>
            <p className="text-sm text-muted-foreground">
              Quickly restore service with streamlined incident tracking and resolution workflows.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-request/10 flex items-center justify-center mb-4">
              <ClipboardList className="h-6 w-6 text-request" />
            </div>
            <h3 className="font-semibold mb-2">Service Requests</h3>
            <p className="text-sm text-muted-foreground">
              Fulfill user requests efficiently with customizable forms and approval workflows.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-problem/10 flex items-center justify-center mb-4">
              <GitBranch className="h-6 w-6 text-problem" />
            </div>
            <h3 className="font-semibold mb-2">Problem Management</h3>
            <p className="text-sm text-muted-foreground">
              Identify root causes and prevent recurring incidents with our KEDB.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-change/10 flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-change" />
            </div>
            <h3 className="font-semibold mb-2">Change Management</h3>
            <p className="text-sm text-muted-foreground">
              Manage changes safely with CAB workflows and risk assessment.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Fast Setup</h3>
            <p className="text-muted-foreground">Get started in minutes, not days</p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Secure by Default</h3>
            <p className="text-muted-foreground">Enterprise-grade security and compliance</p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BarChart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Actionable Insights</h3>
            <p className="text-muted-foreground">Real-time dashboards and reporting</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          Built with modern technologies for the future of IT service management.
        </div>
      </footer>
    </div>
  );
}

// Import icons
import { AlertCircle, ClipboardList, GitBranch, Settings } from 'lucide-react';
