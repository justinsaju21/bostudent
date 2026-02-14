'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-subtle)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
        >
            <div
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '64px',
                }}
            >
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <div
                        style={{
                            width: 'clamp(32px, 8vw, 48px)',
                            height: 'clamp(32px, 8vw, 48px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {/* SRM Logo */}
                        <img
                            src="/srm-logo.png"
                            alt="SRM Logo"
                            style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                        />
                    </div>
                    <div style={{ minWidth: 0 }}> {/* Prevent shrinking below content */}
                        <div style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            fontSize: 'clamp(14px, 4vw, 16px)',
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            Best Outgoing Student
                        </div>
                        <div className="hidden sm:block" style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                            SRM IST KTR
                        </div>
                    </div>
                </Link>

                {/* Desktop Links */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                    className="hidden lg:flex"
                >
                    <NavLink href="/">Home</NavLink>
                    <NavLink href="/apply">Apply Now</NavLink>
                    <NavLink href="/admin">Faculty Dashboard</NavLink>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        padding: '8px',
                    }}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                        borderTop: '1px solid var(--border-subtle)',
                        padding: '16px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        background: 'white',
                    }}
                    className="lg:hidden"
                >
                    <MobileNavLink href="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
                    <MobileNavLink href="/apply" onClick={() => setIsOpen(false)}>Apply Now</MobileNavLink>
                    <MobileNavLink href="/admin" onClick={() => setIsOpen(false)}>Faculty Dashboard</MobileNavLink>
                </motion.div>
            )}
        </motion.nav>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--srm-blue)';
                e.currentTarget.style.background = 'rgba(3, 77, 161, 0.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'transparent';
            }}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '16px', // Increased font size for better readability
                fontWeight: 500,
                padding: '16px 20px', // Larger touch target
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.2s ease',
                display: 'flex', // Flex for potential icons
                alignItems: 'center',
                background: 'var(--bg-secondary)',
                border: '1px solid transparent',
            }}
            onTouchStart={(e) => {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
            onTouchEnd={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'transparent';
            }}
        >
            {children}
        </Link>
    );
}
