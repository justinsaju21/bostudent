'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AWARD_CATEGORIES, AwardSlug } from '@/lib/awards';
import { BasePersonalDetails } from '@/lib/awardTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Loader2, ChevronDown, ChevronUp, ExternalLink, Users, Award as AwardIcon } from 'lucide-react';

interface AwardApplicant {
    personalDetails: BasePersonalDetails;
    submittedAt?: string;
    [key: string]: unknown;
}

interface Props {
    slug: AwardSlug;
}

export default function AwardAdminPanel({ slug }: Props) {
    const [applicants, setApplicants] = useState<AwardApplicant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');
    const [advisorFilter, setAdvisorFilter] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const award = AWARD_CATEGORIES.find(a => a.slug === slug);

    useEffect(() => {
        setIsLoading(true);
        setError('');
        setApplicants([]);
        setDeptFilter('');
        setSectionFilter('');
        setAdvisorFilter('');
        setExpandedRow(null);

        fetch(`/api/admin/awards?slug=${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setApplicants(data.applications || []);
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [slug]);

    const departments = useMemo(() => {
        const d = new Set(applicants.map(a => a.personalDetails?.department).filter(Boolean));
        return Array.from(d).sort();
    }, [applicants]);

    const sections = useMemo(() => {
        const s = new Set(applicants.map(a => a.personalDetails?.section).filter(Boolean));
        return Array.from(s).sort();
    }, [applicants]);

    const advisors = useMemo(() => {
        const ad = new Set(applicants.map(a => a.personalDetails?.facultyAdvisor).filter(Boolean));
        return Array.from(ad).sort();
    }, [applicants]);

    const deptStats = useMemo(() => {
        const stats: Record<string, number> = {};
        applicants.forEach(a => {
            const dept = a.personalDetails?.department || 'Unknown';
            stats[dept] = (stats[dept] || 0) + 1;
        });
        return Object.entries(stats).sort((a, b) => b[1] - a[1]);
    }, [applicants]);

    const filtered = useMemo(() => {
        let list = applicants;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(a => {
                const pd = a.personalDetails;
                return pd?.name?.toLowerCase().includes(q) ||
                    pd?.registerNumber?.toLowerCase().includes(q) ||
                    pd?.department?.toLowerCase().includes(q) ||
                    pd?.specialization?.toLowerCase().includes(q) ||
                    pd?.section?.toLowerCase().includes(q);
            });
        }

        if (deptFilter) {
            list = list.filter(a => a.personalDetails?.department === deptFilter);
        }
        if (sectionFilter) {
            list = list.filter(a => a.personalDetails?.section === sectionFilter);
        }
        if (advisorFilter) {
            list = list.filter(a => a.personalDetails?.facultyAdvisor === advisorFilter);
        }

        // Auto-sort salary awards by CTC descending, academic excellence by CGPA descending
        if (slug === 'highest-salary' || slug === 'core-salary') {
            list = [...list].sort((a, b) => (Number(b.ctcLpa) || 0) - (Number(a.ctcLpa) || 0));
        }
        if (slug === 'academic-excellence') {
            list = [...list].sort((a, b) => (Number(b.cgpa) || 0) - (Number(a.cgpa) || 0));
        }
        return list;
    }, [applicants, search, deptFilter, sectionFilter, advisorFilter, slug]);

    const downloadCSV = () => {
        if (!award || applicants.length === 0) return;

        const escapeCSV = (val: unknown): string => {
            const str = String(val ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        let headers: string[];
        let rows: string[][];

        switch (slug) {
            case 'highest-salary':
            case 'core-salary':
                headers = ['#', 'Name', 'Register No', 'Department', 'Company', 'Job Role', 'CTC (LPA)', 'Submitted At'];
                rows = applicants
                    .sort((a, b) => (Number(b.ctcLpa) || 0) - (Number(a.ctcLpa) || 0))
                    .map((a, i) => [
                        String(i + 1), a.personalDetails?.name || '', a.personalDetails?.registerNumber || '',
                        a.personalDetails?.department || '', String(a.companyName || ''), String(a.jobRole || ''),
                        String(a.ctcLpa || ''), String(a.submittedAt || ''),
                    ]);
                break;
            default:
                headers = ['#', 'Name', 'Register No', 'Department', 'Email', 'Mobile', 'Submitted At'];
                rows = applicants.map((a, i) => [
                    String(i + 1), a.personalDetails?.name || '', a.personalDetails?.registerNumber || '',
                    a.personalDetails?.department || '', a.personalDetails?.personalEmail || '',
                    a.personalDetails?.mobileNumber || '', String(a.submittedAt || ''),
                ]);
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.map(h => escapeCSV(h)).join(','), ...rows.map(r => r.map(v => escapeCSV(v)).join(','))].join('\n');

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `${slug}_applicants.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
                <Loader2 size={32} color="var(--accent-primary)" className="animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: '20px', borderRadius: 'var(--radius-md)',
                background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.25)',
                color: '#B45309', fontSize: '14px', marginBottom: '24px',
            }}>
                ⚠️ {error}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} /> Total Applicants
                    </h3>
                    <div style={{ fontSize: '3rem', fontWeight: 700, color: award?.color || 'var(--srm-blue)' }}>
                        {applicants.length}
                    </div>
                </div>

                {(slug === 'highest-salary' || slug === 'core-salary') && applicants.length > 0 ? (
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AwardIcon size={20} /> Highest CTC
                        </h3>
                        <div style={{ fontSize: '3rem', fontWeight: 700, color: '#10B981' }}>
                            ₹{Math.max(...applicants.map(a => Number(a.ctcLpa) || 0)).toFixed(2)} <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>LPA</span>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>Department Breakdown</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {deptStats.slice(0, 5).map(([dept, count]) => (
                                <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>{dept}</span>
                                    <span style={{ fontWeight: 600 }}>{count}</span>
                                </div>
                            ))}
                            {deptStats.length === 0 && <span style={{ color: 'var(--text-muted)' }}>No data available</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* Results Count Label */}
            <div style={{
                marginBottom: '12px',
                fontSize: '13px',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>
                    Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'applicant' : 'applicants'}
                    {deptFilter || search || sectionFilter || advisorFilter ? ' (filtered)' : ' total'}
                </span>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="form-input"
                        style={{ paddingLeft: '40px' }}
                        placeholder="Search by name, register no, or specialization..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="form-input"
                    style={{ width: 'auto', minWidth: '180px' }}
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
                        <option key={sec} value={sec}>Sec {sec}</option>
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

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                }}
            >
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table className="data-table" style={{ minWidth: '800px' }}>
                        <thead>
                            <tr style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                <th style={{ width: '50px' }}>#</th>
                                <th>Name</th>
                                <th>Department</th>
                                {(slug === 'highest-salary' || slug === 'core-salary') && <th>Company</th>}
                                {(slug === 'highest-salary' || slug === 'core-salary') && <th>CTC (LPA)</th>}
                                <th>Submitted</th>
                                <th style={{ width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={(slug === 'highest-salary' || slug === 'core-salary') ? 7 : 5} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                        {applicants.length === 0 ? 'No applications yet for this award.' : 'No results found.'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((applicant, index) => {
                                    const pd = applicant.personalDetails;
                                    const regNo = pd?.registerNumber || '';
                                    const isExpanded = expandedRow === regNo;

                                    return (
                                        <React.Fragment key={regNo || index}>
                                            <tr
                                                style={{
                                                    borderBottom: '1px solid var(--border-subtle)',
                                                    background: isExpanded ? 'var(--bg-surface)' : 'transparent',
                                                    cursor: 'pointer', transition: 'background 0.2s',
                                                }}
                                                onClick={() => setExpandedRow(isExpanded ? null : regNo)}
                                            >
                                                <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                                    {index + 1}
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{pd?.name || '—'}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{regNo}</div>
                                                </td>
                                                <td style={{ fontSize: '13px' }}>{pd?.department || '—'}</td>
                                                {(slug === 'highest-salary' || slug === 'core-salary') && (
                                                    <td style={{ fontSize: '13px' }}>{String(applicant.companyName || '—')}</td>
                                                )}
                                                {(slug === 'highest-salary' || slug === 'core-salary') && (
                                                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10B981' }}>
                                                        ₹{Number(applicant.ctcLpa || 0).toFixed(2)}
                                                    </td>
                                                )}
                                                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    {applicant.submittedAt ? new Date(applicant.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                </td>
                                                <td>
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={(slug === 'highest-salary' || slug === 'core-salary') ? 7 : 5} style={{ padding: 0 }}>
                                                        <AwardDetailPanel applicant={applicant} slug={slug} />
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
        </motion.div>
    );
}

// ===== DETAIL PANEL for expanded rows =====
function AwardDetailPanel({ applicant, slug }: { applicant: AwardApplicant; slug: AwardSlug }) {
    const pd = applicant.personalDetails;
    const labelStyle: React.CSSProperties = { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 };
    const valueStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--text-primary)' };

    return (
        <div style={{ padding: '24px 32px', background: 'rgba(3,77,161,0.02)', borderTop: '1px solid var(--border-subtle)' }}>
            {/* Personal */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                    👤 Personal Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '8px' }}>
                    <div><div style={labelStyle}>Name</div><div style={valueStyle}>{pd?.name}</div></div>
                    <div><div style={labelStyle}>Register No</div><div style={valueStyle}>{pd?.registerNumber}</div></div>
                    <div><div style={labelStyle}>Programme</div><div style={valueStyle}>{pd?.department}</div></div>
                    <div><div style={labelStyle}>Email</div><div style={valueStyle}>{pd?.personalEmail}</div></div>
                    <div><div style={labelStyle}>SRM Email</div><div style={valueStyle}>{pd?.srmEmail}</div></div>
                    <div><div style={labelStyle}>Mobile</div><div style={valueStyle}>{pd?.mobileNumber}</div></div>
                    <div><div style={labelStyle}>Section</div><div style={valueStyle}>{pd?.section}</div></div>
                    <div><div style={labelStyle}>Faculty Advisor</div><div style={valueStyle}>{pd?.facultyAdvisor}</div></div>
                </div>
            </div>

            {/* Award-specific details */}
            <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                    📋 Award Details
                </h4>
                {slug === 'academic-excellence' && <AcademicExcellenceDetails applicant={applicant} />}
                {slug === 'researcher' && <ResearcherDetails applicant={applicant} />}
                {slug === 'hackathon' && <ListDetails items={applicant.wins as any[]} label="Win" fields={['eventName', 'level', 'position', 'teamSize', 'projectBuilt', 'proofLink']} />}
                {slug === 'sports' && <ListDetails items={applicant.wins as any[]} label="Win" fields={['sportOrEvent', 'level', 'position', 'proofLink']} />}
                {slug === 'nss-ncc' && <NssNccDetails applicant={applicant} />}
                {slug === 'dept-contribution' && <ListDetails items={applicant.contributions as any[]} label="Contribution" fields={['activityType', 'role', 'eventName', 'contributionDescription', 'proofLink']} />}
                {(slug === 'highest-salary' || slug === 'core-salary') && <SalaryDetails applicant={applicant} slug={slug} />}
            </div>

            {/* Proof folder */}
            {Boolean(applicant.masterProofFolderUrl) && (
                <div style={{ marginTop: '16px' }}>
                    <a href={String(applicant.masterProofFolderUrl)} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(3,77,161,0.05)', color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                        Open Proof Folder <ExternalLink size={14} />
                    </a>
                </div>
            )}
        </div>
    );
}

function ResearcherDetails({ applicant }: { applicant: AwardApplicant }) {
    const papers = (applicant.papers as any[]) || [];
    const patents = (applicant.patents as any[]) || [];
    const labelStyle: React.CSSProperties = { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 };
    const valueStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--text-primary)' };

    return (
        <>
            {papers.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                    <strong style={{ fontSize: '13px' }}>Papers ({papers.length})</strong>
                    {papers.map((p: any, i: number) => (
                        <div key={i} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginTop: '6px' }}>
                            <div style={valueStyle}><strong>{p.title}</strong></div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.journalOrConference} • {p.indexStatus?.toUpperCase()} • {p.publicationStatus}</div>
                            {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent-primary)' }}>View Proof</a>}
                        </div>
                    ))}
                </div>
            )}
            {patents.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                    <strong style={{ fontSize: '13px' }}>Patents ({patents.length})</strong>
                    {patents.map((p: any, i: number) => (
                        <div key={i} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginTop: '6px' }}>
                            <div style={valueStyle}><strong>{p.title}</strong> ({p.status})</div>
                            {p.patentNumber && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Patent #: {p.patentNumber}</div>}
                        </div>
                    ))}
                </div>
            )}
            {applicant.researchStatement && (
                <div style={{ marginTop: '8px' }}>
                    <div style={labelStyle}>Research Statement</div>
                    <div style={{ ...valueStyle, marginTop: '4px', lineHeight: 1.6 }}>{String(applicant.researchStatement)}</div>
                </div>
            )}
        </>
    );
}

