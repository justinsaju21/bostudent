"use client";

import { StudentApplication, RankedStudent } from "@/lib/types";
import { X } from "lucide-react";

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: StudentApplication[];
    rankedData: RankedStudent[];
    scoreOverrides: Record<string, number>;
}

export default function ComparisonModal({ isOpen, onClose, students, rankedData, scoreOverrides }: ComparisonModalProps) {
    if (!isOpen) return null;

    // Helper to get ranked score
    const getScore = (regNo: string) => {
        const override = scoreOverrides[regNo];
        if (override !== undefined) return override.toFixed(2);
        const ranked = rankedData.find(r => r.registerNumber === regNo);
        return ranked ? ranked.totalScore.toFixed(2) : "N/A";
    };

    const getRank = (regNo: string) => {
        const idx = rankedData.findIndex(r => r.registerNumber === regNo);
        return idx !== -1 ? `#${idx + 1}` : "-";
    };

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
                    padding: '20px', borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Candidate Comparison</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-secondary)'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: `200px repeat(${students.length}, minmax(300px, 1fr))`, gap: '0' }}>
                        {/* Header Row */}
                        <div className="compare-cell header">Metric</div>
                        {students.map(s => (
                            <div key={s.personalDetails.registerNumber} className="compare-cell header" style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.personalDetails.name}</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{s.personalDetails.department}</div>
                                <div style={{
                                    marginTop: '8px', display: 'inline-block',
                                    background: 'var(--accent-primary)', color: 'white',
                                    padding: '4px 12px', borderRadius: '20px', fontSize: '1rem', fontWeight: 800
                                }}>
                                    {getScore(s.personalDetails.registerNumber)}
                                </div>
                                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Rank: {getRank(s.personalDetails.registerNumber)}</div>
                            </div>
                        ))}

                        {/* CGPA */}
                        <div className="compare-cell label">CGPA</div>
                        {students.map(s => (
                            <div key={s.personalDetails.registerNumber} className="compare-cell value">
                                {s.academicRecord.cgpa}
                            </div>
                        ))}

                        {/* Internships */}
                        <div className="compare-cell label">Internships</div>
                        {students.map(s => (
                            <div key={s.personalDetails.registerNumber} className="compare-cell value">
                                <strong>{s.internships.length}</strong>
                                <ul style={{ fontSize: '0.85rem', marginTop: '4px', paddingLeft: '20px', textAlign: 'left' }}>
                                    {s.internships.map((i, idx) => (
                                        <li key={idx}>{i.company} ({i.role})</li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Projects */}
                        <div className="compare-cell label">Projects</div>
                        {students.map(s => (
                            <div key={s.personalDetails.registerNumber} className="compare-cell value">
                                <strong>{s.projects.length}</strong>
                                <ul style={{ fontSize: '0.85rem', marginTop: '4px', paddingLeft: '20px', textAlign: 'left' }}>
                                    {s.projects.map((p, idx) => (
                                        <li key={idx}>{p.title}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Research */}
                        <div className="compare-cell label">Research</div>
                        {students.map(s => (
                            <div key={s.personalDetails.registerNumber} className="compare-cell value">
                                <strong>{s.research.length}</strong>
                                {s.research.map((r, idx) => (
                                    <div key={idx} style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                                        {r.title} ({r.publicationStatus})
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Hackathons */}
                        <div className="compare-cell label">Hackathons</div>
                        {students.map(s => (
                            <div key={s.personalDetails.registerNumber} className="compare-cell value">
                                <strong>{s.hackathons.length}</strong>
                                {s.hackathons.map((h, idx) => (
                                    <div key={idx} style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                                        {h.name} - {h.position}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Video Pitch */}
                        <div className="compare-cell label">Video Pitch</div>
                        {students.map(s => (
                            <div key={s.personalDetails.registerNumber} className="compare-cell value">
                                <a href={s.videoPitchUrl} target="_blank" rel="noopener noreferrer"
                                    style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                                    Watch Video
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .compare-cell {
                    padding: 16px;
                    border-bottom: 1px solid var(--border-subtle);
                    border-right: 1px solid var(--border-subtle);
                    background: var(--bg-card);
                }
                .label {
                    font-weight: 600;
                    background: var(--bg-surface);
                    position: sticky;
                    left: 0;
                }
                .header {
                    background: var(--bg-surface);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    border-bottom: 2px solid var(--border-subtle);
                }
                .value {
                    text-align: center;
                }
            `}</style>
        </div>
    );
}
