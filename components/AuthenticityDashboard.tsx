'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import DomeGallery from './DomeGallery';
import type { AccountProfile } from './lib/accounts';

export interface AuthenticityDashboardProps {
  accounts: AccountProfile[];
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}

function getPlatformLabel(platform: AccountProfile['platform']) {
  switch (platform) {
    case 'instagram':
      return 'Instagram';
    case 'tiktok':
      return 'TikTok';
    case 'youtube':
      return 'YouTube';
    case 'x':
      return 'X / Twitter';
    default:
      return platform;
  }
}

export default function AuthenticityDashboard({ accounts }: AuthenticityDashboardProps) {
  const [selectedId, setSelectedId] = useState(accounts[0]?.id ?? '');

  const selected = useMemo(
    () => accounts.find((account) => account.id === selectedId) ?? accounts[0],
    [accounts, selectedId]
  );

  if (!selected) {
    return null;
  }

  const credibilityPercent = Math.round(selected.credibilityScore * 100);

  return (
    <main className="app-shell">
      <header className="shell-header">
        <span className="hero-eyebrow">Authenticity intelligence</span>
        <h1 className="hero-title">Judge social accounts with immersive evidence.</h1>
        <p className="hero-subtitle">
          Blend LLM scoring, transparent prompts, and a responsive dome gallery sourced from verifiable posts. Designed for
          trust &amp; safety teams deploying the <strong>Is She Real</strong> evaluator to grade influence networks in real time.
        </p>
        <div className="hero-actions">
          <button type="button" className="primary">
            Launch Verification Workspace
          </button>
          <button type="button" className="secondary">
            View Prompt Template
          </button>
        </div>
      </header>

      <section className="shell-grid">
        <article className={clsx('shell-grid__panel', 'details-panel')}>
          <div className="panel-heading">
            <h2>Account dossier</h2>
            <p>Switch between tracked handles to inspect freshness, signals, and scoring context.</p>
          </div>

          <div className="chip-select" role="tablist" aria-label="Choose an account to review">
            {accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                role="tab"
                aria-selected={account.id === selected.id}
                className={clsx({ 'is-active': account.id === selected.id })}
                onClick={() => setSelectedId(account.id)}
              >
                <span style={{ display: 'block', fontWeight: 600 }}>{account.displayName}</span>
                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7 }}>{account.handle}</span>
              </button>
            ))}
          </div>

          <div className="account-overview">
            <Image
              src={selected.avatar}
              alt={`${selected.displayName} avatar`}
              width={64}
              height={64}
              className="account-overview__avatar"
              priority
            />
            <div className="account-overview__text">
              <h3>{selected.displayName}</h3>
              <span>{selected.handle}</span>
              <span>{getPlatformLabel(selected.platform)}</span>
            </div>
          </div>

          <div className="account-meta" style={{ marginTop: '1.5rem' }}>
            <div className="account-meta__row">
              <span className="badge">{getPlatformLabel(selected.platform)}</span>
              <span className="badge">{formatCompact(selected.followers)} followers</span>
              <span className="badge">{formatCompact(selected.following)} following</span>
              <span className="badge">{selected.postsPerWeek} posts / week</span>
            </div>

            <div className="score-pill" aria-label="Credibility score">
              <strong>{credibilityPercent}%</strong>
              <span>Credibility confidence</span>
            </div>

            <p style={{ fontSize: '1rem', lineHeight: 1.5 }}>{selected.verdict}</p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{selected.explanation}</p>
          </div>

          <div className="signal-grid" style={{ marginTop: '1.5rem' }}>
            {selected.signals.map((signal) => (
              <div key={`${selected.id}-${signal.label}`} className="signal-card">
                <strong>{signal.label}</strong>
                <p>{signal.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className={clsx('shell-grid__panel', 'dome-panel')}>
          <div className="panel-heading">
            <h2>Immersive dome gallery</h2>
            <p>Rotate through high-signal graphics the evaluator ingested to substantiate the verdict.</p>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <DomeGallery key={selected.id} items={selected.gallery} segmentsX={18} segmentsY={12} />
          </div>
        </article>
      </section>

      <section className="shell-grid__panel" style={{ textAlign: 'center' }}>
        <div className="panel-heading" style={{ alignItems: 'center' }}>
          <h2>Workflow intelligence</h2>
          <p style={{ maxWidth: '60ch' }}>
            Every verdict pairs human-readable evidence, structured metadata, and model rationales. Bring the toolkit to Vercel,
            hook it to your preferred ingestion pipeline, and serve stakeholders a cinematic yet auditable experience.
          </p>
        </div>

        <ul className="evaluation-list">
          <li>
            <strong>1. Evidence ingestion</strong>
            <span>
              Collect bio lines, follower metrics, and post snippets via lightweight adapters. Each asset is normalized and
              stored with traceable provenance before prompt construction.
            </span>
          </li>
          <li>
            <strong>2. Prompt orchestration</strong>
            <span>
              Feed the curated dossier to the LLM with rubric-driven scoring instructions. We archive the full prompt and
              response so analysts can audit any call.
            </span>
          </li>
          <li>
            <strong>3. Visual storytelling</strong>
            <span>
              Render authenticity signals through the dome gallery, scoring dashboards, and structured alerts to keep trust &amp;
              safety teams in the loop.
            </span>
          </li>
        </ul>
      </section>

      <footer className="footer-note">
        Built for Vercel deployments. Pair this interface with the <code>is_she_real</code> Python engine to automate real-time
        authenticity scoring.
      </footer>
    </main>
  );
}
