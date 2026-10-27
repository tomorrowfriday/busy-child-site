import type { ReactNode } from 'react';
import type { Bullet, Outcome, Step } from '@/content/schema';

export function Section({
  id,
  marker,
  children,
  hero = false,
  reveal = true,
}: {
  id?: string;
  marker?: string;
  children: ReactNode;
  hero?: boolean;
  /** The hero is above the fold, so it never animates in. */
  reveal?: boolean;
}) {
  const classes = ['section', hero ? 'hero' : '', reveal && !hero ? 'reveal' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} id={id}>
      <div className="wrap">
        {marker ? <p className="marker">{`// ${marker}`}</p> : null}
        {children}
      </div>
    </section>
  );
}

export function Bullets({ items }: { items: readonly Bullet[] }) {
  return (
    <ul className="dash">
      {items.map((bullet) => (
        <li key={bullet.text}>
          {bullet.strong ? <strong>{bullet.strong}</strong> : null}
          {bullet.strong ? ' ' : null}
          {bullet.text}
        </li>
      ))}
    </ul>
  );
}

export function Note({ tag, text }: { tag: string; text: string }) {
  return (
    <div className="note">
      <span className="tag">{tag}</span>
      <p>{text}</p>
    </div>
  );
}

/** What a client gets, in an owner's language rather than an engineer's. */
export function Outcomes({ items }: { items: readonly Outcome[] }) {
  return (
    <div className="outcomes">
      {items.map((item) => (
        <article className="outcome" key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.detail}</p>
          {item.proof ? (
            <div className="outcome-proof">
              <b>{item.proof}</b>
              <span>{item.proofCaption}</span>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function Steps({ items }: { items: readonly Step[] }) {
  return (
    <div className="steps">
      {items.map((item, index) => (
        <div className="step" key={item.title}>
          <span className="i">{String(index + 1).padStart(2, '0')}</span>
          <h3>{item.title}</h3>
          <p>{item.detail}</p>
        </div>
      ))}
    </div>
  );
}
