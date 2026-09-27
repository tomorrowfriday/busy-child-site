'use client';

import { useMemo, useState } from 'react';
import { compileScenario, renderSpec } from '@/lib/compile';
import {
  ASSERTION_KINDS,
  changeAssertionKind,
  checkScenario,
  removeAssertion,
  setAssertion,
  setOperation,
  setRole,
} from '@/lib/scenarioEdit';
import type { Assertion, Content, Scenario } from '@/content/schema';
import { Code } from './Primitives';

/**
 * The homepage specimen, made editable.
 *
 * Change the role, the operation or an assertion and the test on the right is
 * recompiled by the same pure function the pipeline uses. Break the spec — take
 * the last assertion away, or lower-case the operation — and the compiler
 * refuses to emit, exactly as `composer validate` refuses in CI.
 *
 * This is the site's whole argument, made touchable.
 */
export function SpecEditor({
  scenarios,
  t,
}: {
  scenarios: readonly Scenario[];
  t: Content['home']['editor'];
}) {
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<Scenario>(() => scenarios[0]!);
  const [dirty, setDirty] = useState(false);

  const check = useMemo(() => checkScenario(draft), [draft]);
  const spec = useMemo(() => (check.ok ? renderSpec(draft) : null), [draft, check.ok]);
  const compiled = useMemo(() => (check.ok ? compileScenario(draft) : null), [draft, check.ok]);

  function load(next: number) {
    setIndex(next);
    setDraft(scenarios[next]!);
    setDirty(false);
  }

  function edit(next: Scenario) {
    setDraft(next);
    setDirty(true);
  }

  return (
    <div className="editor">
      <div className="editor-tabs" role="tablist" aria-label="Specification scenarios">
        {scenarios.map((scenario, i) => (
          <button
            key={scenario.index}
            type="button"
            role="tab"
            id={`spec-tab-${scenario.index}`}
            aria-selected={i === index}
            tabIndex={i === index ? 0 : -1}
            className="editor-tab"
            onClick={() => load(i)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
              event.preventDefault();
              const next =
                event.key === 'ArrowRight'
                  ? (index + 1) % scenarios.length
                  : (index - 1 + scenarios.length) % scenarios.length;
              load(next);
              document.getElementById(`spec-tab-${scenarios[next]?.index}`)?.focus();
            }}
          >
            <span className="idx">{String(scenario.index).padStart(2, '0')}</span> {scenario.title}
          </button>
        ))}
      </div>

      <div className="editor-panes">
        {/* ── the spec, editable ─────────────────────────────────────── */}
        <div className="editor-pane">
          <div className="pane-head">
            <span className="src">{t.specHead}</span>
            {dirty ? (
              <button type="button" className="mini-btn" onClick={() => load(index)}>
                {t.reset}
              </button>
            ) : null}
          </div>

          <div className="editor-fields">
            <label className="field">
              <span>{t.role}</span>
              <input
                value={draft.role}
                spellCheck={false}
                onChange={(event) => edit(setRole(draft, event.target.value))}
                aria-invalid={check.errors.some((e) => e.startsWith('role'))}
              />
            </label>

            <label className="field">
              <span>{t.operation}</span>
              <input
                value={draft.operation}
                spellCheck={false}
                onChange={(event) => edit(setOperation(draft, event.target.value))}
                aria-invalid={check.errors.some((e) => e.startsWith('operation'))}
              />
            </label>

            <div className="field-group">
              <span className="field-legend">{t.assertions}</span>
              {draft.assertions.map((assertion, i) => (
                <AssertionRow
                  key={i}
                  assertion={assertion}
                  canRemove={draft.assertions.length > 0}
                  onChange={(next) => edit(setAssertion(draft, i, next))}
                  onRemove={() => edit(removeAssertion(draft, i))}
                  kinds={t.kinds}
                />
              ))}
              {draft.assertions.length === 0 ? (
                <p className="field-empty">{t.empty}</p>
              ) : null}
            </div>
          </div>

          <div className="pane-preview">
            <pre>{spec ?? t.specInvalid}</pre>
          </div>
        </div>

        {/* ── the compiled output ────────────────────────────────────── */}
        <div className="editor-pane">
          <div className="pane-head">
            <span className={check.ok ? 'out' : 'bad'}>
              {check.ok ? t.outHead : t.failHead}
            </span>
            <span className={`badge ${check.ok ? 'is-ok' : 'is-bad'}`}>
              {check.ok ? t.compiles : t.blocked}
            </span>
          </div>

          <div className="pane-output">
            {check.ok && compiled ? (
              <pre key={compiled}>
                <Code source={compiled} />
              </pre>
            ) : (
              <div className="validate-fail">
                <p className="validate-lead">{t.invalidLead}</p>
                <ul>
                  {check.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="editor-foot">
        <b>{dirty ? t.edited : t.proves}</b>
        {dirty ? t.editedText : scenarios[index]?.proves}
      </p>
    </div>
  );
}

function AssertionRow({
  assertion,
  canRemove,
  onChange,
  onRemove,
  kinds,
}: {
  assertion: Assertion;
  canRemove: boolean;
  onChange: (next: Assertion) => void;
  onRemove: () => void;
  kinds: Content['home']['editor']['kinds'];
}) {
  return (
    <div className="assertion">
      <select
        aria-label="Assertion kind"
        value={assertion.kind}
        onChange={(event) =>
          onChange(changeAssertionKind(assertion, event.target.value as Assertion['kind']))
        }
      >
        {ASSERTION_KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {kinds[kind]}
          </option>
        ))}
      </select>

      {assertion.kind === 'excludesItem' || assertion.kind === 'includesItem' ? (
        <>
          <input
            aria-label="Field"
            value={assertion.field}
            spellCheck={false}
            onChange={(event) => onChange({ ...assertion, field: event.target.value })}
          />
          <input
            aria-label="Equals"
            value={assertion.equals}
            spellCheck={false}
            onChange={(event) => onChange({ ...assertion, equals: event.target.value })}
          />
        </>
      ) : null}

      {assertion.kind === 'fieldEquals' ? (
        <>
          <input
            aria-label="Path"
            value={assertion.path}
            spellCheck={false}
            onChange={(event) => onChange({ ...assertion, path: event.target.value })}
          />
          <input
            aria-label="Value"
            value={assertion.value}
            spellCheck={false}
            onChange={(event) => onChange({ ...assertion, value: event.target.value })}
          />
        </>
      ) : null}

      {assertion.kind === 'rejectedWith' ? (
        <input
          aria-label="Error"
          value={assertion.error}
          spellCheck={false}
          onChange={(event) => onChange({ ...assertion, error: event.target.value })}
        />
      ) : null}

      {canRemove ? (
        <button type="button" className="mini-btn" onClick={onRemove} aria-label="Remove assertion">
          ×
        </button>
      ) : null}
    </div>
  );
}
