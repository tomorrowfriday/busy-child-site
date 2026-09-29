/**
 * The deck's motion, as data.
 *
 * Ten screens stacked on one stage. Only the outgoing and incoming screens are
 * ever painted; everything else is hidden, so the browser is compositing two
 * layers rather than ten. A screen arrives with its own motion and leaves the
 * same way every time — shrunk and dimmed — because the eye needs one fixed
 * thing to read the direction of travel against.
 *
 * Nothing here touches the DOM: the component renders what these functions
 * decide, which is the only reason any of it can be tested.
 */

export type Phase = 'pre' | 'run';

export type Motion = 'none' | 'up' | 'left' | 'right' | 'rotate' | 'clip' | 'zoom' | 'fade';

export interface ScreenStyle {
  transform: string;
  opacity: number;
  clipPath: string;
  transition: string;
  zIndex: number;
  visibility: 'visible' | 'hidden';
  transformOrigin: string;
}

/** Where a screen starts before it slides into place. */
const FROM: Record<Motion, { tf: string; op?: number; clip?: string; to?: string }> = {
  none: { tf: 'none' },
  up: { tf: 'translate3d(0,100%,0)' },
  left: { tf: 'translate3d(100%,0,0)' },
  right: { tf: 'translate3d(-100%,0,0)' },
  rotate: { tf: 'translate3d(18%,85%,0) rotate(16deg)', to: '0% 100%' },
  clip: { tf: 'none', clip: 'inset(42% 42% 42% 42% round 48px)' },
  zoom: { tf: 'scale(1.35)', op: 0 },
  fade: { tf: 'translate3d(0,24px,0)', op: 0 },
};

/** One motion per screen, in order. */
export const SCREEN_MOTIONS: readonly Motion[] = [
  'none',
  'up',
  'left',
  'rotate',
  'clip',
  'zoom',
  'up',
  'fade',
  'right',
  'zoom',
];

export const SCREEN_COUNT = SCREEN_MOTIONS.length;

/** The last screen is the inverted contact card. */
export const DARK_SCREEN = SCREEN_COUNT - 1;

/** Index of each screen that is a project, in rail order. */
export const FIRST_PROJECT = 2;
export const PROJECT_COUNT = 4;

export const DURATION_MS = 950;

const EASE = 'cubic-bezier(.7,0,.2,1)';

const AT_REST: ScreenStyle = {
  transform: 'none',
  opacity: 1,
  clipPath: 'inset(0% 0% 0% 0% round 0px)',
  transition: 'none',
  zIndex: 0,
  visibility: 'hidden',
  transformOrigin: '50% 50%',
};

/**
 * The style for one screen.
 *
 * `pre` is the frame before the transition: the incoming screen is placed at
 * its starting position with transitions off, so the browser has something to
 * animate away from. `run` is everything after.
 */
export function screenStyle(
  index: number,
  current: number,
  previous: number | null,
  phase: Phase,
  reduced: boolean,
): ScreenStyle {
  const ms = reduced ? 0 : DURATION_MS;
  const transition = `transform ${ms}ms ${EASE}, opacity ${ms}ms ${EASE}, clip-path ${ms}ms ${EASE}`;
  const from = FROM[SCREEN_MOTIONS[index] ?? 'up'];

  if (index === current) {
    const live = { ...AT_REST, zIndex: 3, visibility: 'visible' as const };
    if (phase === 'pre' && previous !== null) {
      return {
        ...live,
        transform: from.tf,
        opacity: from.op ?? 1,
        clipPath: from.clip ?? 'inset(0% 0% 0% 0% round 36px)',
        transformOrigin: from.to ?? '50% 50%',
      };
    }
    return { ...live, transition, transformOrigin: from.to ?? '50% 50%' };
  }

  if (index === previous) {
    const leaving = { ...AT_REST, zIndex: 2, visibility: 'visible' as const };
    if (phase === 'pre') return leaving;
    return { ...leaving, transform: 'scale(.9)', opacity: 0.25, transition };
  }

  return AT_REST;
}

/** How far through the deck, as a CSS width. */
export function progress(current: number, total: number = SCREEN_COUNT): string {
  return `${((current + 1) / total) * 100}%`;
}

/** The four project screens collapse into one top-menu entry. */
export function groupOf(screen: number): number {
  return screen >= 1 && screen <= FIRST_PROJECT + PROJECT_COUNT - 1 ? 1 : screen;
}

/** Whether a move is worth making at all. */
export function canGo(target: number, current: number, locked: boolean): boolean {
  if (locked) return false;
  if (target === current) return false;
  return target >= 0 && target < SCREEN_COUNT;
}

/** Zero-padded screen counter, e.g. "03 / 10". */
export function runState(current: number, total: number = SCREEN_COUNT): string {
  return `${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}

/** Wrap a project index when the sheet steps past either end. */
export function stepCase(index: number, delta: number, count: number = PROJECT_COUNT): number {
  return (index + delta + count) % count;
}
