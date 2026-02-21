'use client';

import { StudentApplication } from '@/lib/types';
import { calculateScore } from '@/lib/ranking';
import { getEmbedUrl, getLevelBadgeColor, getIndexBadgeColor, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import {
    Briefcase, Code, BookOpen, Trophy, Heart, Star, Award,
    GraduationCap, ExternalLink, Github, Linkedin, Instagram,
    Twitter, Globe, FolderOpen, Medal, Rocket, ShieldCheck,
    Users, Building, BookMarked, Shield,
} from 'lucide-react';
import Link from 'next/link';

interface Props {
    student: StudentApplication;
}

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    }),
};

export default function PortfolioClient({ student }: Props) {
    const { totalScore, breakdown } = calculateScore(student);
    const pd = student.personalDetails;
    const ac = student.academicRecord;

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '64px' }}>
                {/* Hero */}
                <section style={{
                    background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                    padding: '60px 24px 80px 24px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(3,77,161,0.05) 0%, transparent 60%)',
                        top: '-200px', right: '-100px', pointerEvents: 'none',
                    }} />
                    <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            {/* Badge */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(228,179,22,0.1)', border: '1px solid rgba(228,179,22,0.3)',
                                borderRadius: '24px', padding: '6px 16px', marginBottom: '20px',
                                fontSize: '12px', fontWeight: 600, color: '#B8860B',
                            }}>
                                <Award size={14} />
                                Best Outgoing Student Candidate
                            </div>

                            {/* Name & Dept */}
                            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '8px' }}>
                                {pd.name}
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

                            {/* Social Links */}
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                                {student.socialMedia.linkedin && <SocialLink href={student.socialMedia.linkedin} icon={<Linkedin size={16} />} label="LinkedIn" />}
                                {student.socialMedia.github && <SocialLink href={student.socialMedia.github} icon={<Github size={16} />} label="GitHub" />}
                                {student.socialMedia.twitter && <SocialLink href={student.socialMedia.twitter} icon={<Twitter size={16} />} label="X" />}
                                {student.socialMedia.instagram && <SocialLink href={student.socialMedia.instagram} icon={<Instagram size={16} />} label="Instagram" />}
                                {student.socialMedia.website && <SocialLink href={student.socialMedia.website} icon={<Globe size={16} />} label="Website" />}
                                {student.masterProofFolderUrl && <SocialLink href={student.masterProofFolderUrl} icon={<FolderOpen size={16} />} label="All Proofs" />}
                            </div>

                            {/* Score & Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', maxWidth: '600px' }}>
                                <StatMini label="Score" value={`${totalScore.toFixed(1)}/100`} />
                                <StatMini label="CGPA" value={ac.cgpa.toString()} />
                                <StatMini label="Projects" value={((student.projects?.length) || 0).toString()} />
                                <StatMini label="Internships" value={((student.internships?.length) || 0).toString()} />
                                <StatMini label="Papers" value={((student.research?.length) || 0).toString()} />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Content */}
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px 24px' }}>
                    {/* Score Breakdown */}
                    <PortfolioSection title="Score Breakdown" icon={<Star size={18} />} index={0}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            {Object.entries(breakdown).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).map(([key, value]) => (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                                {key.replace(/([A-Z])/g, ' $1')}
                                            </span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)' }}>{value.toFixed(1)}</span>
                                        </div>
                                        <div className="score-bar"><div className="score-bar-fill" style={{ width: `${(value / 20) * 100}%` }} /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </PortfolioSection>

                    {/* Internships */}
                    {(student.internships?.length || 0) > 0 && (
                        <PortfolioSection title="Internships" icon={<Briefcase size={18} />} index={1}>
                            {(student.internships || []).map((item, i) => (
                                <ItemCard key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '16px', fontWeight: 600 }}>{item.role}</h4>
                                            <p style={{ fontSize: '14px', color: 'var(--accent-primary)' }}>{item.company}</p>
                                        </div>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(item.startDate)} → {formatDate(item.endDate)}</span>
                                    </div>
                                    {item.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>{item.description}</p>}
                                    {item.certificateLink && <ProofLink href={item.certificateLink} label="Certificate" />}
                                </ItemCard>
                            ))}
                        </PortfolioSection>
                    )}

                    {/* Projects */}
                    {(student.projects?.length || 0) > 0 && (
                        <PortfolioSection title="Projects" icon={<Code size={18} />} index={2}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                {(student.projects || []).map((item, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '24px' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{item.title}</h4>
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>{item.description}</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                                            {item.techStack.split(',').map((tech, j) => (
                                                <span key={j} className="badge" style={{ background: 'rgba(3,77,161,0.06)', color: 'var(--accent-primary)', borderColor: 'rgba(3,77,161,0.15)' }}>
                                                    {tech.trim()}
                                                </span>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                            {item.githubLink && <ProofLink href={item.githubLink} label="GitHub" />}
                                            {item.deployedLink && <ProofLink href={item.deployedLink} label="Live Demo" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PortfolioSection>
                    )}

                    {/* Hackathons */}
                    {(student.hackathons?.length || 0) > 0 && (
                        <PortfolioSection title="Hackathons" icon={<Rocket size={18} />} index={3}>
                            {(student.hackathons || []).map((item, i) => (
                                <ItemCard key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '16px', fontWeight: 600 }}>{item.name}</h4>
                                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.projectBuilt} • Team of {item.teamSize}</p>
                                        </div>
                                        <span className="badge" style={{ background: 'rgba(22,163,74,0.08)', color: '#16A34A', borderColor: 'rgba(22,163,74,0.2)' }}>{item.position}</span>
                                    </div>
                                    {item.proofLink && <ProofLink href={item.proofLink} label="Proof" />}
                                </ItemCard>
                            ))}
                        </PortfolioSection>
                    )}

                    {/* Research */}
                    {(student.research?.length || 0) > 0 && (
                        <PortfolioSection title="Research & Publications" icon={<BookOpen size={18} />} index={4}>
                            {(student.research || []).map((item, i) => (
                                <ItemCard key={i}>
                                    <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>{item.title}</h4>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{item.journalOrConference}</p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <span className={`badge ${getIndexBadgeColor(item.indexStatus)}`}>{item.indexStatus.toUpperCase()}</span>
                                        <span className="badge" style={{ background: 'rgba(79,124,255,0.1)', color: 'var(--accent-primary)', borderColor: 'rgba(79,124,255,0.2)' }}>
                                            {item.publicationStatus.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    {item.link && <ProofLink href={item.link} label="View Paper" />}
                                </ItemCard>
                            ))}
                        </PortfolioSection>
                    )}

                    {/* Certifications */}
                    {(student.certifications?.length || 0) > 0 && (
                        <PortfolioSection title="Global Certifications" icon={<ShieldCheck size={18} />} index={5}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                                {(student.certifications || []).map((item, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '20px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{item.certificateName}</h4>
                                        <p style={{ fontSize: '13px', color: 'var(--accent-primary)', marginBottom: '8px' }}>{item.provider}</p>
                                        {item.validationId && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {item.validationId}</p>}
                                        {item.proofLink && <ProofLink href={item.proofLink} label="Verify" />}
                                    </div>
                                ))}
                            </div>
                        </PortfolioSection>
                    )}

                    {/* Sports */}
                    {(student.sportsOrCultural?.length || 0) > 0 && (
                        <PortfolioSection title="Sports & Cultural" icon={<Trophy size={18} />} index={6}>
                            {(student.sportsOrCultural || []).map((item, i) => (
                                <ItemCard key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{item.eventName}</h4>
                                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.positionWon}</p>
                                        </div>
                                        <span className={`badge ${getLevelBadgeColor(item.level)}`}>{item.level.toUpperCase()}</span>
                                    </div>
                                    {item.proofLink && <ProofLink href={item.proofLink} label="Proof" />}
                                </ItemCard>
                            ))}
                        </PortfolioSection>
                    )}

                    {/* Volunteering */}
                    {(student.volunteering?.length || 0) > 0 && (
                        <PortfolioSection title="Volunteering & Social Service" icon={<Heart size={18} />} index={7}>
                            {(student.volunteering || []).map((item, i) => (
                                <ItemCard key={i}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{item.organization}</h4>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.role} {item.hoursServed ? `• ${item.hoursServed}h` : ''}</p>
                                    {item.impact && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>{item.impact}</p>}
                                    {item.proofLink && <ProofLink href={item.proofLink} label="Proof" />}
                                </ItemCard>
                            ))}
                        </PortfolioSection>
                    )}

                    {/* Clubs */}
                    {(student.clubActivities?.length || 0) > 0 && (
                        <PortfolioSection title="Clubs & Leadership" icon={<Users size={18} />} index={8}>
                            {(student.clubActivities || []).map((item, i) => (
                                <ItemCard key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{item.clubName}</h4>
                                            <p style={{ fontSize: '14px', color: 'var(--accent-primary)' }}>{item.position}</p>
                                        </div>
                                    </div>
                                    {item.keyEventsOrganized && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>Events: {item.keyEventsOrganized}</p>}
                                    {item.impactDescription && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.impactDescription}</p>}
                                    {item.proofLink && <ProofLink href={item.proofLink} label="Proof" />}
                                </ItemCard>
                            ))}
                        </PortfolioSection>
                    )}

                    {/* Dept Contributions */}
                    {(student.departmentContributions?.length || 0) > 0 && (
                        <PortfolioSection title="Department Contributions" icon={<Building size={18} />} index={9}>
                            {(student.departmentContributions || []).map((item, i) => (
                                <ItemCard key={i}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{item.eventName}</h4>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.role}</p>
                                    {item.contributionDescription && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>{item.contributionDescription}</p>}
                                    {item.proofLink && <ProofLink href={item.proofLink} label="Proof" />}
                                </ItemCard>
                            ))}
                        </PortfolioSection>
                    )}

                    {/* Scholarships */}
                    {student.scholarships.length > 0 && (
                        <PortfolioSection title="Scholarships & Grants" icon={<Medal size={18} />} index={10}>
                            {student.scholarships.map((item, i) => (
                                <ItemCard key={i}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{item.name}</h4>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.awardingBody} {item.amountOrPrestige ? `• ${item.amountOrPrestige}` : ''}</p>
                                    {item.proofLink && <ProofLink href={item.proofLink} label="Proof" />}
                                </ItemCard>
                            ))}
                        </PortfolioSection>
                    )}

                    {/* Entrepreneurship */}
                    {student.entrepreneurship.length > 0 && (
                        <PortfolioSection title="Entrepreneurship" icon={<Rocket size={18} />} index={11}>
                            {student.entrepreneurship.map((item, i) => (
                                <ItemCard key={i}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{item.startupName}</h4>
                                    {item.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>{item.description}</p>}
                                    {item.revenueOrFundingStatus && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status: {item.revenueOrFundingStatus}</p>}
                                    {item.proofLink && <ProofLink href={item.proofLink} label="Proof" />}
                                </ItemCard>
                            ))}
                        </PortfolioSection>
                    )}

                    {/* Competitive Exams */}
                    {student.competitiveExams.length > 0 && (
                        <PortfolioSection title="Competitive Exams" icon={<BookMarked size={18} />} index={12}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                {student.competitiveExams.map((item, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{item.examName}</h4>
                                        <p className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{item.scoreOrRank}</p>
                                        {item.proofLink && <ProofLink href={item.proofLink} label="Proof" />}
                                    </div>
                                ))}
                            </div>
                        </PortfolioSection>
                    )}

                    {/* Future Goal */}
                    <PortfolioSection title="Future Goal" icon={<Star size={18} />} index={13}>
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, fontStyle: 'italic' }}>
                                &ldquo;{student.futureGoal.description}&rdquo;
                            </p>
                        </div>
                    </PortfolioSection>

                    {/* Video Pitch */}
                    {student.videoPitchUrl && (
                        <PortfolioSection title="Video Pitch" icon={<Award size={18} />} index={14}>
                            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '16/9', background: 'var(--bg-card)' }}>
                                <iframe
                                    src={getEmbedUrl(student.videoPitchUrl)}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </PortfolioSection>
                    )}

                    {/* Professional Memberships */}
                    {student.professionalMemberships && student.professionalMemberships.length > 0 && (
                        <PortfolioSection title="Professional Memberships" icon={<Shield size={18} />} index={15}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                                {student.professionalMemberships.map((item, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '20px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{item.organization}</h4>
                                        {item.role && <p style={{ fontSize: '13px', color: 'var(--accent-primary)', marginBottom: '8px' }}>{item.role}</p>}
                                        {item.membershipId && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {item.membershipId}</p>}
                                        {item.proofLink && <ProofLink href={item.proofLink} label="View Certificate" />}
                                    </div>
                                ))}
                            </div>
                        </PortfolioSection>
                    )}

                    {/* References */}
                    {student.references.length > 0 && (
                        <PortfolioSection title="References" icon={<GraduationCap size={18} />} index={16}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                                {student.references.map((ref, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '20px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{ref.facultyName}</h4>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{ref.contact}</p>
                                        {ref.lorLink && <ProofLink href={ref.lorLink} label="View LoR" />}
                                    </div>
                                ))}
                            </div>
                        </PortfolioSection>
                    )}
                </div>

                {/* Footer */}
                <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Best Outgoing Student Portal • <Link href="/" style={{ color: 'var(--accent-primary)' }}>SRM IST KTR</Link>
                    </p>
                </footer>
            </main>
        </>
    );
}

// ===== Helpers =====
function StatMini({ label, value }: { label: string; value: string }) {
    return (
        <div className="stat-card">
            <div className="stat-number" style={{ fontSize: '1.5rem' }}>{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
            borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none',
            transition: 'all 0.2s ease',
        }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
            {icon} {label}
        </a>
    );
}

function PortfolioSection({ title, icon, children, index }: { title: string; icon: React.ReactNode; children: React.ReactNode; index: number }) {
    return (
        <motion.section
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            style={{ marginBottom: '48px' }}
        >
            <h2 className="section-title" style={{ marginBottom: '20px' }}>
                <span className="icon">{icon}</span>
                {title}
            </h2>
            {children}
        </motion.section>
    );
}

function ItemCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
            {children}
        </div>
    );
}

function ProofLink({ href, label }: { href: string; label: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px',
            fontSize: '13px', color: 'var(--accent-primary)', textDecoration: 'none',
        }}>
            <ExternalLink size={12} /> {label}
        </a>
    );
}
