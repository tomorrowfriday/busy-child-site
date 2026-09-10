import type { ReactNode } from 'react';
import { tokenize } from '@/lib/compile';
import type { Bullet, Gate, Literal, Outcome, Step } from '@/content/schema';

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

export function Literals({ items }: { items: readonly Literal[] }) {
  return (
    <div className="literals">
      {items.map((literal) => (
        <div className="literal" key={literal.value}>
          <b>{literal.value}</b>
          <span>{literal.caption}</span>
        </div>
      ))}
    </div>
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

export function GateTable({ gates }: { gates: readonly Gate[] }) {
  return (
    <div className="table-wrap">
      <table>
        <tbody>
          {gates.map((gate) => (
            <tr key={gate.gate}>
              <td className="gate">{gate.isCommand ? <code>{gate.gate}</code> : gate.gate}</td>
              <td>{gate.catches}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Renders source through the tokenizer so specimens are highlighted, not plain. */
export function Code({ source }: { source: string }) {
  return (
    <>
      {tokenize(source).map((token, index) =>
        token.kind === 'plain' ? (
          <span key={index}>{token.text}</span>
        ) : (
          <span key={index} className={`tok-${token.kind}`}>
            {token.text}
          </span>
        ),
      )}
    </>
  );
}

export function Specimen({ source }: { source: string }) {
  return (
    <div className="specimen">
      <pre>
        <Code source={source} />
      </pre>
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
