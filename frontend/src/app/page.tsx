import Link from 'next/link';
import { ArrowRight, Zap, Shield, BarChart, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-info/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-shadow duration-300">
              <span className="text-white font-bold text-sm">IT</span>
            </div>
            <span className="font-semibold text-lg">ITSM Platform</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="btn-primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 py-24 relative">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-float">
            <Sparkles className="w-4 h-4" />
            <span>The future of IT service management</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Modern IT Service{' '}
            <span className="gradient-text">Management</span>
            <br />
            for Growing Teams
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Streamline your IT operations with our comprehensive platform for incident,
            request, problem, and change management. Built for scalability and ease of use.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth/signup">
              <Button size="lg" className="btn-primary gap-2 text-base px-8 py-3">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-base px-8 py-3">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Cancel anytime
            </span>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
          <FeatureCard
            icon={<AlertCircle className="h-6 w-6 text-rose-400" />}
            gradient="from-rose-500/20 to-orange-500/20"
            title="Incident Management"
            description="Quickly restore service with streamlined incident tracking and resolution workflows."
          />
          <FeatureCard
            icon={<ClipboardList className="h-6 w-6 text-emerald-400" />}
            gradient="from-emerald-500/20 to-teal-500/20"
            title="Service Requests"
            description="Fulfill user requests efficiently with customizable forms and approval workflows."
          />
          <FeatureCard
            icon={<GitBranch className="h-6 w-6 text-violet-400" />}
            gradient="from-violet-500/20 to-purple-500/20"
            title="Problem Management"
            description="Identify root causes and prevent recurring incidents with our KEDB."
          />
          <FeatureCard
            icon={<Settings className="h-6 w-6 text-amber-400" />}
            gradient="from-amber-500/20 to-yellow-500/20"
            title="Change Management"
            description="Manage changes safely with CAB workflows and risk assessment."
          />
        </div>

        {/* Benefits */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <BenefitCard
            icon={<Zap className="h-8 w-8 text-amber-400" />}
            gradient="from-amber-500/20 to-orange-500/20"
            title="Fast Setup"
            description="Get started in minutes, not days"
          />
          <BenefitCard
            icon={<Shield className="h-8 w-8 text-emerald-400" />}
            gradient="from-emerald-500/20 to-teal-500/20"
            title="Secure by Default"
            description="Enterprise-grade security and compliance"
          />
          <BenefitCard
            icon={<BarChart className="h-8 w-8 text-violet-400" />}
            gradient="from-violet-500/20 to-purple-500/20"
            title="Actionable Insights"
            description="Real-time dashboards and reporting"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 mt-24 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          Built with modern technologies for the future of IT service management.
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  gradient,
  title,
  description,
}: {
  icon: React.ReactNode;
  gradient: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Benefit Card Component
function BenefitCard({
  icon,
  gradient,
  title,
  description,
}: {
  icon: React.ReactNode;
  gradient: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center group">
      <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

// Import icons
import { AlertCircle, ClipboardList, GitBranch, Settings } from 'lucide-react';
