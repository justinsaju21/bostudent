"use client";

import React from 'react';
import { X } from "lucide-react";

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    // We accept any array of student objects (either BO or Custom)
    selectedStudents: any[];
}

export default function ComparisonModal({ isOpen, onClose, selectedStudents }: ComparisonModalProps) {
    if (!isOpen || !selectedStudents || selectedStudents.length === 0) return null;

    // Helper to format values for display
    const formatValue = (key: string, val: any): React.ReactNode => {
        if (val === null || val === undefined || val === '') return '—';

        // Handle Arrays (e.g. hackathons, internships, wins)
        if (Array.isArray(val)) {
            if (val.length === 0) return '0';
            return (
                <div>
                    <strong>{val.length}</strong>
                    <ul style={{ fontSize: '0.85rem', marginTop: '4px', paddingLeft: '20px', textAlign: 'left', margin: '4px 0 0 0' }}>
                        {val.slice(0, 3).map((item, idx) => {
                            // Try to guess a good display string for the object
                            let displayStr = '';
                            if (typeof item === 'string') displayStr = item;
                            else if (item.company && item.role) displayStr = `${item.company} (${item.role})`;
                            else if (item.title) displayStr = item.title;
                            else if (item.name) displayStr = item.name;
                            else if (item.eventName) displayStr = item.eventName;
                            else if (item.sportOrEvent) displayStr = item.sportOrEvent;
                            else if (item.organization) displayStr = item.organization;
                            else displayStr = `Item ${idx + 1}`;

                            return <li key={idx} style={{ marginBottom: '2px' }}>{displayStr}</li>;
                        })}
                        {val.length > 3 && <li style={{ color: 'var(--text-muted)' }}>+ {val.length - 3} more</li>}
                    </ul>
                </div>
            );
        }

        // Handle Booleans
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';

        // URLs -> Links
        if (typeof val === 'string' && val.startsWith('http')) {
            return <a href={val} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>View Link</a>;
        }

        // Try parsing nested objects (e.g. academicRecord.cgpa)
        if (typeof val === 'object' && !Array.isArray(val)) {
            // Special case for BO academicRecord
            if (val.cgpa !== undefined) return <strong>{val.cgpa}</strong>;
            if (val.score !== undefined) return <strong>{val.score.toFixed(2)}</strong>;
            return <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>[Complex Data]</span>;
        }

        // Catch-all for primitives (strings, numbers)
        return String(val);
    };

    // Discover dynamic comparison keys by inspecting the objects
    const extractKeys = () => {
        const keys = new Set<string>();
        const skipKeys = ['personalDetails', 'id', 'submittedAt', 'updatedAt', 'masterProofFolderUrl', 'termsAccepted', 'facultyScore', 'verified', 'discardedItems'];

        selectedStudents.forEach(student => {
            Object.keys(student).forEach(k => {
                if (!skipKeys.includes(k) && !k.toLowerCase().includes('proof') && !k.toLowerCase().includes('link')) {
                    keys.add(k);
                }
            });
        });

        return Array.from(keys);
    };

    const comparisonKeys = extractKeys();

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-card)', width: '95vw', height: '90vh',
                borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                border: '1px solid var(--border-subtle)'
            }}>
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--bg-surface)'
                }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Candidate Comparison</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '4px', borderRadius: '4px'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflow: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: `200px repeat(${selectedStudents.length}, minmax(min(300px, 100%), 1fr))`, gap: '0' }}>

                        {/* Header Row (Sticky) */}
                        <div className="compare-cell header label" style={{ zIndex: 30 }}>Candidate</div>
                        {selectedStudents.map((s, i) => {
                            const pd = s.personalDetails || {};
                            return (
                                <div key={pd.registerNumber || i} className="compare-cell header" style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{pd.name || 'Unknown'}</div>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.7, fontFamily: 'monospace', marginTop: '4px' }}>{pd.registerNumber || '—'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pd.department || '—'}</div>

                                    {/* Show Faculty Score if it exists (Custom Awards) */}
                                    {s.facultyScore !== undefined && (
                                        <div style={{
                                            marginTop: '12px', display: 'inline-block',
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '1rem', fontWeight: 800,
                                            background: s.facultyScore > 0 ? 'var(--accent-primary)' : 'var(--bg-surface)',
                                            color: s.facultyScore > 0 ? 'white' : 'var(--text-muted)',
                                            border: s.facultyScore === 0 ? '1px solid var(--border-subtle)' : 'none'
                                        }}>
                                            Score: {s.facultyScore}
                                        </div>
                                    )}

                                    {/* Show Ranked Score if it exists (Best Outgoing) */}
                                    {s.overallResults && (
                                        <div style={{
                                            marginTop: '12px', display: 'inline-block',
                                            background: 'var(--srm-blue)', color: 'white',
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '1rem', fontWeight: 800
                                        }}>
                                            Ranked: {s.overallResults.totalScore?.toFixed(2) || 'N/A'}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* CGPA Dedicated Row - Important enough to pull from nested structure if needed */}
                        <div className="compare-cell label">CGPA</div>
                        {selectedStudents.map((s, i) => {
                            const cgpa = s.cgpa || (s.academicRecord && s.academicRecord.cgpa) || '—';
                            return (
                                <div key={`${s.personalDetails?.registerNumber || i}_cgpa`} className="compare-cell value" style={{ fontWeight: 700, color: '#D97706', fontSize: '1.1rem' }}>
                                    {cgpa}
                                </div>
                            );
                        })}

                        {/* Dynamic Field Rows */}
                        {comparisonKeys.map(key => (
                            <React.Fragment key={key}>
                                <div className="compare-cell label" style={{ textTransform: 'capitalize' }}>
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                {selectedStudents.map((s, i) => (
                                    <div key={`${s.personalDetails?.registerNumber || i}_${key}`} className="compare-cell value">
                                        {formatValue(key, s[key])}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}

                        {/* Links/Proofs catch-all */}
                        <div className="compare-cell label">Master Proof</div>
                        {selectedStudents.map((s, i) => (
                            <div key={`${s.personalDetails?.registerNumber || i}_proof`} className="compare-cell value">
                                {s.masterProofFolderUrl ? (
                                    <a href={s.masterProofFolderUrl} target="_blank" rel="noopener noreferrer"
                                        style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-block', padding: '6px 12px', background: 'rgba(3,77,161,0.05)', borderRadius: '6px', textDecoration: 'none' }}>
                                        Open Folder
                                    </a>
                                ) : '—'}
                            </div>
                        ))}

                    </div>
                </div>
            </div>
            <style jsx>{`
                .compare-cell {
                    padding: 20px 16px;
                    border-bottom: 1px solid var(--border-subtle);
                    border-right: 1px solid var(--border-subtle);
                    background: var(--bg-card);
                }
                .label {
                    font-weight: 600;
                    background: var(--bg-surface);
                    position: sticky;
                    left: 0;
                    z-index: 15;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    box-shadow: 2px 0 5px rgba(0,0,0,0.02);
                }
                .header {
                    background: var(--bg-surface);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    border-bottom: 2px solid var(--border-subtle);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
                }
                .header.label {
                    z-index: 30;
                    background: var(--bg-surface);
                }
                .value {
                    text-align: center;
                    font-size: 0.95rem;
                }
            `}</style>
        </div>
    );
}
