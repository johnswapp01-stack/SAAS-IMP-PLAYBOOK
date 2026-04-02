import Link from 'next/link';
import { WaitlistForm } from '@/components/landing/waitlist-form';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">IP</span>
            </div>
            <span className="font-semibold text-lg">Implementation Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#features" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
            <Link href="/signup" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">Start free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <div className="inline-block mb-6 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          AI-Powered Implementation Management
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
          AI agents that run
          <br />
          implementations.
          <br />
          <span className="text-primary">You run the show.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Manage every engagement from kickoff to go-live. AI agents generate
          documents, detect risks, draft client updates, and execute repeatable
          delivery tasks — while learning your team&apos;s patterns.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-lg text-base font-medium hover:bg-primary/90 transition-colors text-center">
            Start free — no credit card
          </Link>
          <Link href="#features" className="w-full sm:w-auto text-muted-foreground px-6 py-3 rounded-lg text-base font-medium hover:text-foreground transition-colors text-center">
            See how it works
          </Link>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-border bg-muted/30 py-6">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm text-muted-foreground">Built by an implementation specialist who has run 50+ enterprise SaaS deployments. Every feature exists because the pain was real.</p>
        </div>
      </section>

      {/* Features: Three Layers */}
      <section id="features" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-3">Three layers. One platform.</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">Each layer builds on the one below it. Start with the workspace, add governance as you grow, unlock AI execution when you&apos;re ready.</p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="rounded-xl border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <span className="text-green-600 dark:text-green-400 text-lg">&#x2699;&#xFE0F;</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Operations Automation</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Resource allocation, time policies, financial controls, and compliance
              rules — enforced automatically.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>&#x2713; Time tracking &amp; budget management</li>
              <li>&#x2713; Resource allocation with overload detection</li>
              <li>&#x2713; Compliance rules with auto-enforcement</li>
              <li>&#x2713; Plan limits per subscription tier</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <span className="text-blue-600 dark:text-blue-400 text-lg">&#x1F50D;</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Delivery Governance</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              AI monitors delivery signals, generates project plans, surfaces risks
              before they become fires.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>&#x2713; Auto-computed health scores (5 weighted factors)</li>
              <li>&#x2713; Risk signal detection &amp; tracking</li>
              <li>&#x2713; Versioned project plans with milestones</li>
              <li>&#x2713; Client update templates (weekly, milestone, risk alert)</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <span className="text-purple-600 dark:text-purple-400 text-lg">&#x1F916;</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Work Execution</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              AI agents execute repeatable tasks. You review, approve, and deliver.
              Nothing ships without your sign-off.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>&#x2713; 6 specialized agent types</li>
              <li>&#x2713; Draft → Approve → Deliver artifact workflow</li>
              <li>&#x2713; Learning feedback loop (accept/modify/reject)</li>
              <li>&#x2713; Self-healing with error pattern detection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-center mb-12">Everything an implementation team needs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '&#x1F3AF;', label: 'MoSCoW Scoping' },
              { icon: '&#x1F465;', label: 'Stakeholder Tracking' },
              { icon: '&#x2696;&#xFE0F;', label: 'Decision Log' },
              { icon: '&#x1F4CA;', label: 'RACI Matrix' },
              { icon: '&#x1F680;', label: 'Kickoff Checklists' },
              { icon: '&#x2705;', label: 'Go-Live Checklists' },
              { icon: '&#x23F1;&#xFE0F;', label: 'Time Tracking' },
              { icon: '&#x1F4B0;', label: 'Budget Management' },
              { icon: '&#x1F4DD;', label: 'Status Reports' },
              { icon: '&#x1F4A1;', label: 'Lessons Learned' },
              { icon: '&#x1F6E1;&#xFE0F;', label: 'Risk Signals' },
              { icon: '&#x1F4C8;', label: 'Delivery Trends' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-sm">
                <span dangerouslySetInnerHTML={{ __html: f.icon }} />
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-3">Simple, transparent pricing</h2>
        <p className="text-center text-muted-foreground mb-12">Start free. Upgrade when you need more.</p>
        <div className="grid md:grid-cols-4 gap-6">
          {/* Free */}
          <div className="rounded-xl border border-border p-6">
            <h3 className="font-semibold text-lg">Free</h3>
            <div className="mt-2 mb-4"><span className="text-3xl font-bold">$0</span><span className="text-muted-foreground text-sm">/mo</span></div>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li>2 engagements</li>
              <li>1 user</li>
              <li>All core templates</li>
              <li>Community support</li>
            </ul>
            <Link href="/signup" className="block text-center px-4 py-2 border border-input rounded-md text-sm hover:bg-accent transition-colors">Get started</Link>
          </div>

          {/* Pro */}
          <div className="rounded-xl border-2 border-primary p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-medium">Popular</div>
            <h3 className="font-semibold text-lg">Pro</h3>
            <div className="mt-2 mb-4"><span className="text-3xl font-bold">$49</span><span className="text-muted-foreground text-sm">/mo</span></div>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li>Unlimited engagements</li>
              <li>3 users</li>
              <li>AI status reports</li>
              <li>50 agent tasks/mo</li>
            </ul>
            <Link href="/signup" className="block text-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">Start free trial</Link>
          </div>

          {/* Team */}
          <div className="rounded-xl border border-border p-6">
            <h3 className="font-semibold text-lg">Team</h3>
            <div className="mt-2 mb-4"><span className="text-3xl font-bold">$149</span><span className="text-muted-foreground text-sm">/mo</span></div>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li>Unlimited engagements</li>
              <li>25 users</li>
              <li>Unlimited agent tasks</li>
              <li>Priority support</li>
            </ul>
            <Link href="/signup" className="block text-center px-4 py-2 border border-input rounded-md text-sm hover:bg-accent transition-colors">Start free trial</Link>
          </div>

          {/* Enterprise */}
          <div className="rounded-xl border border-border p-6">
            <h3 className="font-semibold text-lg">Enterprise</h3>
            <div className="mt-2 mb-4"><span className="text-3xl font-bold">Custom</span></div>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li>Unlimited everything</li>
              <li>SSO &amp; SCIM</li>
              <li>Dedicated support</li>
              <li>Custom integrations</li>
            </ul>
            <Link href="mailto:john.swapp01@gmail.com" className="block text-center px-4 py-2 border border-input rounded-md text-sm hover:bg-accent transition-colors">Contact us</Link>
          </div>
        </div>
      </section>

      {/* Design Partner Beta */}
      <section id="beta" className="bg-muted/30 border-y border-border py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
            Design Partner Program
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Be one of the first 20 teams.</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            We&apos;re hand-picking implementation teams for our design partner beta. You get early access and direct input on the roadmap. We get honest feedback that shapes the product.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8 text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="font-medium mb-1">Free Pro access</div>
              <div className="text-muted-foreground text-xs">Full platform for your first 3 months</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="font-medium mb-1">Direct founder access</div>
              <div className="text-muted-foreground text-xs">Weekly calls + async Slack channel</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="font-medium mb-1">Shape the roadmap</div>
              <div className="text-muted-foreground text-xs">Your feature requests get priority</div>
            </div>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Stop managing implementations in spreadsheets.</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">Join implementation teams who are shipping go-lives faster with AI-powered delivery management.</p>
          <Link href="/signup" className="inline-block bg-background text-foreground px-6 py-3 rounded-lg text-base font-medium hover:bg-background/90 transition-colors">
            Start free — takes 30 seconds
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Implementation Pro</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
          <span>Built by JSBRO-TMM</span>
        </div>
      </footer>
    </div>
  );
}
