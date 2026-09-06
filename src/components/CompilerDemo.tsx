'use client';

import { useEffect, useRef, useState } from 'react';
import { compileScenario, renderSpec } from '@/lib/compile';
import type { Scenario } from '@/content/schema';
import { Code } from './Primitives';

/**
 * The homepage specimen, made interactive.
 *
 * Both panes are computed by `compileScenario` / `renderSpec` in the browser —
 * there is no pre-rendered pair of strings being swapped. Choosing a scenario
 * runs the compiler, which is the point: the claim is executing while you read
 * it. Nothing else on the site animates.
 */
export function CompilerDemo({ scenarios }: { scenarios: readonly Scenario[] }) {
  const [active, setActive] = useState(0);
  const [settling, setSettling] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const scenario = scenarios[active] ?? scenarios[0];

  useEffect(() => () => clearTimeout(timer.current), []);

  function select(index: number) {
    if (index === active) return;
    setActive(index);
    setSettling(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSettling(false), 180);
  }

  if (!scenario) return null;

  const spec = renderSpec(scenario);
  const compiled = compileScenario(scenario);

  return (
    <div className="compiler">
      <div className="compiler-tabs" role="tablist" aria-label="Specification scenarios">
        {scenarios.map((item, index) => (
          <button
            key={item.index}
            type="button"
            role="tab"
            id={`scenario-tab-${item.index}`}
            aria-selected={index === active}
            aria-controls="scenario-panes"
            tabIndex={index === active ? 0 : -1}
            className="compiler-tab"
            onClick={() => select(index)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                const next =
                  event.key === 'ArrowRight'
                    ? (active + 1) % scenarios.length
                    : (active - 1 + scenarios.length) % scenarios.length;
                select(next);
                document.getElementById(`scenario-tab-${scenarios[next]?.index}`)?.focus();
              }
            }}
          >
            <span className="idx">{String(item.index).padStart(2, '0')}</span>{' '}
            {item.title.length > 42 ? `${item.title.slice(0, 42)}…` : item.title}
          </button>
        ))}
      </div>

      <div
        className="compiler-panes"
        id="scenario-panes"
        role="tabpanel"
        aria-labelledby={`scenario-tab-${scenario.index}`}
      >
        <div className="compiler-pane">
          <div className="compiler-head">
            <span className="src">docs/spec/ — written by a human</span>
          </div>
          <div
            className="compiler-body is-spec"
            data-state={settling ? 'settling' : 'ready'}
          >
            <pre>{spec}</pre>
          </div>
        </div>

        <div className="compiler-pane">
          <div className="compiler-head">
            <span className="out">generated — never edited</span>
            <CopyButton value={compiled} />
          </div>
          <div className="compiler-body" data-state={settling ? 'settling' : 'ready'}>
            <pre>
              <Code source={compiled} />
            </pre>
          </div>
        </div>
      </div>

      <p className="compiler-proves">
        <b>Proves</b>
        {scenario.proves}
      </p>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard permission denied — leave the label unchanged rather than
      // claiming a copy that did not happen.
    }
  }

  return (
    <button type="button" className="copy-btn" data-copied={copied} onClick={copy}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
