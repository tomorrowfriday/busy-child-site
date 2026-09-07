'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatMs, planRun, summarise, type GateStep } from '@/lib/gates';
import type { Gate } from '@/content/schema';

/**
 * The gate table, made runnable.
 *
 * Press run and the gates execute in sequence. Choose a gate to break and the
 * run stops there: everything after it is skipped, not reported at the end.
 * That is the difference the copy claims — a build failure rather than a review
 * comment — and it is easier to believe once you have watched it happen.
 */
export function GateRunner({ gates }: { gates: readonly Gate[] }) {
  const [steps, setSteps] = useState<GateStep[]>(() =>
    gates.map((gate) => ({
      name: gate.gate,
      isCommand: gate.isCommand,
      status: 'pending' as const,
      ms: 0,
    })),
  );
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [failAt, setFailAt] = useState<string>('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setRunning(false);
    setDone(false);
    setSteps(
      gates.map((gate) => ({
        name: gate.gate,
        isCommand: gate.isCommand,
        status: 'pending' as const,
        ms: 0,
      })),
    );
  }, [gates, clearTimers]);

  function run() {
    clearTimers();
    const plan = planRun(gates, failAt || undefined);
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setRunning(true);
    setDone(false);

    if (reduced) {
      // No stagger for anyone who asked for less motion — show the result.
      setSteps(plan);
      setRunning(false);
      setDone(true);
      return;
    }

    setSteps(plan.map((step) => ({ ...step, status: 'pending', ms: 0 })));

    let elapsed = 0;
    plan.forEach((step, i) => {
      const isSkipped = step.status === 'skipped';
      const startAt = elapsed;
      // Skipped gates resolve immediately — they never ran.
      const duration = isSkipped ? 0 : Math.round(step.ms / 3);
      elapsed += duration + (isSkipped ? 0 : 90);

      timers.current.push(
        setTimeout(() => {
          setSteps((current) =>
            current.map((existing, j) =>
              j === i ? { ...existing, status: isSkipped ? 'skipped' : 'running' } : existing,
            ),
          );
        }, startAt),
      );

      timers.current.push(
        setTimeout(() => {
          setSteps((current) => current.map((existing, j) => (j === i ? step : existing)));
        }, startAt + duration),
      );
    });

    timers.current.push(
      setTimeout(() => {
        setRunning(false);
        setDone(true);
      }, elapsed + 60),
    );
  }

  const summary = summarise(steps);
  const settled = done && !running;

  return (
    <div className="runner">
      <div className="runner-bar">
        <button type="button" className="run-btn" onClick={running ? reset : run} disabled={false}>
          {running ? 'Stop' : done ? 'Run again' : 'Run the gates'}
        </button>

        <label className="runner-break">
          <span>Break</span>
          <select
            value={failAt}
            onChange={(event) => {
              setFailAt(event.target.value);
              reset();
            }}
          >
            <option value="">nothing — clean run</option>
            {gates.map((gate) => (
              <option key={gate.gate} value={gate.gate}>
                {gate.gate}
              </option>
            ))}
          </select>
        </label>

        {settled ? (
          <span className={`runner-verdict ${summary.ok ? 'is-ok' : 'is-bad'}`}>
            {summary.ok
              ? `build passed · ${summary.passed} gates · ${formatMs(summary.totalMs)}`
              : `build failed · ${summary.passed} passed, ${summary.skipped} never ran`}
          </span>
        ) : null}
      </div>

      <ol className="runner-list">
        {steps.map((step) => (
          <li key={step.name} className={`runner-step is-${step.status}`}>
            <span className="mark" aria-hidden="true">
              {step.status === 'passed'
                ? '✓'
                : step.status === 'failed'
                  ? '✕'
                  : step.status === 'running'
                    ? '⋯'
                    : step.status === 'skipped'
                      ? '·'
                      : ' '}
            </span>
            <span className="name">
              {step.isCommand ? <code>{step.name}</code> : step.name}
            </span>
            <span className="time">
              {step.status === 'passed' || step.status === 'failed' ? formatMs(step.ms) : ''}
              {step.status === 'skipped' ? 'skipped' : ''}
            </span>
            <span className="visually-hidden">{step.status}</span>
            {step.status === 'failed' && step.note ? (
              <span className="fail-note">{step.note}</span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
