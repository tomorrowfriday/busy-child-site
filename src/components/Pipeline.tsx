'use client';

import { useEffect, useRef, useState } from 'react';
import type { Content } from '@/content/schema';

/**
 * The pipeline, drawn rather than described.
 *
 * Stages illuminate in order as the diagram scrolls into view. It runs once — a
 * diagram that loops forever is wallpaper, and stops being read. Anyone who
 * asked for reduced motion gets the finished state immediately.
 */

const X = [8, 190, 360, 530, 700] as const;
const COUNT = X.length;
const BOX_W = 132;
const BOX_H = 56;
const ROW_Y = 46;
const MID = ROW_Y + BOX_H / 2;

type Labels = Content['methodPage']['pipelineLabels'];

export function Pipeline({ t }: { t: Labels }) {
  const [lit, setLit] = useState(-1);
  const ref = useRef<SVGSVGElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stages = [
    { id: 'spec', x: X[0], label: t.spec, sub: t.specSub },
    { id: 'validate', x: X[1], label: t.validate, sub: t.validateSub },
    { id: 'build', x: X[2], label: t.build, sub: t.buildSub },
    { id: 'agent', x: X[3], label: t.agent, sub: t.agentSub },
    { id: 'gates', x: X[4], label: t.gates, sub: t.gatesSub },
  ];

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = () => setLit(COUNT);

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

        for (let i = 0; i < COUNT; i += 1) {
          timers.current.push(setTimeout(() => setLit(i), 220 * i));
        }
        timers.current.push(setTimeout(finish, 220 * COUNT));
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

  const done = lit >= COUNT;

  return (
    <div className="pipeline">
      <svg ref={ref} viewBox="0 0 840 168" className="pipeline-svg" role="img" aria-label={t.alt}>
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

        {stages.slice(0, -1).map((stage, i) => (
          <line
            key={`link-${stage.id}`}
            x1={stage.x + BOX_W}
            y1={MID}
            x2={X[i + 1]! - 4}
            y2={MID}
            className={`pipe-link ${lit > i ? 'is-lit' : ''}`}
            markerEnd="url(#pipeline-arrow)"
          />
        ))}

        <line
          x1={X[4] + BOX_W}
          y1={MID}
          x2={824}
          y2={MID}
          className={`pipe-link ${done ? 'is-lit' : ''}`}
          markerEnd="url(#pipeline-arrow)"
        />
        <text x={790} y={MID - 12} className={`pipe-ship ${done ? 'is-lit' : ''}`}>
          {t.ship}
        </text>

        {/* repair loop: gates back to agent */}
        <path
          d={`M ${X[4] + BOX_W / 2} ${ROW_Y + BOX_H}
              L ${X[4] + BOX_W / 2} 138
              L ${X[3] + BOX_W / 2} 138
              L ${X[3] + BOX_W / 2} ${ROW_Y + BOX_H + 4}`}
          className={`pipe-repair ${done ? 'is-lit' : ''}`}
          markerEnd="url(#pipeline-arrow)"
          fill="none"
        />
        <text
          x={(X[3] + X[4]) / 2 + BOX_W / 2}
          y={132}
          textAnchor="middle"
          className={`pipe-caption ${done ? 'is-lit' : ''}`}
        >
          {t.repair}
        </text>

        {stages.map((stage, i) => (
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

        <text x={8} y={26} className={`pipe-caption ${lit >= 0 ? 'is-lit' : ''}`}>
          {t.humanApproved}
        </text>
      </svg>
    </div>
  );
}
