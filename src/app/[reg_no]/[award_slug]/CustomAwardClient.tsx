'use client';

import { AwardConfig } from '@/lib/awards';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Award, Briefcase, FileText, Globe, Medal, Star, Github, Linkedin, ExternalLink, FolderOpen } from 'lucide-react';
import React, { useMemo } from 'react';

interface Props {
    student: any;
    award: AwardConfig;
}

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    }),
};

export default function CustomAwardClient({ student, award }: Props) {
    const pd = student.personalDetails || {};

    // Extract non-standard properties from the root of student object
    const customSections = useMemo(() => {
        const sections: { key: string, value: any }[] = [];
        const ignoredKeys = new Set([
            'personalDetails', 'facultyScore', 'discardedItems', 'verified',
            'termsAccepted', 'masterProofFolderUrl', 'submittedAt'
        ]);

        for (const [key, value] of Object.entries(student)) {
            if (!ignoredKeys.has(key)) {
                sections.push({ key, value });
            }
        }
        return sections;
    }, [student]);

    // Format header title
    const formatTitle = (str: string) => str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '64px' }}>
                <section style={{
                    background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                    padding: '60px 24px 80px 24px', position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: `radial-gradient(circle, ${award.color}15 0%, transparent 60%)`, top: '-200px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${award.color}15`, border: `1px solid ${award.color}30`, borderRadius: '24px', padding: '6px 16px', marginBottom: '20px', fontSize: '12px', fontWeight: 600, color: award.color }}>
                                <Award size={14} /> {award.title} Candidate
                            </div>

                            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '8px' }}>
                                {pd.name || 'Unknown Candidate'}
                            </h1>
                            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                {pd.department}{pd.specialization ? ` — ${pd.specialization}` : ''}
                            </p>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                Class {pd.section} • Advisor: {pd.facultyAdvisor}
                            </p>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                                {pd.registerNumber} • {pd.srmEmail}
                            </p>
                        </motion.div>
                    </div>
                </section>

                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px 24px' }}>
                    {customSections.map((section, idx) => (
                        <motion.div key={section.key} custom={idx} initial="hidden" animate="visible" variants={fadeIn} style={{ marginBottom: '48px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${award.color}15`, color: award.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Star size={18} />
                                </div>
                                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 700 }}>{formatTitle(section.key)}</h2>
                            </div>

                            {Array.isArray(section.value) ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                    {section.value.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No entries found.</p>
                                    ) : (
                                        section.value.map((item: any, itemIdx: number) => (
                                            <div key={itemIdx} className="glass-card" style={{ padding: '24px' }}>
                                                {Object.entries(item).filter(([k]) => k !== 'id' && k !== 'proofLink').map(([k, v]) => (
                                                    <div key={k} style={{ marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{formatTitle(k)}:</span>
                                                        <div style={{ fontSize: '14px', fontWeight: k.toLowerCase().includes('title') || k.toLowerCase().includes('name') ? 600 : 400 }}>{String(v)}</div>
                                                    </div>
                                                ))}
                                                {item.proofLink && (
                                                    <a href={item.proofLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: award.color, marginTop: '12px', fontWeight: 600 }}>
                                                        View Proof <ExternalLink size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : typeof section.value === 'object' && section.value !== null ? (
                                <div className="glass-card" style={{ padding: '24px' }}>
                                    {Object.entries(section.value).map(([k, v]) => (
                                        <p key={k} style={{ fontSize: '14px', marginBottom: '8px' }}>
                                            <strong style={{ color: 'var(--text-secondary)' }}>{formatTitle(k)}:</strong> {String(v)}
                                        </p>
                                    ))}
                                </div>
                            ) : typeof section.value === 'boolean' ? (
                                <p style={{ fontSize: '15px' }}>{section.value ? 'Yes' : 'No'}</p>
                            ) : typeof section.value === 'string' && section.value.startsWith('http') ? (
                                <a href={section.value} target="_blank" rel="noopener noreferrer" style={{ color: award.color, display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                    View Document <ExternalLink size={14} />
                                </a>
                            ) : (
                                <p style={{ fontSize: '15px', lineHeight: 1.6 }}>{String(section.value)}</p>
                            )}
                        </motion.div>
                    ))}

                    {/* Master Proof Folder */}
                    {student.masterProofFolderUrl && (
                        <motion.div custom={customSections.length + 1} initial="hidden" animate="visible" variants={fadeIn} style={{ marginTop: '48px', padding: '24px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Master Proof Folder</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Contains official verification documents provided by the applicant.</p>
                            <a href={student.masterProofFolderUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: award.color, border: 'none', color: 'white' }}>
                                <FolderOpen size={18} /> Open Folder Server
                            </a>
                        </motion.div>
                    )}
                </div>
            </main>
        </>
    );
}
