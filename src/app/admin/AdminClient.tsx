'use client';

import { RankedStudent, StudentApplication } from '@/lib/types';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Award, ExternalLink, Search, LogOut, Download, ChevronDown, ChevronUp, X, Edit3, Save, XCircle, Calendar, CheckSquare, Square, BarChart2 } from 'lucide-react';
import { calculateScore } from '@/lib/ranking';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import React from 'react';
import ComparisonModal from '@/components/ComparisonModal';
import { useRouter } from 'next/navigation';
import { AWARD_CATEGORIES, AwardSlug } from '@/lib/awards';
import AwardAdminPanel from '@/components/AwardAdminPanel';

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
    const [activeAward, setActiveAward] = useState<AwardSlug>('best-outgoing');
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');
    const [advisorFilter, setAdvisorFilter] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(50);

    // Batch Saving State
    const [changedRegNos, setChangedRegNos] = useState<Set<string>>(new Set());

    // Warn on unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (changedRegNos.size > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [changedRegNos]);

    // Initialize state from fullStudents
    const [discardedItems, setDiscardedItems] = useState<Record<string, Set<string>>>(() => {
        const initial: Record<string, Set<string>> = {};
        fullStudents.forEach(s => {
            if (s.discardedItems && s.discardedItems.length > 0 && s.personalDetails?.registerNumber) {
                initial[s.personalDetails.registerNumber] = new Set(s.discardedItems);
            }
        });
        return initial;
    });

    const [scoreOverrides, setScoreOverrides] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        fullStudents.forEach(s => {
            if (s.facultyScore !== undefined && s.personalDetails?.registerNumber) {
                initial[s.personalDetails.registerNumber] = s.facultyScore;
            }
        });
        return initial;
    });

    const [verifiedStatus, setVerifiedStatus] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        fullStudents.forEach(s => {
            if (s.verified && s.personalDetails?.registerNumber) {
                initial[s.personalDetails.registerNumber] = true;
            }
        });
        return initial;
    });

    const [editingScore, setEditingScore] = useState<string | null>(null);
    const [tempScore, setTempScore] = useState('');


    // Deadline State
    const [deadline, setDeadline] = useState<string>('');
    const [isSettingDeadline, setIsSettingDeadline] = useState(false);
    const deadlineTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Comparison State
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    const router = useRouter();

    useEffect(() => {
        // Fetch deadline
        fetch('/api/admin/settings').then(res => res.json()).then(data => {
            if (data.deadline) setDeadline(new Date(data.deadline).toISOString().slice(0, 16));
        });
    }, []);

    const saveDeadline = (val: string) => {
        setDeadline(val);
        if (deadlineTimerRef.current) clearTimeout(deadlineTimerRef.current);
        deadlineTimerRef.current = setTimeout(async () => {
            try {
                await fetch('/api/admin/settings', {
                    method: 'POST',
                    body: JSON.stringify({ deadline: val }),
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (e) {
                console.error(e);
            }
        }, 800);
    };

    const toggleSelection = (regNo: string) => {
        setSelectedStudents(prev =>
            prev.includes(regNo) ? prev.filter(id => id !== regNo) : [...prev, regNo]
        );
    };

    // Get full student data by register number
    const getFullStudent = (regNo: string): StudentApplication | undefined => {
        return fullStudents.find(s => s.personalDetails?.registerNumber === regNo);
    };

    const getDisplayScore = useCallback((student: RankedStudent) => {
        // 1. If manual override exists, use it
        if (scoreOverrides[student.registerNumber] !== undefined) {
            return scoreOverrides[student.registerNumber];
        }

        // 2. Otherwise, recalculate based on discarded items
        const fullData = fullStudents.find(s => s.personalDetails?.registerNumber === student.registerNumber);
        if (!fullData) return student.totalScore;

        const currentDiscarded = Array.from(discardedItems[student.registerNumber] || []);
        if (currentDiscarded.length === 0) return student.totalScore;

        // Recalculate
        return calculateScore(fullData, undefined, currentDiscarded).totalScore;
    }, [scoreOverrides, discardedItems, fullStudents]);

    // Dynamically sort students based on current display score
    const sortedStudents = useMemo(() => {
        return [...students].sort((a, b) => {
            const scoreA = getDisplayScore(a);
            const scoreB = getDisplayScore(b);
            return scoreB - scoreA; // Descending order
        });
    }, [students, getDisplayScore]);

    const departments = [...new Set(students.map((s) => s.department))];

    const sections = useMemo(() => {
        const s = new Set(fullStudents.map(fs => fs.personalDetails?.section).filter(Boolean));
        return Array.from(s).sort();
    }, [fullStudents]);

    const advisors = useMemo(() => {
        const a = new Set(fullStudents.map(fs => fs.personalDetails?.facultyAdvisor).filter(Boolean));
        return Array.from(a).sort();
    }, [fullStudents]);

    const filtered = useMemo(() => sortedStudents.filter((s) => {
        const fullStudent = getFullStudent(s.registerNumber);
        const matchesSearch =
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.registerNumber.toLowerCase().includes(search.toLowerCase()) ||
            fullStudent?.personalDetails?.specialization?.toLowerCase().includes(search.toLowerCase());
        const matchesDept = !deptFilter || s.department === deptFilter;
        const matchesSection = !sectionFilter || fullStudent?.personalDetails?.section === sectionFilter;
        const matchesAdvisor = !advisorFilter || fullStudent?.personalDetails?.facultyAdvisor === advisorFilter;

        return matchesSearch && matchesDept && matchesSection && matchesAdvisor;
    }), [sortedStudents, search, deptFilter, sectionFilter, advisorFilter, fullStudents]);

    // PAGINATION SLICE
    const visibleStudents = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

    const loadMore = () => {
        setVisibleCount(prev => prev + 50);
    };

    // Analytics
    const deptStats = useMemo(() => {
        const stats: Record<string, number> = {};
        students.forEach(s => {
            const dept = s.department || 'Unknown';
            stats[dept] = (stats[dept] || 0) + 1;
        });
        return Object.entries(stats).sort((a, b) => b[1] - a[1]);
    }, [students]);

    // Batch Save
    const saveAllChanges = async () => {
        if (changedRegNos.size === 0) return;
        setIsSaving(true);
        try {
            const updates = Array.from(changedRegNos).map(regNo => ({
                regNo,
                facultyScore: scoreOverrides[regNo],
                isVerified: !!verifiedStatus[regNo],
                discardedItems: Array.from(discardedItems[regNo] || [])
            }));

            const res = await fetch('/api/admin/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to save changes');
            }

            setChangedRegNos(new Set());
        } catch (err) {
            console.error('Failed to save', err);
            alert('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Discard logic
    const toggleDiscard = (regNo: string, section: string, itemId: string) => {
        setDiscardedItems(prev => {
            const key = `${regNo}::${section}::${itemId}`;
            const currentSet = new Set(prev[regNo] || []);
            if (currentSet.has(key)) {
                currentSet.delete(key);
            } else {
                currentSet.add(key);
            }

            // Mark as changed
            setChangedRegNos(prevChanged => new Set(prevChanged).add(regNo));

            return { ...prev, [regNo]: currentSet };
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
            // Mark as changed
            setChangedRegNos(prevChanged => new Set(prevChanged).add(regNo));
        }
        setEditingScore(null);
    };

    const cancelEditScore = () => {
        setEditingScore(null);
        setTempScore('');
    };



    const escapeCSV = (val: unknown): string => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const downloadCSV = () => {
        const headers = ['Rank', 'Name', 'Register Number', 'Department', 'Section', 'Faculty Advisor', 'Auto Score', 'Faculty Score', 'CGPA', 'Research', 'Internships', 'Projects', 'Hackathons', 'Professional Memberships'];
        const rows = students.map((s, i) => {
            const fullStudent = fullStudents.find(fs => fs.personalDetails?.registerNumber === s.registerNumber);
            return [
                i + 1,
                s.name,
                s.registerNumber,
                s.department,
                fullStudent?.personalDetails.section || '',
                fullStudent?.personalDetails.facultyAdvisor || '',
                s.totalScore.toFixed(2),
                (scoreOverrides[s.registerNumber] ?? s.totalScore).toFixed(2),
                s.breakdown.cgpa,
                s.breakdown.research,
                s.breakdown.internships,
                s.breakdown.projects,
                s.breakdown.hackathons,
                s.breakdown.professionalMemberships,
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.map(h => escapeCSV(h)).join(','), ...rows.map(e => e.map(v => escapeCSV(v)).join(','))].join('\n');

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
            <main style={{
                padding: 'clamp(80px, 10vh, 120px) clamp(12px, 5vw, 24px) 60px clamp(12px, 5vw, 24px)',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ marginBottom: '40px' }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '32px',
                        flexDirection: 'column',
                        gap: '24px'
                    }} className="lg:flex-row lg:items-center">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: 'clamp(40px, 10vw, 48px)',
                                height: 'clamp(40px, 10vw, 48px)',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--accent-gradient)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Award size={24} color="white" />
                            </div>
                            <div>
                                <h1 style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                                    fontWeight: 700,
                                    lineHeight: 1.2
                                }}>
                                    Faculty Dashboard
                                </h1>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    Evaluate and rank candidates
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            width: '100%',
                            justifyContent: 'flex-start'
                        }} className="lg:w-auto lg:justify-end">
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'var(--bg-card)',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-subtle)',
                                flex: 1,
                                minWidth: '200px'
                            }}>
                                <Calendar size={16} className="text-muted" />
                                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Form Deadline</span>
                                    <input
                                        type="datetime-local"
                                        value={deadline}
                                        onChange={(e) => saveDeadline(e.target.value)}
                                        style={{
                                            background: 'transparent', border: 'none', color: 'var(--text-primary)',
                                            fontSize: '13px', fontWeight: 500, outline: 'none', cursor: 'pointer',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', width: '100%' }} className="sm:w-auto">
                                <button onClick={handleLogout} className="btn-secondary" style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', padding: '10px 16px' }}>
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                    {isSaving && (
                        <div style={{
                            position: 'fixed', bottom: '24px', right: '24px',
                            background: 'var(--bg-card)', padding: '12px 20px',
                            borderRadius: 'var(--radius-full)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            border: '1px solid var(--border-subtle)', zIndex: 100,
                            fontSize: '13px', fontWeight: 500, color: 'var(--accent-primary)'
                        }}>
                            <div className="animate-spin" style={{ width: '14px', height: '14px', border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                            Saving changes...
                        </div>
                    )}
                </motion.div>

                {/* Award Category Tabs */}
                <div style={{
                    display: 'flex', gap: '6px', marginBottom: '28px', overflowX: 'auto',
                    padding: '4px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    WebkitOverflowScrolling: 'touch',
                }}>
                    {AWARD_CATEGORIES.map(award => (
                        <button
                            key={award.slug}
                            onClick={() => { setActiveAward(award.slug); setSearch(''); setDeptFilter(''); setSectionFilter(''); setAdvisorFilter(''); }}
                            style={{
                                padding: '10px 16px', borderRadius: '8px', border: 'none',
                                background: activeAward === award.slug ? award.color : 'transparent',
                                color: activeAward === award.slug ? 'white' : 'var(--text-secondary)',
                                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                                opacity: activeAward === award.slug ? 1 : 0.7,
                            }}
                        >
                            {award.shortTitle}
                        </button>
                    ))}
                </div>

                {/* Show AwardAdminPanel for non-BO awards */}
                {activeAward !== 'best-outgoing' ? (
                    <AwardAdminPanel slug={activeAward} />
                ) : (
                    <>

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
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '20px', marginBottom: '40px' }}
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
                                style={{ width: 'auto', minWidth: '150px' }}
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>

                            <select
                                className="form-input"
                                style={{ width: 'auto', minWidth: '120px' }}
                                value={sectionFilter}
                                onChange={(e) => setSectionFilter(e.target.value)}
                            >
                                <option value="">All Sections</option>
                                {sections.map((sec) => (
                                    <option key={sec} value={sec}>Section {sec}</option>
                                ))}
                            </select>

                            <select
                                className="form-input"
                                style={{ width: 'auto', minWidth: '180px' }}
                                value={advisorFilter}
                                onChange={(e) => setAdvisorFilter(e.target.value)}
                            >
                                <option value="">All Advisors</option>
                                {advisors.map((adv) => (
                                    <option key={adv} value={adv}>{adv}</option>
                                ))}
                            </select>
                            <button onClick={downloadCSV} className="btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 16px' }}>
                                <Download size={18} /> Export CSV
                            </button>
                        </div>

                        {/* Rankings Table */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                border: '1px solid var(--border-subtle)',
                                background: 'var(--bg-card)' // Ensure background for scrolling
                            }}
                        >
                            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}> {/* Add touch scrolling */}
                                {/* Force min-width to trigger scroll */}
                                <table className="data-table" style={{ minWidth: '800px' }}>

                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}>
                                                <div
                                                    onClick={() => setSelectedStudents(selectedStudents.length === filtered.length && filtered.length > 0 ? [] : filtered.map(s => s.registerNumber))}
                                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {selectedStudents.length > 0 && selectedStudents.length === filtered.length ? <CheckSquare size={16} /> : <Square size={16} />}
                                                </div>
                                            </th>
                                            <th style={{ width: '50px' }}>Rank</th>
                                            <th>Name</th>
                                            <th className="hide-on-mobile">Department</th>
                                            <th style={{ width: '60px' }}>Sec</th>
                                            <th style={{ width: '120px' }}>Score</th>
                                            <th style={{ width: '150px' }}>Params</th>
                                            <th style={{ width: '80px' }}>Profile</th>
                                            <th style={{ width: '40px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                                    {students.length === 0 ? 'No applications yet.' : 'No results found.'}
                                                </td>
                                            </tr>
                                        ) : (
                                            visibleStudents.map((student, index) => {
                                                const isExpanded = expandedRow === student.registerNumber;
                                                const displayScore = getDisplayScore(student);
                                                const isSelected = selectedStudents.includes(student.registerNumber);
                                                const fullStudent = fullStudents.find(s => s.personalDetails?.registerNumber === student.registerNumber);
                                                const isVerified = verifiedStatus[student.registerNumber] || false;

                                                return (
                                                    <React.Fragment key={student.registerNumber}>
                                                        <tr
                                                            style={{ borderBottom: '1px solid var(--border-subtle)', background: isExpanded ? 'var(--bg-surface)' : 'transparent', transition: 'background 0.2s' }}
                                                            onClick={() => setExpandedRow(isExpanded ? null : student.registerNumber)}
                                                        >
                                                            <td style={{ textAlign: 'center' }} onClick={e => { e.stopPropagation(); toggleSelection(student.registerNumber); }}>
                                                                {isSelected ? <CheckSquare size={16} color="var(--accent-primary)" /> : <Square size={16} color="var(--text-muted)" />}
                                                            </td>
                                                            <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                                                #{index + 1}
                                                                {isVerified && <span style={{ marginLeft: '4px' }}>✅</span>}
                                                            </td>
                                                            <td>
                                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{student.name}</div>
                                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{student.registerNumber}</div>
                                                            </td>
                                                            <td style={{ fontSize: '13px' }} className="hide-on-mobile">{student.department}</td>
                                                            <td style={{ fontSize: '13px', textAlign: 'center' }}>{fullStudent?.personalDetails.section}</td>
                                                            <td style={{ fontFamily: 'monospace', fontWeight: 700, textAlign: 'right' }}>
                                                                {editingScore === student.registerNumber ? (
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }} onClick={e => e.stopPropagation()}>
                                                                        <input
                                                                            autoFocus
                                                                            type="number"
                                                                            value={tempScore}
                                                                            onChange={e => setTempScore(e.target.value)}
                                                                            onClick={e => e.stopPropagation()}
                                                                            onKeyDown={e => {
                                                                                if (e.key === 'Enter') saveScore(student.registerNumber);
                                                                                if (e.key === 'Escape') setEditingScore(null);
                                                                            }}
                                                                            style={{ width: '60px', padding: '4px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--accent-primary)' }}
                                                                        />
                                                                        <button onClick={() => saveScore(student.registerNumber)} style={{ color: '#16A34A' }}><Save size={14} /></button>
                                                                        <button onClick={cancelEditScore} style={{ color: '#DC2626' }}><XCircle size={14} /></button>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                                        {displayScore.toFixed(2)}
                                                                        <Edit3 size={12} style={{ opacity: 0.5, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); startEditScore(student.registerNumber, displayScore); }} />
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div style={{ width: '100%', height: '6px', background: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden' }}>
                                                                    <div style={{ width: `${Math.min(displayScore, 100)}%`, height: '100%', background: 'var(--accent-gradient)' }} />
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <Link
                                                                    href={`/${student.registerNumber}`}
                                                                    target="_blank"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{
                                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                                        padding: '4px 8px', borderRadius: '4px', background: 'rgba(3,77,161,0.05)',
                                                                        color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '12px', fontWeight: 600
                                                                    }}
                                                                >
                                                                    View <ExternalLink size={12} />
                                                                </Link>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </td>
                                                        </tr>
                                                        {isExpanded && fullStudent && (
                                                            <tr>
                                                                <td colSpan={9} style={{ padding: 0 }}>
                                                                    <StudentDetailPanel
                                                                        student={fullStudent}
                                                                        regNo={student.registerNumber}
                                                                        isDiscarded={isDiscarded}
                                                                        toggleDiscard={toggleDiscard}
                                                                        isVerified={isVerified}
                                                                        setVerified={(v: boolean) => {
                                                                            setVerifiedStatus(prev => ({ ...prev, [student.registerNumber]: v }));
                                                                            setChangedRegNos(prev => new Set(prev).add(student.registerNumber));
                                                                        }}
                                                                    />
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

                            {/* Load More Button */}
                            {visibleCount < filtered.length && (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', borderTop: '1px solid var(--border-subtle)' }}>
                                    <button
                                        onClick={loadMore}
                                        className="btn-secondary"
                                        style={{ padding: '12px 32px' }}
                                    >
                                        Load More ({filtered.length - visibleCount} remaining)
                                    </button>
                                </div>
                            )}
                        </motion.div>

                        {/* Floating Save Button */}
                        <AnimatePresence>
                            {(changedRegNos.size > 0 || isSaving) && (
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 50, opacity: 0 }}
                                    style={{
                                        position: 'fixed', bottom: '24px', right: '24px',
                                        zIndex: 100
                                    }}
                                >
                                    <button
                                        onClick={saveAllChanges}
                                        className="btn-primary"
                                        disabled={isSaving}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            background: isSaving ? 'var(--text-muted)' : 'var(--accent-primary)',
                                            padding: '12px 24px', borderRadius: 'var(--radius-full)',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                            color: 'white', border: 'none', cursor: isSaving ? 'wait' : 'pointer'
                                        }}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Save {changedRegNos.size} Updates
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Compare Button */}
                        <AnimatePresence>
                            {selectedStudents.length > 0 && (
                                <motion.div
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 100, opacity: 0 }}
                                    style={{
                                        position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                                        background: 'var(--accent-primary)', color: 'white',
                                        padding: '12px 24px', borderRadius: 'var(--radius-full)',
                                        boxShadow: '0 8px 32px rgba(3, 77, 161, 0.4)',
                                        display: 'flex', alignItems: 'center', gap: '12px', zIndex: 50,
                                        cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)'
                                    }}
                                    onClick={() => setIsCompareModalOpen(true)}
                                >
                                    <BarChart2 size={20} />
                                    <span style={{ fontWeight: 600 }}>Compare {selectedStudents.length} Candidates</span>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '20px', height: '20px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px'
                                    }} onClick={(e) => { e.stopPropagation(); setSelectedStudents([]); }}>
                                        <X size={12} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Comparison Modal */}
                        <AnimatePresence>
                            {isCompareModalOpen && selectedStudents.length > 0 && (
                                <ComparisonModal
                                    isOpen={isCompareModalOpen}
                                    onClose={() => setIsCompareModalOpen(false)}
                                    selectedStudents={filtered.filter(s => selectedStudents.includes(s.registerNumber)).map(s => {
                                        const full = fullStudents.find(fs => fs.personalDetails?.registerNumber === s.registerNumber);
                                        return { ...full, overallResults: s };
                                    })}
                                />
                            )}
                        </AnimatePresence>
                    </>
                )}
            </main>
        </>
    );
}

