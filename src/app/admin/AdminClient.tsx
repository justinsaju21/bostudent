'use client';

import { RankedStudent, StudentApplication } from '@/lib/types';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Award, ExternalLink, Search, LogOut, Download, ChevronDown, ChevronUp, X, Edit3, Save, XCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
    students: RankedStudent[];
    fullStudents: StudentApplication[];
    error?: string;
}

// Helper to format date strings
function fmtDate(d: string) {
    if (!d) return '—';
    try {
        const date = new Date(d);
        return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    } catch { return d; }
}

function fmtStatus(s: string) {
    const map: Record<string, string> = {
        placed: '✅ Placed', higher_studies: '📚 Higher Studies',
        entrepreneur: '🚀 Entrepreneur', unplaced: '🔍 Unplaced', other: '📋 Other',
    };
    return map[s] || s;
}

export default function AdminClient({ students, fullStudents, error }: Props) {
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [discardedItems, setDiscardedItems] = useState<Record<string, Set<string>>>({});
    const [scoreOverrides, setScoreOverrides] = useState<Record<string, number>>({});
    const [editingScore, setEditingScore] = useState<string | null>(null);
    const [tempScore, setTempScore] = useState('');
    const router = useRouter();

    const departments = [...new Set(students.map((s) => s.department))];

    const filtered = students.filter((s) => {
        const matchesSearch =
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.registerNumber.toLowerCase().includes(search.toLowerCase());
        const matchesDept = !deptFilter || s.department === deptFilter;
        return matchesSearch && matchesDept;
    });

    // Analytics
    const deptStats = useMemo(() => {
        const stats: Record<string, number> = {};
        students.forEach(s => {
            const dept = s.department || 'Unknown';
            stats[dept] = (stats[dept] || 0) + 1;
        });
        return Object.entries(stats).sort((a, b) => b[1] - a[1]);
    }, [students]);

    // Get full student data by register number
    const getFullStudent = (regNo: string): StudentApplication | undefined => {
        return fullStudents.find(s => s.personalDetails.registerNumber === regNo);
    };

    // Discard logic
    const toggleDiscard = (regNo: string, section: string, itemId: string) => {
        setDiscardedItems(prev => {
            const key = `${regNo}::${section}::${itemId}`;
            const newSet = new Set(prev[regNo] || []);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return { ...prev, [regNo]: newSet };
        });
    };

    const isDiscarded = (regNo: string, section: string, itemId: string) => {
        const key = `${regNo}::${section}::${itemId}`;
        return discardedItems[regNo]?.has(key) || false;
    };

    // Score override
    const startEditScore = (regNo: string, currentScore: number) => {
        setEditingScore(regNo);
        setTempScore((scoreOverrides[regNo] ?? currentScore).toFixed(1));
    };

    const saveScore = (regNo: string) => {
        const val = parseFloat(tempScore);
        if (!isNaN(val) && val >= 0 && val <= 100) {
            setScoreOverrides(prev => ({ ...prev, [regNo]: val }));
        }
        setEditingScore(null);
    };

    const cancelEditScore = () => {
        setEditingScore(null);
        setTempScore('');
    };

    const getDisplayScore = (student: RankedStudent) => {
        return scoreOverrides[student.registerNumber] ?? student.totalScore;
    };

    const downloadCSV = () => {
        const headers = ['Rank', 'Register Number', 'Name', 'Department', 'Auto Score', 'Faculty Score', 'CGPA', 'Research', 'Internships', 'Projects', 'Hackathons'];
        const rows = students.map((s, i) => [
            i + 1,
            s.registerNumber,
            s.name,
            s.department,
            s.totalScore.toFixed(2),
            (scoreOverrides[s.registerNumber] ?? s.totalScore).toFixed(2),
            s.breakdown.cgpa,
            s.breakdown.research,
            s.breakdown.internships,
            s.breakdown.projects,
            s.breakdown.hackathons,
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bo_student_rankings.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/admin-auth', { method: 'DELETE' });
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '80px', padding: '80px 24px 60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ marginBottom: '40px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: 'var(--radius-sm)',
                                background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Award size={24} color="white" />
                            </div>
                            <div>
                                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700 }}>
                                    Faculty Dashboard
                                </h1>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                    Evaluate and rank Best Outgoing Student candidates
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={downloadCSV} className="btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Download size={18} /> Export CSV
                            </button>
                            <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </div>
                </motion.div>

                {error && (
                    <div style={{
                        padding: '20px', borderRadius: 'var(--radius-md)',
                        background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.25)',
                        color: '#B45309', fontSize: '14px', marginBottom: '24px',
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Analytics */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}
                >
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>Total Applications</h3>
                        <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--srm-blue)' }}>{students.length}</div>
                    </div>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>Department Breakdown</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {deptStats.slice(0, 5).map(([dept, count]) => (
                                <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{dept}</span>
                                    <span style={{ fontWeight: 600 }}>{count}</span>
                                </div>
                            ))}
                            {deptStats.length === 0 && <span style={{ color: 'var(--text-muted)' }}>No data available</span>}
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="form-input"
                            style={{ paddingLeft: '40px' }}
                            placeholder="Search by name or register number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="form-input"
                        style={{ width: 'auto', minWidth: '200px' }}
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                {/* Rankings Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
                >
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>Rank</th>
                                    <th>Name</th>
                                    <th>Register No.</th>
                                    <th>Department</th>
                                    <th style={{ width: '120px' }}>Score</th>
                                    <th style={{ width: '150px' }}>Score Bar</th>
                                    <th style={{ width: '160px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                            {students.length === 0
                                                ? 'No applications yet. Students can apply via the Apply page.'
                                                : 'No results match your search.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((student) => {
                                        const originalRank = students.findIndex(
                                            (s) => s.registerNumber === student.registerNumber
                                        ) + 1;
                                        const maxScore = students.length > 0 ? students[0].totalScore : 100;
                                        const displayScore = getDisplayScore(student);
                                        const isExpanded = expandedRow === student.registerNumber;
                                        const fullData = getFullStudent(student.registerNumber);

                                        return (
                                            <React.Fragment key={student.registerNumber}>
                                                <tr
                                                    style={{ cursor: 'pointer', background: isExpanded ? 'rgba(3,77,161,0.03)' : undefined }}
                                                    onClick={() => setExpandedRow(isExpanded ? null : student.registerNumber)}
                                                >
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                            background: originalRank <= 3 ? 'var(--accent-gradient)' : 'var(--bg-card)',
                                                            color: originalRank <= 3 ? 'white' : 'var(--text-secondary)',
                                                            fontSize: '13px', fontWeight: 700,
                                                        }}>
                                                            {originalRank}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</td>
                                                    <td style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '13px' }}>{student.registerNumber}</td>
                                                    <td>{student.department}</td>
                                                    <td>
                                                        {editingScore === student.registerNumber ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
                                                                <input
                                                                    className="form-input"
                                                                    type="number"
                                                                    step="0.1"
                                                                    min="0"
                                                                    max="100"
                                                                    value={tempScore}
                                                                    onChange={(e) => setTempScore(e.target.value)}
                                                                    style={{ width: '70px', padding: '4px 6px', fontSize: '13px' }}
                                                                    autoFocus
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') saveScore(student.registerNumber);
                                                                        if (e.key === 'Escape') cancelEditScore();
                                                                    }}
                                                                />
                                                                <button onClick={() => saveScore(student.registerNumber)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16A34A', padding: '2px' }}>
                                                                    <Save size={14} />
                                                                </button>
                                                                <button onClick={cancelEditScore} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '2px' }}>
                                                                    <XCircle size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span className="gradient-text" style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                                                                    {displayScore.toFixed(1)}
                                                                </span>
                                                                {scoreOverrides[student.registerNumber] !== undefined && (
                                                                    <span style={{ fontSize: '10px', background: 'rgba(228,179,22,0.15)', color: '#B8860B', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                                                        MANUAL
                                                                    </span>
                                                                )}
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); startEditScore(student.registerNumber, student.totalScore); }}
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                                                                    title="Override score"
                                                                >
                                                                    <Edit3 size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="score-bar">
                                                            <div className="score-bar-fill" style={{ width: `${(displayScore / maxScore) * 100}%` }} />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                            <Link
                                                                href={`/${student.registerNumber}`}
                                                                style={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                                    fontSize: '12px', color: 'var(--accent-primary)', textDecoration: 'none',
                                                                    padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                                                                    border: '1px solid rgba(3, 77, 161, 0.25)',
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                View <ExternalLink size={10} />
                                                            </Link>
                                                            <span style={{ color: 'var(--text-muted)' }}>
                                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expandable Detail Row */}
                                                {isExpanded && fullData && (
                                                    <tr>
                                                        <td colSpan={7} style={{ padding: 0 }}>
                                                            <AnimatePresence>
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                    style={{ overflow: 'hidden' }}
                                                                >
                                                                    <StudentDetailPanel
                                                                        student={fullData}
                                                                        regNo={student.registerNumber}
                                                                        isDiscarded={isDiscarded}
                                                                        toggleDiscard={toggleDiscard}
                                                                    />
                                                                </motion.div>
                                                            </AnimatePresence>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>
        </>
    );
}

// Need React import for React.Fragment
import React from 'react';

// ===== STUDENT DETAIL PANEL =====
function StudentDetailPanel({
    student,
    regNo,
    isDiscarded,
    toggleDiscard,
}: {
    student: StudentApplication;
    regNo: string;
    isDiscarded: (regNo: string, section: string, itemId: string) => boolean;
    toggleDiscard: (regNo: string, section: string, itemId: string) => void;
}) {
    const pd = student.personalDetails;
    const ac = student.academicRecord;
    const pc = student.postCollegeStatus;

    const sectionStyle = { marginBottom: '24px' };
    const headingStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' };
    const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' };
    const labelStyle: React.CSSProperties = { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' as const, fontWeight: 600 };
    const valueStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--text-primary)' };

    return (
        <div style={{ padding: '24px 32px', background: 'rgba(3,77,161,0.02)', borderTop: '1px solid var(--border-subtle)' }}>
            {/* Personal Details */}
            <div style={sectionStyle}>
                <h4 style={headingStyle}>👤 Personal Details</h4>
                <div style={gridStyle}>
                    <DetailField label="Name" value={pd.name} />
                    <DetailField label="Register No" value={pd.registerNumber} />
                    <DetailField label="Department" value={pd.department} />
                    <DetailField label="Specialization" value={pd.specialization} />
                    <DetailField label="Personal Email" value={pd.personalEmail} />
                    <DetailField label="SRM Email" value={pd.srmEmail} />
                    <DetailField label="Mobile" value={pd.mobileNumber} />
                    {pd.profilePhotoUrl && <DetailField label="Photo" value={pd.profilePhotoUrl} isLink />}
                </div>
            </div>

            {/* Academic Record */}
            <div style={sectionStyle}>
                <h4 style={headingStyle}>📚 Academic Record</h4>
                <div style={gridStyle}>
                    <DetailField label="CGPA" value={ac.cgpa.toString()} />
                    <DetailField label="10th %" value={ac.tenthPercentage.toString()} />
                    <DetailField label="12th %" value={ac.twelfthPercentage.toString()} />
                    <DetailField label="Arrears" value={ac.historyOfArrears ? `Yes (${ac.numberOfArrears || 0})` : 'No'} />
                </div>
            </div>

            {/* Post-College Status */}
            <div style={sectionStyle}>
                <h4 style={headingStyle}>🎯 Post-College Status</h4>
                <div style={gridStyle}>
                    <DetailField label="Status" value={fmtStatus(pc.status)} />
                    {pc.placedCompany && <DetailField label="Company/University" value={pc.placedCompany} />}
                    {pc.offerLetterLink && <DetailField label="Offer Letter" value={pc.offerLetterLink} isLink />}
                    {pc.otherDetails && <DetailField label="Details" value={pc.otherDetails} />}
                </div>
            </div>

            {/* Internships */}
            {student.internships.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>💼 Internships ({student.internships.length})</h4>
                    {student.internships.map((item, i) => {
                        const itemId = item.id || `int-${i}`;
                        const discarded = isDiscarded(regNo, 'internships', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'internships', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Company" value={item.company} />
                                    <DetailField label="Role" value={item.role} />
                                    <DetailField label="Duration" value={`${fmtDate(item.startDate)} → ${fmtDate(item.endDate)}`} />
                                    {item.description && <DetailField label="Description" value={item.description} />}
                                    {item.certificateLink && <DetailField label="Certificate" value={item.certificateLink} isLink />}
                                </div>
                            </DetailItem>
                        );
                    })}
                </div>
            )}

            {/* Projects */}
            {student.projects.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>🚀 Projects ({student.projects.length})</h4>
                    {student.projects.map((item, i) => {
                        const itemId = item.id || `proj-${i}`;
                        const discarded = isDiscarded(regNo, 'projects', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'projects', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Title" value={item.title} />
                                    <DetailField label="Tech Stack" value={item.techStack} />
                                    <DetailField label="Description" value={item.description} />
                                    {item.githubLink && <DetailField label="GitHub" value={item.githubLink} isLink />}
                                    {item.deployedLink && <DetailField label="Live Demo" value={item.deployedLink} isLink />}
                                </div>
                            </DetailItem>
                        );
                    })}
                </div>
            )}

            {/* Hackathons */}
            {student.hackathons.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>⚡ Hackathons ({student.hackathons.length})</h4>
                    {student.hackathons.map((item, i) => {
                        const itemId = item.id || `hack-${i}`;
                        const discarded = isDiscarded(regNo, 'hackathons', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'hackathons', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Name" value={item.name} />
                                    <DetailField label="Project Built" value={item.projectBuilt} />
                                    <DetailField label="Team Size" value={item.teamSize.toString()} />
                                    <DetailField label="Position" value={item.position} />
                                    {item.proofLink && <DetailField label="Proof" value={item.proofLink} isLink />}
                                </div>
                            </DetailItem>
                        );
                    })}
                </div>
            )}

            {/* Research */}
            {student.research.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>📄 Research ({student.research.length})</h4>
                    {student.research.map((item, i) => {
                        const itemId = item.id || `res-${i}`;
                        const discarded = isDiscarded(regNo, 'research', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'research', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Title" value={item.title} />
                                    <DetailField label="Journal/Conference" value={item.journalOrConference} />
                                    <DetailField label="Index Status" value={item.indexStatus.toUpperCase()} />
                                    <DetailField label="Publication Status" value={item.publicationStatus.replace('_', ' ')} />
                                    {item.link && <DetailField label="Link" value={item.link} isLink />}
                                </div>
                            </DetailItem>
                        );
                    })}
                </div>
            )}

            {/* Certifications */}
            {student.certifications.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>🏅 Certifications ({student.certifications.length})</h4>
                    {student.certifications.map((item, i) => {
                        const itemId = item.id || `cert-${i}`;
                        const discarded = isDiscarded(regNo, 'certifications', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'certifications', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Provider" value={item.provider} />
                                    <DetailField label="Certificate" value={item.certificateName} />
                                    {item.validationId && <DetailField label="Validation ID" value={item.validationId} />}
                                    {item.proofLink && <DetailField label="Proof" value={item.proofLink} isLink />}
                                </div>
                            </DetailItem>
                        );
                    })}
                </div>
            )}

            {/* Entrepreneurship */}
            {student.entrepreneurship.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>🏢 Entrepreneurship ({student.entrepreneurship.length})</h4>
                    {student.entrepreneurship.map((item, i) => {
                        const itemId = item.id || `ent-${i}`;
                        const discarded = isDiscarded(regNo, 'entrepreneurship', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'entrepreneurship', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Startup" value={item.startupName} />
                                    {item.registrationDetails && <DetailField label="Registration" value={item.registrationDetails} />}
                                    {item.revenueOrFundingStatus && <DetailField label="Revenue/Funding" value={item.revenueOrFundingStatus} />}
                                    {item.description && <DetailField label="Description" value={item.description} />}
                                    {item.proofLink && <DetailField label="Proof" value={item.proofLink} isLink />}
                                </div>
                            </DetailItem>
                        );
                    })}
                </div>
            )}

            {/* Competitive Exams */}
            {student.competitiveExams.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>📝 Competitive Exams ({student.competitiveExams.length})</h4>
                    {student.competitiveExams.map((item, i) => {
                        const itemId = item.id || `exam-${i}`;
                        const discarded = isDiscarded(regNo, 'exams', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'exams', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Exam" value={item.examName} />
                                    <DetailField label="Score/Rank" value={item.scoreOrRank} />
                                    {item.proofLink && <DetailField label="Proof" value={item.proofLink} isLink />}
                                </div>
                            </DetailItem>
                        );
                    })}
                </div>
            )}

            {/* Sports/Cultural */}
            {student.sportsOrCultural.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>🏆 Sports / Cultural ({student.sportsOrCultural.length})</h4>
                    {student.sportsOrCultural.map((item, i) => {
                        const itemId = item.id || `sport-${i}`;
                        const discarded = isDiscarded(regNo, 'sports', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'sports', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Event" value={item.eventName} />
                                    <DetailField label="Level" value={item.level.toUpperCase()} />
                                    <DetailField label="Position" value={item.positionWon} />
                                    {item.proofLink && <DetailField label="Proof" value={item.proofLink} isLink />}
                                </div>
                            </DetailItem>
                        );
                    })}
                </div>
            )}

            {/* Volunteering */}
            {student.volunteering.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>🤝 Volunteering ({student.volunteering.length})</h4>
                    {student.volunteering.map((item, i) => {
                        const itemId = item.id || `vol-${i}`;
                        const discarded = isDiscarded(regNo, 'volunteering', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'volunteering', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Organization" value={item.organization} />
                                    <DetailField label="Role" value={item.role} />
                                    {item.hoursServed ? <DetailField label="Hours" value={item.hoursServed.toString()} /> : null}
                                    {item.impact && <DetailField label="Impact" value={item.impact} />}
                                    {item.proofLink && <DetailField label="Proof" value={item.proofLink} isLink />}
                                </div>
                            </DetailItem>
                        );
                    })}
                </div>
            )}

            {/* Scholarships */}
            {student.scholarships.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>🎓 Scholarships ({student.scholarships.length})</h4>
                    {student.scholarships.map((item, i) => {
                        const itemId = item.id || `sch-${i}`;
                        const discarded = isDiscarded(regNo, 'scholarships', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'scholarships', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Name" value={item.name} />
                                    <DetailField label="Awarding Body" value={item.awardingBody} />
                                    {item.amountOrPrestige && <DetailField label="Amount/Prestige" value={item.amountOrPrestige} />}
                                    {item.proofLink && <DetailField label="Proof" value={item.proofLink} isLink />}
                                </div>
                            </DetailItem>
                        );
                    })}
                </div>
            )}

            {/* Clubs */}
            {student.clubActivities.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>🏛️ Clubs / Leadership ({student.clubActivities.length})</h4>
                    {student.clubActivities.map((item, i) => {
                        const itemId = item.id || `club-${i}`;
                        const discarded = isDiscarded(regNo, 'clubs', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'clubs', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Club" value={item.clubName} />
                                    <DetailField label="Position" value={item.position} />
                                    {item.keyEventsOrganized && <DetailField label="Events Organized" value={item.keyEventsOrganized} />}
                                    {item.impactDescription && <DetailField label="Impact" value={item.impactDescription} />}
                                    {item.proofLink && <DetailField label="Proof" value={item.proofLink} isLink />}
                                </div>
                            </DetailItem>
                        );
                    })}
                </div>
            )}

            {/* Dept Contributions */}
            {student.departmentContributions.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>🏫 Department Contributions ({student.departmentContributions.length})</h4>
                    {student.departmentContributions.map((item, i) => {
                        const itemId = item.id || `dept-${i}`;
                        const discarded = isDiscarded(regNo, 'deptContrib', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'deptContrib', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Event" value={item.eventName} />
                                    <DetailField label="Role" value={item.role} />
                                    {item.contributionDescription && <DetailField label="Description" value={item.contributionDescription} />}
                                    {item.proofLink && <DetailField label="Proof" value={item.proofLink} isLink />}
                                </div>
                            </DetailItem>
                        );
                    })}
                </div>
            )}

            {/* References */}
            {student.references.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>👨‍🏫 References ({student.references.length})</h4>
                    {student.references.map((item, i) => (
                        <div key={i} style={{ marginBottom: '8px', padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={gridStyle}>
                                <DetailField label="Faculty" value={item.facultyName} />
                                <DetailField label="Contact" value={item.contact} />
                                {item.lorLink && <DetailField label="LoR" value={item.lorLink} isLink />}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Social Media */}
            <div style={sectionStyle}>
                <h4 style={headingStyle}>🌐 Social Media & Links</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {student.socialMedia.linkedin && <LinkButton label="LinkedIn" href={student.socialMedia.linkedin} />}
                    {student.socialMedia.github && <LinkButton label="GitHub" href={student.socialMedia.github} />}
                    {student.socialMedia.twitter && <LinkButton label="X/Twitter" href={student.socialMedia.twitter} />}
                    {student.socialMedia.instagram && <LinkButton label="Instagram" href={student.socialMedia.instagram} />}
                    {student.socialMedia.website && <LinkButton label="Website" href={student.socialMedia.website} />}
                    {student.videoPitchUrl && <LinkButton label="🎬 Video Pitch" href={student.videoPitchUrl} highlight />}
                    {student.masterProofFolderUrl && <LinkButton label="📁 Master Proofs" href={student.masterProofFolderUrl} highlight />}
                </div>
            </div>

            {/* Future Goal */}
            <div style={sectionStyle}>
                <h4 style={headingStyle}>🎯 Future Goal</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                    &ldquo;{student.futureGoal.description}&rdquo;
                </p>
            </div>
        </div>
    );
}

// ===== HELPER COMPONENTS =====
function DetailField({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
    return (
        <div style={{ marginBottom: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em' }}>{label}</div>
            {isLink ? (
                <a href={value} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: '13px', color: 'var(--accent-primary)', textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}>
                    Open Link <ExternalLink size={10} />
                </a>
            ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', wordBreak: 'break-word' }}>{value}</div>
            )}
        </div>
    );
}

function DetailItem({ children, discarded, onToggle }: { children: React.ReactNode; discarded: boolean; onToggle: () => void }) {
    return (
        <div style={{
            marginBottom: '8px', padding: '10px 14px',
            background: discarded ? 'rgba(220, 38, 38, 0.04)' : 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)', border: `1px solid ${discarded ? 'rgba(220, 38, 38, 0.2)' : 'var(--border-subtle)'}`,
            opacity: discarded ? 0.5 : 1, textDecoration: discarded ? 'line-through' : 'none',
            position: 'relative',
        }}>
            <button
                onClick={onToggle}
                title={discarded ? 'Restore this item' : 'Discard this item'}
                style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: discarded ? 'rgba(22,163,74,0.1)' : 'rgba(220, 38, 38, 0.06)',
                    border: `1px solid ${discarded ? 'rgba(22,163,74,0.3)' : 'rgba(220, 38, 38, 0.2)'}`,
                    borderRadius: '4px', padding: '2px 8px', cursor: 'pointer',
                    fontSize: '11px', fontWeight: 600,
                    color: discarded ? '#16A34A' : '#DC2626',
                }}
            >
                {discarded ? '↩ Restore' : <><X size={10} /> Discard</>}
            </button>
            {children}
        </div>
    );
}

function LinkButton({ label, href, highlight }: { label: string; href: string; highlight?: boolean }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 12px', borderRadius: '16px', fontSize: '12px',
                textDecoration: 'none', fontWeight: 500,
                background: highlight ? 'rgba(3,77,161,0.08)' : 'var(--bg-card)',
                color: highlight ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: `1px solid ${highlight ? 'rgba(3,77,161,0.25)' : 'var(--border-subtle)'}`,
            }}
        >
            {label} <ExternalLink size={10} />
        </a>
    );
}
