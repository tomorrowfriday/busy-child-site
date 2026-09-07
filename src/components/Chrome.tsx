import { Link } from '@/components/Link';
import { nav, site } from '@/content/site';

export function Masthead({ current }: { current?: string }) {
  return (
    <header className="masthead">
      <div className="wrap">
        <Link className="wordmark" href="/">
          {site.wordmark}
        </Link>
        <nav className="nav" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="col">
          <Link className="wordmark" href="/">
            {site.wordmark}
          </Link>
          <span className="meta">{site.tagline}</span>
        </div>
        <div className="col">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="col">
          <a href={site.upwork}>Upwork</a>
          <span className="meta">Same-business-day reply</span>
        </div>
      </div>
    </footer>
  );
}
