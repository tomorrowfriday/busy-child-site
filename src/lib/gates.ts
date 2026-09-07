import type { Gate } from '@/content/schema';

/**
 * The gate runner's logic.
 *
 * The site claims that verification is a build failure rather than a review
 * comment. This models exactly that: when a gate fails, everything after it is
 * skipped — the build stops, it does not carry on and report at the end. The
 * component animates the result; all of the behaviour lives here, where it can
 * be tested.
 */

export type GateStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

export interface GateStep {
  readonly name: string;
  readonly isCommand: boolean;
  readonly status: GateStatus;
  /** Deterministic pseudo-duration, so the demo runs the same way every time. */
  readonly ms: number;
  readonly note?: string;
}

export interface RunSummary {
  readonly passed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly totalMs: number;
  readonly ok: boolean;
}

/**
 * A stable duration per gate name. Deterministic rather than random: a demo
 * that reshuffles its own timings on every run looks broken, not alive.
 */
export function durationFor(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 100_000;
  }
  return 140 + (hash % 620);
}

export function planRun(gates: readonly Gate[], failAt?: string): GateStep[] {
  let hasFailed = false;

  return gates.map((gate) => {
    const base = { name: gate.gate, isCommand: gate.isCommand, ms: durationFor(gate.gate) };

    if (hasFailed) {
      return { ...base, status: 'skipped' as const, ms: 0 };
    }
    if (gate.gate === failAt) {
      hasFailed = true;
      return { ...base, status: 'failed' as const, note: gate.catches };
    }
    return { ...base, status: 'passed' as const };
  });
}

export function summarise(steps: readonly GateStep[]): RunSummary {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let totalMs = 0;

  for (const step of steps) {
    totalMs += step.ms;
    if (step.status === 'passed') passed += 1;
    else if (step.status === 'failed') failed += 1;
    else if (step.status === 'skipped') skipped += 1;
  }

  return { passed, failed, skipped, totalMs, ok: failed === 0 };
}

/** Human-readable timing, so 1400ms reads as 1.4s. */
export function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}