// Need React import for React.Fragment


// ===== STUDENT DETAIL PANEL =====
function StudentDetailPanel({ student, regNo, isDiscarded, toggleDiscard, isVerified, setVerified }: {
    student: StudentApplication;
    regNo: string;
    isDiscarded: (regNo: string, section: string, itemId: string) => boolean;
    toggleDiscard: (regNo: string, section: string, itemId: string) => void;
    isVerified: boolean;
    setVerified: (v: boolean) => void;
}) {
    const pd = student.personalDetails;
    const ac = student.academicRecord;
    const pc = student.postCollegeStatus;

    const sectionStyle = { marginBottom: '24px' };
    const headingStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' };
    const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '8px' };
    const labelStyle: React.CSSProperties = { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' as const, fontWeight: 600 };
    const valueStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--text-primary)' };

    return (
        <div style={{ padding: '24px 32px', background: 'rgba(3,77,161,0.02)', borderTop: '1px solid var(--border-subtle)' }}>

            {/* Faculty Verification block */}
            <div style={{
                marginBottom: '20px', padding: '16px', borderRadius: '8px',
                background: isVerified ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
                border: `1px solid ${isVerified ? '#10B981' : 'var(--border-subtle)'}`,
                display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => setVerified(!isVerified)}
                        style={{
                            padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '13px',
                            background: isVerified ? '#10B981' : 'transparent',
                            color: isVerified ? 'white' : 'var(--text-primary)',
                            border: `1px solid ${isVerified ? '#10B981' : 'var(--border-subtle)'}`,
                            cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        {isVerified ? '✅ Verified' : 'Mark as Verified'}
                    </button>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isVerified ? 'Faculty has verified this application.' : 'Faculty verification pending.'}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <Link
                    href={`/${regNo}`}
                    target="_blank"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '10px 20px', borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-primary)', color: 'white',
                        textDecoration: 'none', fontWeight: 600, fontSize: '14px',
                        boxShadow: '0 4px 12px rgba(3, 77, 161, 0.2)'
                    }}
                >
                    Open Full Public Profile <ExternalLink size={16} />
                </Link>
            </div>
            {/* Personal Details */}
            <div style={sectionStyle}>
                <h4 style={headingStyle}>👤 Personal Details</h4>
                <div style={gridStyle}>
                    <DetailField label="Name" value={pd.name} />
                    <DetailField label="Register No" value={pd.registerNumber} />
                    <DetailField label="Section" value={pd.section} />
                    <DetailField label="Faculty Advisor" value={pd.facultyAdvisor} />
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
                    {pc.status === 'placed' && <DetailField label="Company" value={pc.placedCompany || '—'} />}
                    {pc.status === 'higher_studies' && <DetailField label="University" value={pc.universityName || '—'} />}
                    {pc.status === 'entrepreneur' && <DetailField label="Startup" value={pc.placedCompany || '—'} />}
                    {pc.status === 'placed' && pc.offerLetterLink && <DetailField label="Offer Letter" value={pc.offerLetterLink} isLink />}
                    {pc.status === 'higher_studies' && pc.admitCardLink && <DetailField label="Admit Card" value={pc.admitCardLink} isLink />}
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

            {/* Professional Memberships */}
            {student.professionalMemberships && student.professionalMemberships.length > 0 && (
                <div style={sectionStyle}>
                    <h4 style={headingStyle}>🪪 Professional Memberships ({student.professionalMemberships.length})</h4>
                    {student.professionalMemberships.map((item, i) => {
                        const itemId = item.id || `prof-${i}`;
                        const discarded = isDiscarded(regNo, 'profMembership', itemId);
                        return (
                            <DetailItem key={i} discarded={discarded} onToggle={() => toggleDiscard(regNo, 'profMembership', itemId)}>
                                <div style={gridStyle}>
                                    <DetailField label="Organization" value={item.organization} />
                                    {item.membershipId && <DetailField label="Membership ID" value={item.membershipId} />}
                                    {item.role && <DetailField label="Role" value={item.role} />}
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
