'use client';

import { useMemo, useState } from 'react';
import { compileScenario, renderSpec } from '@/lib/compile';
import {
  ASSERTION_KINDS,
  ASSERTION_LABELS,
  changeAssertionKind,
  checkScenario,
  removeAssertion,
  setAssertion,
  setOperation,
  setRole,
} from '@/lib/scenarioEdit';
import type { Assertion, Scenario } from '@/content/schema';
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
export function SpecEditor({ scenarios }: { scenarios: readonly Scenario[] }) {
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
            <span className="src">docs/spec/ — edit me</span>
            {dirty ? (
              <button type="button" className="mini-btn" onClick={() => load(index)}>
                Reset
              </button>
            ) : null}
          </div>

          <div className="editor-fields">
            <label className="field">
              <span>Role</span>
              <input
                value={draft.role}
                spellCheck={false}
                onChange={(event) => edit(setRole(draft, event.target.value))}
                aria-invalid={check.errors.some((e) => e.startsWith('role'))}
              />
            </label>

            <label className="field">
              <span>Operation</span>
              <input
                value={draft.operation}
                spellCheck={false}
                onChange={(event) => edit(setOperation(draft, event.target.value))}
                aria-invalid={check.errors.some((e) => e.startsWith('operation'))}
              />
            </label>

            <div className="field-group">
              <span className="field-legend">Assertions</span>
              {draft.assertions.map((assertion, i) => (
                <AssertionRow
                  key={i}
                  assertion={assertion}
                  canRemove={draft.assertions.length > 0}
                  onChange={(next) => edit(setAssertion(draft, i, next))}
                  onRemove={() => edit(removeAssertion(draft, i))}
                />
              ))}
              {draft.assertions.length === 0 ? (
                <p className="field-empty">
                  No assertions. A scenario that asserts nothing proves nothing.
                </p>
              ) : null}
            </div>
          </div>

          <div className="pane-preview">
            <pre>{spec ?? '— spec invalid —'}</pre>
          </div>
        </div>

        {/* ── the compiled output ────────────────────────────────────── */}
        <div className="editor-pane">
          <div className="pane-head">
            <span className={check.ok ? 'out' : 'bad'}>
              {check.ok ? 'generated — never edited' : 'composer validate — failed'}
            </span>
            <span className={`badge ${check.ok ? 'is-ok' : 'is-bad'}`}>
              {check.ok ? 'compiles' : 'blocked'}
            </span>
          </div>

          <div className="pane-output">
            {check.ok && compiled ? (
              <pre key={compiled}>
                <Code source={compiled} />
              </pre>
            ) : (
              <div className="validate-fail">
                <p className="validate-lead">
                  Nothing is generated. The build stops here rather than emitting a test that
                  doesn&apos;t match the spec.
                </p>
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
        <b>{dirty ? 'Edited' : 'Proves'}</b>
        {dirty
          ? 'You changed the spec and the test changed with it — that is the only way to change what is verified.'
          : scenarios[index]?.proves}
      </p>
    </div>
  );
}

function AssertionRow({
  assertion,
  canRemove,
  onChange,
  onRemove,
}: {
  assertion: Assertion;
  canRemove: boolean;
  onChange: (next: Assertion) => void;
  onRemove: () => void;
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
            {ASSERTION_LABELS[kind]}
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
