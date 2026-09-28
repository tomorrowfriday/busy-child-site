'use client';

import { useState } from 'react';
import { GateRunner } from '@/components/GateRunner';
import { SpecEditor } from '@/components/SpecEditor';
import type { Content, Gate, Scenario } from '@/content/schema';

/**
 * The four steps, as tabs over one panel.
 *
 * Steps one and two are the same editor seen from two sides — the spec you
 * write, and the test it compiles to — so the tab emphasises a pane rather than
 * swapping the component out. Losing the live editor here would cost the page
 * its only real evidence, so the design's read-only panes are rendered by the
 * editor itself instead.
 */
const STEP_HUES = ['var(--kw)', 'var(--fn)', 'var(--num)', 'var(--str)'] as const;

export function ProofTabs({
  t,
  scenarios,
  gates,
  editor,
  runner,
}: {
  t: Content['home']['proof'];
  scenarios: readonly Scenario[];
  gates: readonly Gate[];
  editor: Content['home']['editor'];
  runner: Content['home']['runner'];
}) {
  const [step, setStep] = useState(0);
  const hue = STEP_HUES[step % STEP_HUES.length] as string;

  return (
    <>
      <div className="steps-tabs" role="tablist" aria-label={t.title}>
        {t.steps.map((item, index) => (
          <button
            key={item.title}
            type="button"
            role="tab"
            id={`proof-tab-${index}`}
            aria-selected={index === step}
            aria-controls="proof-panel"
            tabIndex={index === step ? 0 : -1}
            className={`step-tab${index === step ? ' is-on' : ''}`}
            style={{ '--hue': STEP_HUES[index] } as React.CSSProperties}
            onClick={() => setStep(index)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
              event.preventDefault();
              const next =
                event.key === 'ArrowRight'
                  ? (step + 1) % t.steps.length
                  : (step - 1 + t.steps.length) % t.steps.length;
              setStep(next);
              document.getElementById(`proof-tab-${next}`)?.focus();
            }}
          >
            <span className="step-n">{index + 1}</span>
            <span className="step-t">{item.title}</span>
            <span className="step-p">{item.detail}</span>
          </button>
        ))}
      </div>

      <div
        className="proof-panel"
        id="proof-panel"
        role="tabpanel"
        aria-labelledby={`proof-tab-${step}`}
        style={{ '--hue': hue } as React.CSSProperties}
      >
        <span className="proof-label">{t.steps[step]?.label}</span>

        {step < 2 ? (
          <div className={step === 0 ? 'emph-spec' : 'emph-test'}>
            <SpecEditor scenarios={scenarios} t={editor} />
          </div>
        ) : null}

        {step === 2 ? (
          <>
            <GateRunner gates={gates} t={runner} />
            <p className="proof-note">{t.gatesNote}</p>
          </>
        ) : null}

        {step === 3 ? (
          <div className="ship">
            {t.ship.map((item) => (
              <div className="ship-card" key={item.value}>
                <b>{item.value}</b>
                <span>{item.detail}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