function ListDetails({ items, label, fields }: { items: any[]; label: string; fields: string[] }) {
    if (!items || items.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No entries.</p>;
    const labelStyle: React.CSSProperties = { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 };
    const valueStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--text-primary)' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item: any, i: number) => (
                <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <strong style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>{label} {i + 1}</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))', gap: '6px' }}>
                        {fields.map(field => (
                            <div key={field}>
                                <div style={labelStyle}>{field.replace(/([A-Z])/g, ' $1').trim()}</div>
                                <div style={valueStyle}>
                                    {field === 'proofLink' && item[field] ? (
                                        <a href={item[field]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>View</a>
                                    ) : (
                                        String(item[field] ?? '—')
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function NssNccDetails({ applicant }: { applicant: AwardApplicant }) {
    const labelStyle: React.CSSProperties = { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 };
    const valueStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--text-primary)' };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '8px' }}>
            <div>
                <div style={labelStyle}>Organization</div>
                <div style={valueStyle}>
                    {String(applicant.organization || '—')}
                    {applicant.organization === 'other' && Boolean(applicant.otherOrganization) && <span> ({String(applicant.otherOrganization)})</span>}
                </div>
            </div>
            <div><div style={labelStyle}>Role</div><div style={valueStyle}>{String(applicant.role || '—')}</div></div>
            <div><div style={labelStyle}>Total Hours</div><div style={valueStyle}>{String(applicant.totalHoursServed || '0')}</div></div>
            <div style={{ gridColumn: '1 / -1' }}><div style={labelStyle}>Events Organized</div><div style={{ ...valueStyle, lineHeight: 1.6 }}>{String(applicant.eventsOrganized || '—')}</div></div>
            <div style={{ gridColumn: '1 / -1' }}><div style={labelStyle}>Impact Description</div><div style={{ ...valueStyle, lineHeight: 1.6 }}>{String(applicant.impactDescription || '—')}</div></div>
            {Boolean(applicant.proofLink) && (
                <div><div style={labelStyle}>Proof</div><a href={String(applicant.proofLink)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '13px' }}>View Proof</a></div>
            )}
        </div>
    );
}

function SalaryDetails({ applicant, slug }: { applicant: AwardApplicant; slug: AwardSlug }) {
    const labelStyle: React.CSSProperties = { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 };
    const valueStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--text-primary)' };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '8px' }}>
            <div><div style={labelStyle}>Company</div><div style={valueStyle}>{String(applicant.companyName || '—')}</div></div>
            <div><div style={labelStyle}>Job Role</div><div style={valueStyle}>{String(applicant.jobRole || '—')}</div></div>
            <div><div style={labelStyle}>CTC (LPA)</div><div style={{ ...valueStyle, fontWeight: 700, color: '#10B981' }}>₹{Number(applicant.ctcLpa || 0).toFixed(2)}</div></div>
            {slug === 'core-salary' && <div><div style={labelStyle}>Core Domain</div><div style={valueStyle}>{String(applicant.coreDomain || '—')}</div></div>}
            {Boolean(applicant.offerLetterLink) && (
                <div><div style={labelStyle}>Offer Letter</div><a href={String(applicant.offerLetterLink)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '13px' }}>View</a></div>
            )}
            {slug === 'core-salary' && Boolean(applicant.coreDomainProofLink) && (
                <div><div style={labelStyle}>Core Proof</div><a href={String(applicant.coreDomainProofLink)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '13px' }}>View</a></div>
            )}
        </div>
    );
}

function AcademicExcellenceDetails({ applicant }: { applicant: AwardApplicant }) {
    const labelStyle: React.CSSProperties = { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 };
    const valueStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--text-primary)' };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '8px' }}>
            <div><div style={labelStyle}>CGPA</div><div style={{ ...valueStyle, fontWeight: 700, color: '#D97706', fontSize: '1.2rem' }}>{Number(applicant.cgpa || 0).toFixed(2)}</div></div>
            {Boolean(applicant.gradeSheetLink) && (
                <div><div style={labelStyle}>Grade Sheet</div><a href={String(applicant.gradeSheetLink)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '13px' }}>View Grade Sheet</a></div>
            )}
        </div>
    );
}
