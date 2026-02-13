'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/admin-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (data.success) {
                router.push('/admin');
                router.refresh();
            } else {
                setError(data.message || 'Invalid password');
                setPassword('');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main style={{
                paddingTop: '64px',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 24px 40px 24px',
                background: 'var(--bg-secondary)',
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        width: '100%',
                        maxWidth: '420px',
                    }}
                >
                    <div className="glass-card" style={{ padding: '40px 32px' }}>
                        {/* Icon */}
                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: 'var(--accent-gradient)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                            }}>
                                <ShieldCheck size={32} color="white" />
                            </div>
                            <h1 style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                marginBottom: '8px',
                            }}>
                                Faculty Access
                            </h1>
                            <p style={{
                                fontSize: '14px',
                                color: 'var(--text-muted)',
                            }}>
                                Enter the admin password to access the dashboard
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)',
                                    }} />
                                    <input
                                        className="form-input"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter admin password"
                                        style={{ paddingLeft: '40px', paddingRight: '44px' }}
                                        autoFocus
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-muted)',
                                            padding: '4px',
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'rgba(220, 38, 38, 0.08)',
                                        border: '1px solid rgba(220, 38, 38, 0.2)',
                                        color: '#DC2626',
                                        fontSize: '13px',
                                        marginBottom: '20px',
                                    }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading || !password}
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    padding: '14px',
                                    fontSize: '15px',
                                }}
                            >
                                {loading ? 'Verifying...' : 'Access Dashboard'}
                            </button>
                        </form>
                    </div>

                    <p style={{
                        textAlign: 'center',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        marginTop: '20px',
                    }}>
                        This area is restricted to authorized faculty members only.
                    </p>
                </motion.div>
            </main>
        </>
    );
}
