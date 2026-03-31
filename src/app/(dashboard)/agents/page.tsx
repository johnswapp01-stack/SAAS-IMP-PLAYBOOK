export default function AgentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">AI Agents</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Deploy AI agents to execute repeatable delivery tasks. Monitor execution, review artifacts, track costs.
      </p>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="text-3xl font-bold">6</p>
          <p className="text-sm text-muted-foreground mt-1">Available Agents</p>
        </div>
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="text-3xl font-bold">—</p>
          <p className="text-sm text-muted-foreground mt-1">Tasks This Month</p>
        </div>
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="text-3xl font-bold">—%</p>
          <p className="text-sm text-muted-foreground mt-1">Acceptance Rate</p>
        </div>
      </div>

      {/* Agent cards */}
      <h2 className="font-semibold text-lg mb-4">System Agents</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { name: 'Documentation', icon: '📝', mode: 'Propose & Wait', desc: 'Generates docs, runbooks, handoffs' },
          { name: 'Communication', icon: '💬', mode: 'Propose & Wait', desc: 'Drafts stakeholder updates and emails' },
          { name: 'Testing', icon: '🧪', mode: 'Propose & Wait', desc: 'Creates test plans and traceability' },
          { name: 'Migration', icon: '🔄', mode: 'Assist', desc: 'Plans migrations with rollback steps' },
          { name: 'Configuration', icon: '⚙️', mode: 'Assist', desc: 'Config checklists and drift detection' },
          { name: 'Analysis', icon: '📊', mode: 'Auto-Execute', desc: 'Cross-engagement pattern detection' },
        ].map((agent) => (
          <div key={agent.name} className="rounded-lg border border-border p-5 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{agent.icon}</span>
              <div>
                <p className="font-medium">{agent.name} Agent</p>
                <p className="text-xs text-muted-foreground">{agent.mode}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{agent.desc}</p>
            <button
              className="mt-4 w-full py-1.5 text-sm rounded-md border border-input text-muted-foreground hover:bg-accent transition-colors"
              disabled
            >
              Available in Phase 5
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
