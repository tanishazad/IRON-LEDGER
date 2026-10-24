import { Link } from 'react-router-dom';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/routines', label: 'Routines' },
  { to: '/log', label: 'Log Workout' },
  { to: '/progress', label: 'Progress' },
  { to: '/explore', label: 'Explore' },
];

/** Site footer. `compact` = slim one-line version for the login/register/404 screens. */
export default function Footer({ compact = false }) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="site-footer compact">
        <span>
          © {year} Iron<b>Ledger</b> · <a href="mailto:ironledger@gmail.com">ironledger@gmail.com</a>
        </span>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="brand">
            Iron<span>Ledger</span>
          </div>
          <p>Log it. Lift it. Track it. A personal workout tracker for your routines, sessions and progress.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <h2>Pages</h2>
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="footer-links">
          <h2>Built with</h2>
          <span>React · Redux Toolkit</span>
          <span>Chart.js · Axios</span>
          <a href="https://wger.de" target="_blank" rel="noreferrer">
            Exercise data: wger.de
          </a>
          <h2 className="footer-contact-h">Contact</h2>
          <a href="mailto:ironledger@gmail.com">ironledger@gmail.com</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {year} IronLedger. All rights reserved.</span>
        <span>Your data stays in your browser.</span>
      </div>
    </footer>
  );
}
