'use client';

import { RankedStudent } from '@/lib/types';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Award, ExternalLink, Search, Trophy, Users, LogOut, Download } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
    students: RankedStudent[];
    error?: string;
}

export default function AdminClient({ students, error }: Props) {
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
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

    const downloadCSV = () => {
        const headers = ['Register Number', 'Name', 'Department', 'Total Score', 'CGPA', 'Research', 'Internships', 'Projects', 'Hackathons'];
        const rows = students.map(s => [
            s.registerNumber,
            s.name,
            s.department,
            s.totalScore.toFixed(2),
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
            <main style={{ paddingTop: '80px', padding: '80px 24px 60px 24px', maxWidth: '1100px', margin: '0 auto' }}>
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

                {/* Analytics Cards */}
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
                                    <th style={{ width: '60px' }}>Rank</th>
                                    <th>Name</th>
                                    <th>Register No.</th>
                                    <th>Department</th>
                                    <th style={{ width: '100px' }}>Score</th>
                                    <th style={{ width: '200px' }}>Score Bar</th>
                                    <th style={{ width: '100px' }}>Action</th>
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
                                    filtered.map((student, index) => {
                                        const originalRank = students.findIndex(
                                            (s) => s.registerNumber === student.registerNumber
                                        ) + 1;
                                        const maxScore = students.length > 0 ? students[0].totalScore : 100;

                                        return (
                                            <tr key={student.registerNumber}>
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
                                                    <span className="gradient-text" style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                                                        {student.totalScore.toFixed(1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="score-bar">
                                                        <div className="score-bar-fill" style={{ width: `${(student.totalScore / maxScore) * 100}%` }} />
                                                    </div>
                                                </td>
                                                <td>
                                                    <Link
                                                        href={`/${student.registerNumber}`}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                            fontSize: '13px', color: 'var(--accent-primary)', textDecoration: 'none',
                                                            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                                                            border: '1px solid rgba(3, 77, 161, 0.25)',
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(3, 77, 161, 0.06)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        View <ExternalLink size={12} />
                                                    </Link>
                                                </td>
                                            </tr>
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
