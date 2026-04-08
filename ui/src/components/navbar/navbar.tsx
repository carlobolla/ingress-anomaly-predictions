import { useState } from 'react';
import TelegramLogin from './telegram-login';
import NavbarLink from './navbar-link';
import { Link } from "react-router";
import useAuth from '@/hooks/use_auth';

const NAV_LINKS = [
  { text: 'Home', href: '/' },
  { text: 'Leaderboard', href: '/leaderboard', authRequired: true },
  { text: 'Scoring', href: '/scoring' },
];

const SiteNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <nav className="w-full border-b border-separator bg-background/70">
      <header className="flex h-16 items-center justify-between px-6 mx-auto">
        <div className="flex items-center gap-2">
          <button
            className="sm:hidden p-1"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? (
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <Link to="/"><p className="font-bold text-white">@IUENG</p></Link>
        </div>
        <ul className="hidden sm:flex items-center gap-4">
          {NAV_LINKS.map(link => { return link.authRequired ? isAuthenticated && <NavbarLink key={link.href} text={link.text} href={link.href} /> : <NavbarLink key={link.href} text={link.text} href={link.href} />; })}
        </ul>
        <div>
          <TelegramLogin />
        </div>
      </header>
      <div
        className={`sm:hidden grid transition-all duration-200 ease-in-out ${
          menuOpen ? 'grid-rows-[1fr] opacity-100 border-t border-separator' : 'grid-rows-[0fr] opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        <ul className="flex flex-col px-6 py-3 overflow-hidden" onClick={() => setMenuOpen(false)}>
          {NAV_LINKS.map(link => { return link.authRequired ? isAuthenticated && <NavbarLink key={link.href} text={link.text} href={link.href} /> : <NavbarLink key={link.href} text={link.text} href={link.href} />; })}
        </ul>
      </div>
    </nav>
  );
}

export default SiteNavbar;
