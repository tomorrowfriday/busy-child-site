import type { ReactNode } from 'react';
import { literals } from '@/content/site';
import { tokenize } from '@/lib/compile';

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

export function Literals() {
  return (
    <div className="literals">
      {literals.map((literal) => (
        <div className="literal" key={literal.value}>
          <b>{literal.value}</b>
          <span>{literal.caption}</span>
        </div>
      ))}
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

export function Steps({ items }: { items: readonly { title: string; detail: string }[] }) {
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
