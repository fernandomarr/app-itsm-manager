'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  GitBranch,
  Settings,
  Moon,
  Sun,
  ChevronRight,
  Star,
  Users,
  Globe,
  Headphones,
} from 'lucide-react';

function useThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('helpops-theme', next ? 'dark' : 'light');
  };

  return { dark, toggle };
}

export default function HomePage() {
  const { dark, toggle } = useThemeToggle();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Headphones className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Help<span className="text-primary">Ops</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#modules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Modules</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="btn-ghost p-2 rounded-lg"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link href="/auth/login" className="btn-ghost text-sm hidden sm:inline-flex">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 pt-20 pb-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Zap className="w-3.5 h-3.5" />
              <span>Now in Open Beta — Free forever for small teams</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              IT Service Management{' '}
              <span className="gradient-text">made simple</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Manage incidents, requests, problems, and changes in one intuitive platform.
              Built for modern teams who value speed and clarity.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/auth/signup" className="btn-primary text-base px-8 py-3 rounded-xl">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#features" className="btn-secondary text-base px-8 py-3 rounded-xl">
                See Features
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: '10K+', label: 'Tickets Resolved' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '50+', label: 'Teams Active' },
              { value: '< 5min', label: 'Avg Response' },
            ].map((stat, i) => (
              <div key={stat.label} className={`text-center animate-count-up stagger-${i + 1}`}>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MODULES ===== */}
      <section id="modules" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need, <span className="gradient-text">in one place</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four powerful ITIL-aligned modules working together seamlessly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <ModuleCard
              icon={<AlertCircle className="h-6 w-6" />}
              color="text-incident"
              bg="bg-incident/10"
              borderColor="hover:border-incident/30"
              title="Incidents"
              description="Restore service quickly with automated workflows, priority matrix, and SLA tracking."
            />
            <ModuleCard
              icon={<ClipboardList className="h-6 w-6" />}
              color="text-request"
              bg="bg-request/10"
              borderColor="hover:border-request/30"
              title="Requests"
              description="Streamline service requests with customizable forms and automated approvals."
            />
            <ModuleCard
              icon={<GitBranch className="h-6 w-6" />}
              color="text-problem"
              bg="bg-problem/10"
              borderColor="hover:border-problem/30"
              title="Problems"
              description="Identify root causes with RCA tools, known error database, and trend analysis."
            />
            <ModuleCard
              icon={<Settings className="h-6 w-6" />}
              color="text-change"
              bg="bg-change/10"
              borderColor="hover:border-change/30"
              title="Changes"
              description="Manage changes safely with CAB workflows, risk assessment, and release calendars."
            />
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for <span className="gradient-text">productivity</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature designed to reduce friction and increase team efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-7 w-7 text-warning" />}
              title="Lightning Fast"
              description="Sub-second load times and real-time updates keep your team moving at full speed."
            />
            <FeatureCard
              icon={<Shield className="h-7 w-7 text-success" />}
              title="Enterprise Security"
              description="Row-level security, encrypted data, and role-based access control out of the box."
            />
            <FeatureCard
              icon={<BarChart3 className="h-7 w-7 text-info" />}
              title="Actionable Insights"
              description="Real-time dashboards and automated reports to drive data-informed decisions."
            />
            <FeatureCard
              icon={<Users className="h-7 w-7 text-primary" />}
              title="Team Collaboration"
              description="Internal comments, mentions, and assignment workflows for seamless teamwork."
            />
            <FeatureCard
              icon={<Globe className="h-7 w-7 text-accent" />}
              title="Multi-Tenant Ready"
              description="Manage multiple organizations with isolated data and custom configurations."
            />
            <FeatureCard
              icon={<Settings className="h-7 w-7 text-muted-foreground" />}
              title="Fully Customizable"
              description="Custom workflows, SLA policies, and form fields to match your processes."
            />
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by <span className="gradient-text">IT teams</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what teams around the world are saying about HelpOps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Carlos Mendes"
              role="IT Manager, TechCorp"
              content="HelpOps transformed our service desk. We reduced resolution time by 40% in the first month."
              rating={5}
            />
            <TestimonialCard
              name="Ana Oliveira"
              role="Support Lead, StartupXYZ"
              content="The interface is so clean and intuitive. Our team adopted it instantly — zero training needed."
              rating={5}
            />
            <TestimonialCard
              name="Ricardo Santos"
              role="CTO, CloudBase"
              content="Finally, an ITSM tool that doesn't feel like software from 2005. Modern, fast, and powerful."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="relative rounded-2xl overflow-hidden bg-primary p-12 md:p-16 text-center text-primary-foreground">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/30 opacity-90" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to modernize your IT operations?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Join hundreds of teams already using HelpOps to deliver better IT services.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-xl font-semibold text-base hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Started Free <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Headphones className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Help<span className="text-primary">Ops</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
              <span>•</span>
              <span>© {new Date().getFullYear()} HelpOps. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function ModuleCard({ icon, color, bg, borderColor, title, description }: {
  icon: React.ReactNode;
  color: string;
  bg: string;
  borderColor: string;
  title: string;
  description: string;
}) {
  return (
    <div className={`card-hover p-6 ${borderColor}`}>
      <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
        <span className={color}>{icon}</span>
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card-interactive p-6">
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ name, role, content, rating }: {
  name: string;
  role: string;
  content: string;
  rating: number;
}) {
  return (
    <div className="card p-6">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-warning text-warning" />
        ))}
      </div>
      <p className="text-sm text-foreground leading-relaxed mb-4">&ldquo;{content}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">{name.charAt(0)}</span>
        </div>
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </div>
      </div>
    </div>
  );
}
