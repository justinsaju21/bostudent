'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { AWARD_CATEGORIES } from '@/lib/awards';
import {
    GraduationCap,
    BookOpen,
    Trophy,
    Medal,
    Heart,
    Users,
    TrendingUp,
    Briefcase,
    ArrowRight,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
    GraduationCap,
    BookOpen,
    Trophy,
    Medal,
    Heart,
    Users,
    TrendingUp,
    Briefcase,
};

export default function AwardSelectionPage() {
    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '100px', padding: '100px clamp(16px, 4vw, 24px) 60px', maxWidth: '1200px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ textAlign: 'center', marginBottom: '48px' }}
                >
                    <h1 style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                        fontWeight: 700,
                        marginBottom: '12px',
                    }}>
                        Choose Your Award Category
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                        Select the award category you wish to apply for. You can apply for multiple awards separately.
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
                    gap: '24px',
                }}>
                    {AWARD_CATEGORIES.map((award, index) => {
                        const IconComponent = ICON_MAP[award.icon] || GraduationCap;
                        const href = award.slug === 'best-outgoing' ? '/apply/best-outgoing' : `/apply/${award.slug}`;

                        return (
                            <motion.div
                                key={award.slug}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.08 }}
                            >
                                <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div
                                        className="glass-card"
                                        style={{
                                            padding: '28px',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                                            (e.currentTarget as HTMLDivElement).style.borderColor = award.color;
                                            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${award.color}22`;
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                                            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
                                            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Icon */}
                                        <div style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '14px',
                                            background: `${award.color}18`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '16px',
                                        }}>
                                            <IconComponent size={26} color={award.color} />
                                        </div>

                                        {/* Title */}
                                        <h3 style={{
                                            fontFamily: "'Space Grotesk', sans-serif",
                                            fontSize: '1.15rem',
                                            fontWeight: 600,
                                            marginBottom: '8px',
                                        }}>
                                            {award.title}
                                        </h3>

                                        {/* Description */}
                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.9rem',
                                            lineHeight: 1.6,
                                            flex: 1,
                                        }}>
                                            {award.description}
                                        </p>

                                        {/* Apply CTA */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginTop: '16px',
                                            color: award.color,
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                        }}>
                                            Apply Now <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </>
    );
}
