import { describe, expect, it } from 'vitest';
import {
  canGo,
  DARK_SCREEN,
  DURATION_MS,
  groupOf,
  METHOD_SCREEN,
  progress,
  runState,
  screenStyle,
  SCREEN_COUNT,
  SCREEN_MOTIONS,
  stepCase,
} from '@/lib/deck';

/**
 * The deck's motion is a pure function of (screen, current, previous, phase),
 * so the thing that is easy to get wrong — which layer is painted, and what it
 * is animating from — can be asserted without a browser.
 */

describe('the screen table', () => {
  it('has one motion per screen', () => {
    expect(SCREEN_MOTIONS).toHaveLength(SCREEN_COUNT);
    expect(SCREEN_COUNT).toBe(10);
  });

  it('opens without motion, so the first paint is not animated', () => {
    expect(SCREEN_MOTIONS[0]).toBe('none');
  });

  it('puts the inverted screen last', () => {
    expect(DARK_SCREEN).toBe(SCREEN_COUNT - 1);
  });
});

describe('screenStyle', () => {
  it('hides every screen that is neither current nor previous', () => {
    const style = screenStyle(5, 0, null, 'run', false);
    expect(style.visibility).toBe('hidden');
    expect(style.zIndex).toBe(0);
    expect(style.transition).toBe('none');
  });

  it('paints the current screen above the outgoing one', () => {
    const incoming = screenStyle(1, 1, 0, 'run', false);
    const outgoing = screenStyle(0, 1, 0, 'run', false);
    expect(incoming.zIndex).toBeGreaterThan(outgoing.zIndex);
    expect(incoming.visibility).toBe('visible');
    expect(outgoing.visibility).toBe('visible');
  });

  it('places the incoming screen at its start position during pre', () => {
    // Screen 1 arrives from below.
    const style = screenStyle(1, 1, 0, 'pre', false);
    expect(style.transform).toBe('translate3d(0,100%,0)');
    expect(style.transition).toBe('none');
  });

  it('releases the incoming screen to rest during run', () => {
    const style = screenStyle(1, 1, 0, 'run', false);
    expect(style.transform).toBe('none');
    expect(style.transition).toContain(`${DURATION_MS}ms`);
  });

  it('does not pre-place the very first screen, which has no predecessor', () => {
    const style = screenStyle(0, 0, null, 'pre', false);
    expect(style.transform).toBe('none');
    expect(style.opacity).toBe(1);
  });

  it('carries a motion that fades in with opacity 0', () => {
    // Screen 7 uses 'fade'.
    const style = screenStyle(7, 7, 6, 'pre', false);
    expect(style.opacity).toBe(0);
  });

  it('carries a motion that clips in', () => {
    // Screen 4 uses 'clip'.
    const style = screenStyle(4, 4, 3, 'pre', false);
    expect(style.clipPath).toContain('42%');
  });

  it('carries a motion with its own transform origin', () => {
    // Screen 3 uses 'rotate', which pivots on its bottom-left corner.
    const style = screenStyle(3, 3, 2, 'pre', false);
    expect(style.transformOrigin).toBe('0% 100%');
    expect(screenStyle(3, 3, 2, 'run', false).transformOrigin).toBe('0% 100%');
  });

  it('holds the outgoing screen still for one frame, then shrinks it', () => {
    expect(screenStyle(0, 1, 0, 'pre', false).transform).toBe('none');
    const running = screenStyle(0, 1, 0, 'run', false);
    expect(running.transform).toBe('scale(.9)');
    expect(running.opacity).toBe(0.25);
  });

  it('collapses every duration to zero when motion is reduced', () => {
    expect(screenStyle(1, 1, 0, 'run', true).transition).toContain('0ms');
    expect(screenStyle(0, 1, 0, 'run', true).transition).toContain('0ms');
  });

  it('falls back to the default motion for an index past the table', () => {
    const style = screenStyle(99, 99, 0, 'pre', false);
    expect(style.transform).toBe('translate3d(0,100%,0)');
  });
});

describe('progress and counters', () => {
  it('reads as a percentage of the whole deck', () => {
    expect(progress(0, 10)).toBe('10%');
    expect(progress(9, 10)).toBe('100%');
  });

  it('defaults to the deck it ships with', () => {
    expect(progress(SCREEN_COUNT - 1)).toBe('100%');
  });

  it('zero-pads the run state', () => {
    expect(runState(0, 10)).toBe('01 / 10');
    expect(runState(9)).toBe('10 / 10');
  });
});

describe('groupOf', () => {
  it('folds the four project screens under the work entry', () => {
    expect(groupOf(1)).toBe(1);
    expect(groupOf(2)).toBe(1);
    expect(groupOf(5)).toBe(1);
  });

  it('leaves every other screen as itself', () => {
    expect(groupOf(0)).toBe(0);
    expect(groupOf(6)).toBe(6);
    expect(groupOf(9)).toBe(9);
  });
});

describe('canGo', () => {
  it('refuses while a transition or sheet holds the deck', () => {
    expect(canGo(2, 1, true)).toBe(false);
  });

  it('refuses a move to where it already is', () => {
    expect(canGo(1, 1, false)).toBe(false);
  });

  it('refuses to run off either end', () => {
    expect(canGo(-1, 0, false)).toBe(false);
    expect(canGo(SCREEN_COUNT, SCREEN_COUNT - 1, false)).toBe(false);
  });

  it('allows an ordinary move', () => {
    expect(canGo(2, 1, false)).toBe(true);
  });
});

describe('stepCase', () => {
  it('wraps past the end and before the start', () => {
    expect(stepCase(3, 1, 4)).toBe(0);
    expect(stepCase(0, -1, 4)).toBe(3);
  });

  it('defaults to the four projects', () => {
    expect(stepCase(3, 1)).toBe(0);
  });
});

describe('METHOD_SCREEN', () => {
  it('points at a screen that exists, so the sheet can borrow its menu label', () => {
    expect(METHOD_SCREEN).toBeGreaterThanOrEqual(0);
    expect(METHOD_SCREEN).toBeLessThan(SCREEN_COUNT);
  });
});
