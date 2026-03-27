import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '4rem' }}>🌑</span>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0 0.5rem' }}>
        Lost in the Dark
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        This path doesn&apos;t lead anywhere… yet.
      </p>
      <Link
        to="/"
        style={{
          padding: '0.75rem 2rem',
          background: 'var(--color-primary)',
          borderRadius: '9999px',
          fontWeight: 600,
          color: '#fff',
        }}
      >
        Return Home
      </Link>
    </div>
  );
}
