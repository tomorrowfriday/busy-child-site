'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The pipeline, drawn rather than described.
 *
 * Stages illuminate in order as the diagram scrolls into view, and a token
 * travels the path so the direction of flow is unambiguous. It runs once — a
 * diagram that loops forever is wallpaper, and stops being read. Anyone who
 * asked for reduced motion gets the finished state immediately.
 */

const STAGES = [
  { id: 'spec', x: 8, label: 'spec/', sub: 'plain English' },
  { id: 'validate', x: 190, label: 'validate', sub: 'consistency' },
  { id: 'build', x: 360, label: 'build', sub: '~60% generated' },
  { id: 'agent', x: 530, label: 'agent', sub: '~40% written' },
  { id: 'gates', x: 700, label: 'gates', sub: '8 checks' },
] as const;

const BOX_W = 132;
const BOX_H = 56;
const ROW_Y = 46;

export function Pipeline() {
  const [lit, setLit] = useState(-1);
  const ref = useRef<SVGSVGElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = () => setLit(STAGES.length);

    // No observer available: show the finished diagram rather than a blank one.
    // Deferred rather than called here, so state never changes synchronously
    // inside the effect body.
    if (!('IntersectionObserver' in window)) {
      const fallback = setTimeout(finish, 0);
      return () => clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();

        if (reduced) {
          finish();
          return;
        }

        STAGES.forEach((_, i) => {
          timers.current.push(setTimeout(() => setLit(i), 220 * i));
        });
        timers.current.push(
          setTimeout(() => setLit(STAGES.length), 220 * STAGES.length),
        );
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    // Mount-only: the effect must not re-run, or its cleanup would clear the
    // stagger timers it just scheduled.
    const pending = timers.current;
    return () => {
      observer.disconnect();
      pending.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="pipeline">
      <svg
        ref={ref}
        viewBox="0 0 840 168"
        className="pipeline-svg"
        role="img"
        aria-label="Pipeline: a specification is validated, compiled into roughly 60% generated code, completed by an agent, then verified by eight gates before shipping. A failing gate returns to the agent as a repair loop."
      >
        <defs>
          <marker
            id="pipeline-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="pipe-arrowhead" />
          </marker>
        </defs>

        {/* connectors */}
        {STAGES.slice(0, -1).map((stage, i) => {
          const from = stage.x + BOX_W;
          const to = STAGES[i + 1]!.x;
          return (
            <line
              key={`link-${stage.id}`}
              x1={from}
              y1={ROW_Y + BOX_H / 2}
              x2={to - 4}
              y2={ROW_Y + BOX_H / 2}
              className={`pipe-link ${lit > i ? 'is-lit' : ''}`}
              markerEnd="url(#pipeline-arrow)"
            />
          );
        })}

        {/* ship */}
        <line
          x1={STAGES[4]!.x + BOX_W}
          y1={ROW_Y + BOX_H / 2}
          x2={824}
          y2={ROW_Y + BOX_H / 2}
          className={`pipe-link ${lit >= STAGES.length ? 'is-lit' : ''}`}
          markerEnd="url(#pipeline-arrow)"
        />
        <text
          x={790}
          y={ROW_Y + BOX_H / 2 - 12}
          className={`pipe-ship ${lit >= STAGES.length ? 'is-lit' : ''}`}
        >
          ship
        </text>

        {/* repair loop: gates back to agent */}
        <path
          d={`M ${STAGES[4]!.x + BOX_W / 2} ${ROW_Y + BOX_H}
              L ${STAGES[4]!.x + BOX_W / 2} 138
              L ${STAGES[3]!.x + BOX_W / 2} 138
              L ${STAGES[3]!.x + BOX_W / 2} ${ROW_Y + BOX_H + 4}`}
          className={`pipe-repair ${lit >= STAGES.length ? 'is-lit' : ''}`}
          markerEnd="url(#pipeline-arrow)"
          fill="none"
        />
        <text
          x={(STAGES[3]!.x + STAGES[4]!.x) / 2 + BOX_W / 2}
          y={132}
          textAnchor="middle"
          className={`pipe-caption ${lit >= STAGES.length ? 'is-lit' : ''}`}
        >
          repair loop
        </text>

        {/* stages */}
        {STAGES.map((stage, i) => (
          <g key={stage.id} className={`pipe-stage ${lit >= i ? 'is-lit' : ''}`}>
            <rect x={stage.x} y={ROW_Y} width={BOX_W} height={BOX_H} rx={2} className="pipe-box" />
            <text x={stage.x + 14} y={ROW_Y + 24} className="pipe-label">
              {stage.label}
            </text>
            <text x={stage.x + 14} y={ROW_Y + 42} className="pipe-sub">
              {stage.sub}
            </text>
          </g>
        ))}

        {/* the human gate, above the spec */}
        <text x={8} y={26} className={`pipe-caption ${lit >= 0 ? 'is-lit' : ''}`}>
          human-approved
        </text>
      </svg>
    </div>
  );
}
