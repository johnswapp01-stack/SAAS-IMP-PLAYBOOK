import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">IP</span>
            </div>
            <span className="font-semibold text-lg">Implementation Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
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
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
          >
            Start free — no credit card
          </Link>
          <Link
            href="#layers"
            className="text-muted-foreground px-6 py-3 rounded-lg text-base font-medium hover:text-foreground transition-colors"
          >
            See how it works
          </Link>
        </div>
      </section>

      {/* Three Layers */}
      <section id="layers" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">
          Three layers. One platform.
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Layer 1 */}
          <div className="rounded-xl border border-border p-6">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <span className="text-green-600 dark:text-green-400 text-lg">⚙️</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Operations Automation</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Resource allocation, time policies, financial controls, and compliance
              rules — enforced automatically. The rules run themselves.
            </p>
          </div>

          {/* Layer 2 */}
          <div className="rounded-xl border border-border p-6">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <span className="text-blue-600 dark:text-blue-400 text-lg">🔍</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Delivery Governance</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI monitors delivery signals, generates project plans, sends client
              updates, and surfaces risks before they become fires. See around corners.
            </p>
          </div>

          {/* Layer 3 */}
          <div className="rounded-xl border border-border p-6">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <span className="text-purple-600 dark:text-purple-400 text-lg">🤖</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Work Execution</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI agents execute repeatable billable tasks — documentation, testing,
              migration planning, configuration validation. You make the calls.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Implementation Pro</span>
          <span>Built by JSBRO-TMM</span>
        </div>
      </footer>
    </div>
  );
}
