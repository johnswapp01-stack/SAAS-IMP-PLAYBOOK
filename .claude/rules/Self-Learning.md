# Self-Learning.md

## Purpose
Running incident log. Append an entry after every self-healing loop — any time a bug was found during testing, fixed, and all phases re-passed. This builds institutional memory so the same failure pattern doesn't recur.

## How to Append
Add a new entry below the `---` divider. Most recent entry at the top.

## Entry Format
```
### [YYYY-MM-DD] — [Brief description]
- **What broke:** [Symptom observed in testing]
- **Root cause:** [Why it broke — the actual cause, not the symptom]
- **Fix applied:** [What was changed and in which file(s)]
- **Phase caught:** [Which phase in testing.md caught it]
- **Prevention:** [What test, lint rule, or checklist step would have caught this earlier]
```

---

<!-- Append new entries below this line, most recent first -->
