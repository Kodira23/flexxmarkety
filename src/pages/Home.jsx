import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Ticker from '../components/Ticker'
import CandleChart from '../components/CandleChart'
import AuthModal from '../components/AuthModal'
import './Home.css'

const WHY_FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: 'Lightning Fast',
    desc: 'AI-powered algorithms execute trades in milliseconds, capturing every market opportunity.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Bank-Level Security',
    desc: 'Your funds and data are protected with enterprise-grade encryption and security protocols.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: '24/7 Trading',
    desc: 'Our automated systems work around the clock, so you never miss a profitable trade.',
  },
]

const AUTOTRADING_CARDS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    title: 'Automated Trading Strategies',
    desc: 'We provide expertly developed, algorithm-based trading strategies that execute trades in real-time with precision and efficiency.',
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: '24/7 Market Monitoring',
    desc: 'Our systems continuously monitor the Crypto and crypto markets around the clock, ensuring timely entries and exits without manual intervention.',
    img: 'https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=600&q=80',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Performance Analytics',
    desc: 'Gain access to real-time performance dashboards and detailed trade analytics to track your portfolio and assess profitability.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  },
]

const STATS_BAR = [
  { value: '700%', label: 'Max Profit' },
  { value: '1hr',  label: 'Trade Duration' },
  { value: '24/7', label: 'Market Monitoring' },
  { value: '₱2,500', label: 'Min Investment' },
]

const ABOUT_POINTS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Auto-Trading Services',
    desc: 'Harness advanced algorithms to automate your Crypto trades efficiently.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: 'Years of Experience',
    desc: 'Backed by proven results and deep Crypto market insights since inception.',
  },
]

export default function Home() {
  const [modal, setModal] = useState(null)

  return (
    <div className="home">
      <Navbar onSignIn={() => setModal('signin')} onGetStarted={() => setModal('signup')} />
      <Ticker />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <CandleChart />
          <div className="hero-gradient" />
        </div>
        <div className="hero-content">
          <div className="hero-badge animate-fade-up">
            <span className="badge-dot" />
            Welcome to Flexxmarket
          </div>
          <h1 className="hero-headline animate-fade-up delay-1">
            <span className="headline-primary">Grow Your Wealth</span>{' '}
            <span className="headline-accent">Faster</span>
          </h1>
          <p className="hero-sub animate-fade-up delay-2">
            Our platform uses AI-driven trading tech to maximize your return on
            investment (ROI) — trusted by investors worldwide.
          </p>
          <div className="hero-cta animate-fade-up delay-3">
            <button className="btn-primary cta-main" onClick={() => setModal('signup')}>
              Sign Up
            </button>
            <button className="btn-outline" onClick={() => setModal('signin')}>
              Login
            </button>
          </div>
        </div>
      </section>

      {/* ── ABOUT / DISCOVER ── */}
      <section className="about-section" id="about">
        <div className="section-inner about-inner">
          <div className="about-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=700&q=80"
              alt="Trading platform"
              className="about-img"
            />
            <div className="about-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <div>
                <span className="about-badge-num">15,344+</span>
                <span className="about-badge-label">Active Users</span>
              </div>
            </div>
          </div>

          <div className="about-text">
            <div className="section-tag">About Us</div>
            <h2 className="section-title">
              Discover Our Platform —<br />Don't Miss Out
            </h2>
            <p className="section-sub">
              Trade smarter with AI-driven Crypto automation that analyzes,
              executes, and optimizes 24/7.
            </p>
            <ul className="about-points">
              {ABOUT_POINTS.map(p => (
                <li key={p.title} className="about-point">
                  <div className="about-point-icon">{p.icon}</div>
                  <div>
                    <strong>{p.title}</strong>
                    <p>{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button className="btn-primary discover-btn" onClick={() => setModal('signup')}>
              Discover Now
            </button>
          </div>
        </div>
      </section>

      {/* ── LIVE CHART ── */}
      <section className="chart-section" id="markets">
        <div className="section-inner" style={{ textAlign: 'center' }}>
          <div className="section-tag" style={{ display: 'inline-block' }}>Live Market Data</div>
          <h2 className="section-title" style={{ textAlign: 'center', maxWidth: '100%' }}>
            Real-Time Trading Charts
          </h2>
          <p className="section-sub" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
            Monitor live market movements with professional-grade TradingView charts and
            make informed trading decisions.
          </p>
          <div className="tradingview-embed">
            <iframe
              src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=NASDAQ%3AAAPL&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=1a1d1f&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=1&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en"
              style={{ width: '100%', height: 500, border: 'none', borderRadius: 12 }}
              allowTransparency
              allowFullScreen
              title="TradingView Chart"
            />
          </div>
        </div>
      </section>

      {/* ── AUTOTRADING ── */}
      <section className="autotrading-section" id="features">
        <div className="section-inner" style={{ textAlign: 'center' }}>
          <div className="section-tag" style={{ display: 'inline-block' }}>Our Services</div>
          <h2 className="section-title" style={{ textAlign: 'center', maxWidth: '100%' }}>
            Professional Autotrading Platform
          </h2>
          <p className="section-sub" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 56px' }}>
            Our Crypto Premium autotrading section provides real-time, expert-analyzed
            trading tailored to maximize profit opportunities in the foreign exchange market.
          </p>
          <div className="autotrading-grid">
            {AUTOTRADING_CARDS.map(c => (
              <div key={c.title} className="autotrading-card card">
                <div className="autotrading-img-wrap">
                  <img src={c.img} alt={c.title} className="autotrading-img" />
                  <div className="autotrading-icon">{c.icon}</div>
                </div>
                <div className="autotrading-body">
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="stats-bar">
        <div className="section-inner stats-bar-inner">
          {STATS_BAR.map((s, i) => (
            <div key={s.label} className="stats-bar-item">
              <span className="stats-bar-value font-mono">{s.value}</span>
              <span className="stats-bar-label">{s.label}</span>
              {i < STATS_BAR.length - 1 && <div className="stats-bar-divider" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY CHOOSE ── */}
      <section className="why-section">
        <div className="section-inner" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ textAlign: 'center', maxWidth: '100%', fontSize: 'clamp(32px,5vw,52px)' }}>
            Why Choose Flexxmarket?
          </h2>
          <p className="section-sub" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}>
            Experience the ultimate trading platform with cutting-edge features designed for your success.
          </p>
          <div className="why-grid">
            {WHY_FEATURES.map(f => (
              <div key={f.title} className="why-card card">
                <div className="why-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <div className="cta-inner">
          <div className="cta-glow" />
          <h2 className="cta-headline">Ready to Start Trading?</h2>
          <p className="cta-sub">
            Join thousands of traders who are already multiplying their portfolios with Flexxmarket.
          </p>
          <div className="cta-btns">
            <button className="btn-primary cta-btn" onClick={() => setModal('signup')}>
              Sign Up
            </button>
            <button className="btn-outline cta-btn-outline" onClick={() => setModal('signin')}>
              Login
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span style={{ color: 'var(--green)' }}>◈</span> Flexxmarket
          </div>
          <p className="footer-copy">© 2026 Flexxmarket. All rights reserved. Trading involves risk.</p>
        </div>
      </footer>

      {modal && (
        <AuthModal mode={modal} onClose={() => setModal(null)} />
      )}
    </div>
  )
}