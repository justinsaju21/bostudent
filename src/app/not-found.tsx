import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
        }}>
            <div>
                <h1 style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '6rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    marginBottom: '16px',
                }}
                    className="gradient-text"
                >
                    404
                </h1>
                <h2 style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    marginBottom: '12px',
                }}>
                    Student Not Found
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 32px auto' }}>
                    The register number you entered doesn&apos;t match any submitted application.
                    Please check the register number and try again.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary">Go Home</button>
                    </Link>
                    <Link href="/apply" style={{ textDecoration: 'none' }}>
                        <button className="btn-secondary">Apply Now</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
