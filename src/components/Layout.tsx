import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import wordmarkUrl from '../assets/salvium-wordmark.svg';

interface LayoutProps {
  children: React.ReactNode;
  live?: boolean | null;
}

interface DropdownItem {
  label: string;
  href: string;
  external?: boolean;
}

interface DropdownGroup {
  label: string;
  items: DropdownItem[];
}

const NAV_GROUPS: DropdownGroup[] = [
  {
    label: 'Get Started',
    items: [
      { label: 'Exchanges',  href: 'https://salvium.io/exchanges' },
      { label: 'About',      href: 'https://salvium.io/about' },
      { label: 'Papers',     href: 'https://salvium.io/papers' },
      { label: 'Downloads',  href: 'https://salvium.io/download' },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { label: 'Blog',           href: 'https://salvium.io/blog' },
      { label: 'FAQ',            href: 'https://salvium.io/faq' },
      { label: 'Knowledge Base', href: 'https://salvium.github.io/salvium_docs/', external: true },
      { label: 'Roadmap',        href: 'https://salvium.io/roadmap' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Tools Overview', href: 'https://salvium.io/tools' },
      { label: 'Mining Pools',   href: 'https://salvium.io/pools' },
      { label: 'Statistics',     href: 'https://salvium.io/stats' },
      { label: 'RWA Demo',       href: '/', internal: true } as DropdownItem & { internal?: boolean },
    ],
  },
  {
    label: 'Get Involved',
    items: [
      { label: 'Community', href: 'https://salvium.io/community' },
      { label: 'GitHub',    href: 'https://github.com/salvium', external: true },
    ],
  },
];

function NavDropdown({ group }: { group: DropdownGroup & { items: (DropdownItem & { internal?: boolean })[] } }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex items-center space-x-1 transition-colors"
        style={{ color: '#40E0D0', fontFamily: 'var(--font-heading, "Josefin Sans", sans-serif)' }}
        onClick={() => setOpen(o => !o)}
      >
        <span>{group.label}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 w-48 rounded-lg shadow-xl z-50 py-2"
          style={{ background: 'rgba(30, 30, 30, 0.98)' }}
        >
          {group.items.map(item =>
            (item as DropdownItem & { internal?: boolean }).internal ? (
              <Link
                key={item.label}
                to="/"
                className="block px-4 py-2.5 transition-all duration-200 hover:bg-[#40E0D0]/10"
                style={{ color: '#40E0D0', fontFamily: 'var(--font-heading, "Josefin Sans", sans-serif)' }}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className="block px-4 py-2.5 transition-all duration-200 hover:bg-[#40E0D0]/10"
                style={{ color: '#40E0D0', fontFamily: 'var(--font-heading, "Josefin Sans", sans-serif)' }}
              >
                {item.label}
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children, live }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#1e1e1e', color: '#e0e0e0' }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav
        className="fixed w-full z-50 h-16"
        style={{ background: 'rgba(30, 30, 30, 0.98)', backdropFilter: 'blur(8px)' }}
      >
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">

            {/* Logo + demo label */}
            <a href="https://salvium.io" className="flex items-center gap-3">
              <img src={wordmarkUrl} alt="Salvium" className="w-24 h-auto" />
              <span
                className="hidden sm:block text-xs tracking-widest uppercase border-l pl-3"
                style={{
                  color: '#808080',
                  borderColor: 'rgba(0,191,165,0.1)',
                  fontFamily: '"Josefin Sans", sans-serif',
                }}
              >
                RWA Demo
              </span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-8">
              {NAV_GROUPS.map(group => (
                <NavDropdown key={group.label} group={group as Parameters<typeof NavDropdown>[0]['group']} />
              ))}

              {/* Live/Demo badge */}
              {live !== null && live !== undefined && (
                <span
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${
                    live
                      ? 'border-[#00bfa5]/40 text-[#00bfa5] bg-[#00bfa5]/5'
                      : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-[#00bfa5]' : 'bg-yellow-400'}`} />
                  {live ? 'Live' : 'Demo'}
                </span>
              )}

              <Link
                to="/create"
                className="btn-primary px-4 py-2 text-black font-semibold rounded text-xs tracking-wider uppercase"
                style={{
                  background: 'linear-gradient(135deg, #00bfa5 0%, #009688 100%)',
                  fontFamily: '"Josefin Sans", sans-serif',
                }}
              >
                + Create Asset
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 transition-colors"
              style={{ color: '#40E0D0' }}
              onClick={() => setMobileOpen(o => !o)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden fixed w-full top-16 left-0"
            style={{ background: 'rgba(30, 30, 30, 0.98)', backdropFilter: 'blur(8px)', maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}
          >
            <div className="px-4 py-3 space-y-4">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <button
                    className="w-full flex justify-between items-center py-2.5"
                    style={{ color: '#40E0D0', fontFamily: '"Josefin Sans", sans-serif' }}
                    onClick={() => setMobileExpanded(e => e === group.label ? null : group.label)}
                  >
                    <span>{group.label}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${mobileExpanded === group.label ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {mobileExpanded === group.label && (
                    <div className="pl-4 pb-2 space-y-2">
                      {(group.items as (DropdownItem & { internal?: boolean })[]).map(item =>
                        item.internal ? (
                          <Link
                            key={item.label}
                            to="/"
                            className="block py-2.5 transition-all duration-200 hover:bg-[#40E0D0]/10"
                            style={{ color: '#40E0D0', fontFamily: '"Josefin Sans", sans-serif' }}
                            onClick={() => setMobileOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <a
                            key={item.label}
                            href={item.href}
                            target={item.external ? '_blank' : undefined}
                            rel={item.external ? 'noopener noreferrer' : undefined}
                            className="block py-2.5 transition-all duration-200 hover:bg-[#40E0D0]/10"
                            style={{ color: '#40E0D0', fontFamily: '"Josefin Sans", sans-serif' }}
                          >
                            {item.label}
                          </a>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-2 pb-4">
                <Link
                  to="/create"
                  className="block text-center px-4 py-2.5 text-black font-semibold rounded text-xs tracking-wider uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #00bfa5 0%, #009688 100%)',
                    fontFamily: '"Josefin Sans", sans-serif',
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  + Create Asset
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Page content (offset for fixed nav) ─────────────── */}
      <div className="flex-1 flex flex-col pt-16">
        {/* Demo banner */}
        <div
          className="text-center text-xs py-2 px-4"
          style={{ background: 'rgba(0,191,165,0.08)', color: '#40E0D0', borderBottom: '1px solid rgba(0,191,165,0.1)' }}
        >
          <span className="font-heading tracking-wide" style={{ fontFamily: '"Josefin Sans", sans-serif' }}>
            Salvium Testnet · RC2 Pre-mainnet
          </span>
          {live !== null && live !== undefined && (
            <span className={`ml-3 ${live ? 'text-[#00bfa5]' : 'text-yellow-400'}`}>
              · {live ? 'Live node connected' : 'Demo mode — no node required'}
            </span>
          )}
        </div>

        {/* App routes */}
        <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
          {children}
        </main>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className="border-t pt-16 mt-0" style={{ borderColor: 'rgba(64,224,208,0.1)' }}>
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

              {/* Brand */}
              <div className="text-center">
                <img
                  src={wordmarkUrl}
                  alt="Salvium"
                  className="mb-6 mx-auto opacity-80"
                  style={{ height: '40px', width: 'auto' }}
                />
                <p className="text-white max-w-md mx-auto mb-6 text-sm" style={{ fontFamily: '"Inter", sans-serif' }}>
                  Private blockchain with DeFi
                </p>
                <div className="flex justify-center space-x-6">
                  <a href="https://x.com/salvium_io" className="hover:opacity-80 transition-opacity" style={{ color: '#40E0D0' }}>
                    <i className="fa-brands fa-x-twitter text-2xl" />
                  </a>
                  <a href="https://t.me/salviumcommunity" className="hover:opacity-80 transition-opacity" style={{ color: '#40E0D0' }}>
                    <i className="fa-brands fa-telegram text-2xl" />
                  </a>
                  <a href="https://discord.gg/gvbyNQQ86p" className="hover:opacity-80 transition-opacity" style={{ color: '#40E0D0' }}>
                    <i className="fa-brands fa-discord text-2xl" />
                  </a>
                  <a href="https://github.com/salvium" className="hover:opacity-80 transition-opacity" style={{ color: '#40E0D0' }}>
                    <i className="fa-brands fa-github text-2xl" />
                  </a>
                </div>
              </div>

              {/* Quick links */}
              <div>
                <h4 className="text-lg font-semibold mb-4" style={{ color: '#40E0D0', fontFamily: '"Josefin Sans", sans-serif' }}>
                  Quick Links
                </h4>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: 'About Us',   href: 'https://salvium.io/about' },
                    { label: 'Blog',       href: 'https://salvium.io/blog' },
                    { label: 'FAQ',        href: 'https://salvium.io/faq' },
                    { label: 'Exchanges',  href: 'https://salvium.io/exchanges' },
                    { label: 'Papers',     href: 'https://salvium.io/papers' },
                  ].map(l => (
                    <li key={l.label}>
                      <a href={l.href} className="hover:opacity-80 transition-colors" style={{ color: '#40E0D0', fontFamily: '"Inter", sans-serif' }}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tools */}
              <div>
                <h4 className="text-lg font-semibold mb-4" style={{ color: '#40E0D0', fontFamily: '"Josefin Sans", sans-serif' }}>
                  Tools
                </h4>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: 'Wallets',        href: 'https://salvium.io/download' },
                    { label: 'Explorer',       href: 'https://explorer.salvium.io/' },
                    { label: 'Stats',          href: 'https://salvium.io/stats' },
                    { label: '3rd Party Tools',href: 'https://salvium.io/tools' },
                    { label: 'Brand Resources',href: 'https://github.com/salvium/brand-assets' },
                  ].map(l => (
                    <li key={l.label}>
                      <a href={l.href} className="hover:opacity-80 transition-colors" style={{ color: '#40E0D0', fontFamily: '"Inter", sans-serif' }}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center text-white text-sm" style={{ fontFamily: '"Inter", sans-serif' }}>
              <p>© {new Date().getFullYear()} Salvium Protocol. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
