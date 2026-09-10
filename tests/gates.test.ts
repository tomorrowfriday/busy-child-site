import { describe, expect, it } from 'vitest';
import { durationFor, formatMs, planRun, summarise } from '@/lib/gates';
import en from '@/content/locales/en';
const gates = en.gates;

describe('durationFor', () => {
  it('is deterministic — the same gate always takes the same time', () => {
    expect(durationFor('tsc')).toBe(durationFor('tsc'));
  });

  it('gives different gates different durations', () => {
    expect(durationFor('tsc')).not.toBe(durationFor('ESLint'));
  });

  it('stays inside the range the demo animates over', () => {
    for (const gate of gates) {
      const ms = durationFor(gate.gate);
      expect(ms).toBeGreaterThanOrEqual(140);
      expect(ms).toBeLessThan(760);
    }
  });

  it('handles an empty name without dividing by zero', () => {
    expect(durationFor('')).toBe(140);
  });
});

describe('planRun', () => {
  it('passes every gate when nothing is set to fail', () => {
    const steps = planRun(gates);
    expect(steps).toHaveLength(gates.length);
    expect(steps.every((step) => step.status === 'passed')).toBe(true);
  });

  it('stops the build at the failing gate and skips the rest', () => {
    const steps = planRun(gates, 'tsc');
    const failedIndex = steps.findIndex((step) => step.status === 'failed');

    expect(failedIndex).toBeGreaterThan(-1);
    expect(steps[failedIndex]?.name).toBe('tsc');
    expect(steps.slice(0, failedIndex).every((s) => s.status === 'passed')).toBe(true);
    expect(steps.slice(failedIndex + 1).every((s) => s.status === 'skipped')).toBe(true);
  });

  it('fails on the very first gate when that is the one selected', () => {
    const first = gates[0]!.gate;
    const steps = planRun(gates, first);
    expect(steps[0]?.status).toBe('failed');
    expect(steps.slice(1).every((s) => s.status === 'skipped')).toBe(true);
  });

  it('attaches what the failing gate catches, as the failure note', () => {
    const steps = planRun(gates, 'tsc');
    const failed = steps.find((s) => s.status === 'failed');
    expect(failed?.note).toBe(gates.find((g: { gate: string }) => g.gate === 'tsc')?.catches);
  });

  it('gives skipped gates no duration — they never ran', () => {
    const steps = planRun(gates, 'tsc');
    expect(steps.filter((s) => s.status === 'skipped').every((s) => s.ms === 0)).toBe(true);
  });

  it('ignores a failAt that names no gate', () => {
    const steps = planRun(gates, 'not-a-gate');
    expect(steps.every((s) => s.status === 'passed')).toBe(true);
  });

  it('returns an empty plan for an empty gate list', () => {
    expect(planRun([])).toEqual([]);
  });

  it('preserves whether each gate is a command', () => {
    const steps = planRun(gates);
    expect(steps.find((s) => s.name === 'tsc')?.isCommand).toBe(true);
    expect(steps.find((s) => s.name === 'ESLint')?.isCommand).toBe(false);
  });
});

describe('summarise', () => {
  it('counts a clean run', () => {
    const summary = summarise(planRun(gates));
    expect(summary.passed).toBe(gates.length);
    expect(summary.failed).toBe(0);
    expect(summary.skipped).toBe(0);
    expect(summary.ok).toBe(true);
    expect(summary.totalMs).toBeGreaterThan(0);
  });

  it('counts a failed run and reports it as not ok', () => {
    const summary = summarise(planRun(gates, 'tsc'));
    expect(summary.failed).toBe(1);
    expect(summary.skipped).toBeGreaterThan(0);
    expect(summary.ok).toBe(false);
  });

  it('treats a pending step as neither passed, failed nor skipped', () => {
    const summary = summarise([
      { name: 'a', isCommand: false, status: 'pending', ms: 10 },
      { name: 'b', isCommand: false, status: 'running', ms: 5 },
    ]);
    expect(summary).toMatchObject({ passed: 0, failed: 0, skipped: 0, totalMs: 15, ok: true });
  });

  it('summarises an empty run', () => {
    expect(summarise([])).toEqual({
      passed: 0,
      failed: 0,
      skipped: 0,
      totalMs: 0,
      ok: true,
    });
  });
});

describe('formatMs', () => {
  it('shows sub-second timings in milliseconds', () => {
    expect(formatMs(340)).toBe('340ms');
    expect(formatMs(999)).toBe('999ms');
  });

  it('switches to seconds at a second', () => {
    expect(formatMs(1000)).toBe('1.0s');
    expect(formatMs(2450)).toBe('2.5s');
  });
});
