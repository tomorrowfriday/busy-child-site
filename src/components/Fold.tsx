import type { ReactNode } from 'react';

/**
 * The cascade: a page you read at a glance and unfold where it matters.
 *
 * This is the site's own argument applied to itself. A specification is a
 * short readable document that expands into the detail underneath it, so the
 * home page is folded the same way — every claim is one scannable line, and
 * the detail is one click down rather than one scroll away.
 *
 * The closed row carries the payload: the domain it belongs to, the claim,
 * and the number that backs it. Folded state is an index, not a teaser.
 *
 * Native `<details>` on purpose. It reads with JavaScript off, answers the
 * keyboard and the screen reader without being told to, and ships no client
 * bundle — the same bar the rest of the site is held to.
 */
export function Folds({ children }: { children: ReactNode }) {
  return <div className="folds">{children}</div>;
}

export function Fold({
  /**
   * Rows sharing a group open one at a time, so a section never grows back
   * into the wall of prose this replaced. Browsers without `name` support
   * simply allow several open at once.
   */
  group,
  claim,
  eyebrow,
  figure,
  figureCaption,
  badge,
  /**
   * Renders the claim as the section's heading. Used where the fold is the
   * section — the title belongs in the summary rather than printed twice.
   */
  heading = false,
  open = false,
  children,
}: {
  group: string;
  claim: string;
  eyebrow?: string;
  figure?: string;
  figureCaption?: string;
  badge?: string;
  heading?: boolean;
  open?: boolean;
  children: ReactNode;
}) {
  const Claim = heading ? 'h2' : 'span';

  return (
    <details className="fold" name={group} open={open}>
      <summary>
        <span className="fold-mark" aria-hidden="true" />
        <span className="fold-head">
          {eyebrow ? <span className="domain">{eyebrow}</span> : null}
          <Claim className="fold-claim">
            {claim}
            {/* The space keeps the badge a separate word when the heading is
                read aloud, rather than "…specification.live". */}
            {badge ? <> <b className="fold-badge">{badge}</b></> : null}
          </Claim>
        </span>
        {figure ? (
          <span className="fold-figure">
            {figure}
            {figureCaption ? <small>{figureCaption}</small> : null}
          </span>
        ) : null}
      </summary>
      <div className="fold-body">{children}</div>
    </details>
  );
}
