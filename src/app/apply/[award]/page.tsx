'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { AwardSlug, getAwardBySlug } from '@/lib/awards';
import { getSchemaForAward, PROGRAMME_OPTIONS } from '@/lib/awardSchemas';
import { submitAwardApplication, AwardSubmitResult } from '@/app/awardActions';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Loader2,
    Send,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import Link from 'next/link';

// ===== Reusable Field Component =====
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: '16px' }}>
            <label className="form-label">{label}</label>
            {children}
            {error && <span className="form-error">{error}</span>}
        </div>
    );
}

// ===== Personal Details Step (shared across all awards) =====
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PersonalStep({ register, errors }: { register: any; errors: any }) {
    return (
        <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 32px)', borderRadius: 'var(--radius-md)' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 600, marginBottom: '24px' }}>
                Personal Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '0 24px' }}>
                <Field label="Full Name" error={errors?.personalDetails?.name?.message}>
                    <input className="form-input" {...register('personalDetails.name')} placeholder="Your full name" />
                </Field>
                <Field label="Register Number" error={errors?.personalDetails?.registerNumber?.message}>
                    <input className="form-input" {...register('personalDetails.registerNumber')} placeholder="RA2211053010097" />
                </Field>
                <Field label="Programme / Course" error={errors?.personalDetails?.department?.message}>
                    <select className="form-input" {...register('personalDetails.department')}>
                        <option value="">Select Programme</option>
                        {PROGRAMME_OPTIONS.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Personal Email" error={errors?.personalDetails?.personalEmail?.message}>
                    <input className="form-input" type="email" {...register('personalDetails.personalEmail')} placeholder="you@gmail.com" />
                </Field>
                <Field label="SRM Email" error={errors?.personalDetails?.srmEmail?.message}>
                    <input className="form-input" type="email" {...register('personalDetails.srmEmail')} placeholder="xx1234@srmist.edu.in" />
                </Field>
                <Field label="Mobile Number" error={errors?.personalDetails?.mobileNumber?.message}>
                    <input className="form-input" {...register('personalDetails.mobileNumber')} placeholder="9876543210" />
                </Field>
                <Field label="Section" error={errors?.personalDetails?.section?.message}>
                    <input className="form-input" {...register('personalDetails.section')} placeholder="A" />
                </Field>
                <Field label="Faculty Advisor" error={errors?.personalDetails?.facultyAdvisor?.message}>
                    <input className="form-input" {...register('personalDetails.facultyAdvisor')} placeholder="Dr. Name" />
                </Field>
                <Field label="Specialization" error={errors?.personalDetails?.specialization?.message}>
                    <input className="form-input" {...register('personalDetails.specialization')} placeholder="e.g., VLSI Design, Embedded Systems" />
                </Field>
                <Field label="Profile Photo URL (Optional)" error={errors?.personalDetails?.profilePhotoUrl?.message}>
                    <input className="form-input" {...register('personalDetails.profilePhotoUrl')} placeholder="https://drive.google.com/..." />
                </Field>
                <Field label="LinkedIn Profile URL (Optional)" error={errors?.personalDetails?.linkedInUrl?.message}>
                    <input className="form-input" {...register('personalDetails.linkedInUrl')} placeholder="https://linkedin.com/..." />
                </Field>
                <Field label="GitHub / Portfolio URL (Optional)" error={errors?.personalDetails?.githubUrl?.message}>
                    <input className="form-input" {...register('personalDetails.githubUrl')} placeholder="https://github.com/..." />
                </Field>
            </div>
        </div>
    );
}

// ===== Award-Specific Details Step =====
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AwardDetailsStep({ slug, register, errors, control }: { slug: AwardSlug; register: any; errors: any; control: any }) {
    const award = getAwardBySlug(slug)!;

    return (
        <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 32px)', borderRadius: 'var(--radius-md)' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 600, marginBottom: '24px' }}>
                {award.title} — Details
            </h2>
            {slug === 'academic-excellence' && <AcademicExcellenceFields register={register} errors={errors} />}
            {slug === 'researcher' && <ResearcherFields register={register} errors={errors} control={control} />}
            {slug === 'hackathon' && <HackathonFields register={register} errors={errors} control={control} />}
            {slug === 'sports' && <SportsFields register={register} errors={errors} control={control} />}
            {slug === 'nss-ncc' && <NssNccFields register={register} errors={errors} control={control} />}
            {slug === 'dept-contribution' && <DeptContributionFields register={register} errors={errors} control={control} />}
            {slug === 'highest-salary' && <SalaryFields register={register} errors={errors} />}
            {slug === 'core-salary' && <CoreSalaryFields register={register} errors={errors} />}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ResearcherFields({ register, errors, control }: { register: any; errors: any; control: any }) {
    const { fields: paperFields, append: addPaper, remove: removePaper } = useFieldArray({ control, name: 'papers' });
    const { fields: patentFields, append: addPatent, remove: removePatent } = useFieldArray({ control, name: 'patents' });

    return (
        <>
            {/* Papers */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Papers</h3>
                    <button type="button" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        onClick={() => addPaper({ id: crypto.randomUUID(), title: '', journalOrConference: '', indexStatus: 'none', publicationStatus: 'under_review', link: '' })}>
                        <Plus size={14} /> Add Paper
                    </button>
                </div>
                {paperFields.map((field, i) => (
                    <div key={field.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.9rem' }}>Paper {i + 1}</strong>
                            <button type="button" onClick={() => removePaper(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <input type="hidden" {...register(`papers.${i}.id`)} />
                        <Field label="Title" error={errors?.papers?.[i]?.title?.message}>
                            <input className="form-input" {...register(`papers.${i}.title`)} />
                        </Field>
                        <Field label="Journal / Conference" error={errors?.papers?.[i]?.journalOrConference?.message}>
                            <input className="form-input" {...register(`papers.${i}.journalOrConference`)} />
                        </Field>
                        <div className="form-grid-2">
                            <Field label="Index Status" error={errors?.papers?.[i]?.indexStatus?.message}>
                                <select className="form-input" {...register(`papers.${i}.indexStatus`)}>
                                    <option value="sci">SCI</option>
                                    <option value="scopus">Scopus</option>
                                    <option value="ugc">UGC Care</option>
                                    <option value="other">Other</option>
                                    <option value="none">None</option>
                                </select>
                            </Field>
                            <Field label="Publication Status" error={errors?.papers?.[i]?.publicationStatus?.message}>
                                <select className="form-input" {...register(`papers.${i}.publicationStatus`)}>
                                    <option value="published">Published</option>
                                    <option value="granted">Patent Granted</option>
                                    <option value="filed">Filed</option>
                                    <option value="under_review">Under Review</option>
                                </select>
                            </Field>
                        </div>
                        <Field label="Proof Link" error={errors?.papers?.[i]?.link?.message}>
                            <input className="form-input" {...register(`papers.${i}.link`)} placeholder="https://..." />
                        </Field>
                    </div>
                ))}
                {errors?.papers?.message && <span className="form-error">{errors.papers.message}</span>}
            </div>

            {/* Patents */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Patents (Optional)</h3>
                    <button type="button" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        onClick={() => addPatent({ id: crypto.randomUUID(), title: '', patentNumber: '', status: 'filed', proofLink: '' })}>
                        <Plus size={14} /> Add Patent
                    </button>
                </div>
                {patentFields.map((field, i) => (
                    <div key={field.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.9rem' }}>Patent {i + 1}</strong>
                            <button type="button" onClick={() => removePatent(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <input type="hidden" {...register(`patents.${i}.id`)} />
                        <Field label="Title" error={errors?.patents?.[i]?.title?.message}>
                            <input className="form-input" {...register(`patents.${i}.title`)} />
                        </Field>
                        <Field label="Patent Number" error={errors?.patents?.[i]?.patentNumber?.message}>
                            <input className="form-input" {...register(`patents.${i}.patentNumber`)} />
                        </Field>
                        <Field label="Status" error={errors?.patents?.[i]?.status?.message}>
                            <select className="form-input" {...register(`patents.${i}.status`)}>
                                <option value="filed">Filed</option>
                                <option value="published">Published</option>
                                <option value="granted">Granted</option>
                            </select>
                        </Field>
                        <Field label="Proof Link" error={errors?.patents?.[i]?.proofLink?.message}>
                            <input className="form-input" {...register(`patents.${i}.proofLink`)} placeholder="https://..." />
                        </Field>
                    </div>
                ))}
            </div>

            <Field label="Research Statement (min 20 chars)" error={errors?.researchStatement?.message}>
                <textarea className="form-input" rows={4} {...register('researchStatement')} placeholder="Describe your research focus and goals..." />
            </Field>
            <Field label="Master Proof Folder URL" error={errors?.masterProofFolderUrl?.message}>
                <input className="form-input" {...register('masterProofFolderUrl')} placeholder="https://drive.google.com/..." />
            </Field>
        </>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HackathonFields({ register, errors, control }: { register: any; errors: any; control: any }) {
    const { fields, append, remove } = useFieldArray({ control, name: 'wins' });
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Hackathon/Ideathon Wins</h3>
                <button type="button" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    onClick={() => append({ id: crypto.randomUUID(), eventName: '', level: 'state', position: '', teamSize: 1, projectBuilt: '', proofLink: '' })}>
                    <Plus size={14} /> Add Win
                </button>
            </div>
            {fields.map((field, i) => (
                <div key={field.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>Win {i + 1}</strong>
                        <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={16} /></button>
                    </div>
                    <input type="hidden" {...register(`wins.${i}.id`)} />
                    <Field label="Event Name" error={errors?.wins?.[i]?.eventName?.message}>
                        <input className="form-input" {...register(`wins.${i}.eventName`)} />
                    </Field>
                    <div className="form-grid-3">
                        <Field label="Level" error={errors?.wins?.[i]?.level?.message}>
                            <select className="form-input" {...register(`wins.${i}.level`)}>
                                <option value="college">College/Inter-College</option>
                                <option value="state">State</option>
                                <option value="national">National</option>
                                <option value="international">International</option>
                            </select>
                        </Field>
                        <Field label="Position" error={errors?.wins?.[i]?.position?.message}>
                            <input className="form-input" {...register(`wins.${i}.position`)} placeholder="1st / 2nd / 3rd" />
                        </Field>
                        <Field label="Team Size" error={errors?.wins?.[i]?.teamSize?.message}>
                            <input className="form-input" type="number" {...register(`wins.${i}.teamSize`, { valueAsNumber: true })} />
                        </Field>
                    </div>
                    <Field label="Project Built" error={errors?.wins?.[i]?.projectBuilt?.message}>
                        <input className="form-input" {...register(`wins.${i}.projectBuilt`)} />
                    </Field>
                    <Field label="Proof Link" error={errors?.wins?.[i]?.proofLink?.message}>
                        <input className="form-input" {...register(`wins.${i}.proofLink`)} placeholder="https://..." />
                    </Field>
                </div>
            ))}
            {errors?.wins?.message && <span className="form-error">{errors.wins.message}</span>}
            <Field label="Master Proof Folder URL" error={errors?.masterProofFolderUrl?.message}>
                <input className="form-input" {...register('masterProofFolderUrl')} placeholder="https://drive.google.com/..." />
            </Field>
        </>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SportsFields({ register, errors, control }: { register: any; errors: any; control: any }) {
    const { fields, append, remove } = useFieldArray({ control, name: 'wins' });
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Sports Wins</h3>
                <button type="button" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    onClick={() => append({ id: crypto.randomUUID(), sportOrEvent: '', level: 'state', position: '', proofLink: '' })}>
                    <Plus size={14} /> Add Win
                </button>
            </div>
            {fields.map((field, i) => (
                <div key={field.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>Win {i + 1}</strong>
                        <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={16} /></button>
                    </div>
                    <input type="hidden" {...register(`wins.${i}.id`)} />
                    <Field label="Sport / Event" error={errors?.wins?.[i]?.sportOrEvent?.message}>
                        <input className="form-input" {...register(`wins.${i}.sportOrEvent`)} />
                    </Field>
                    <div className="form-grid-2">
                        <Field label="Level" error={errors?.wins?.[i]?.level?.message}>
                            <select className="form-input" {...register(`wins.${i}.level`)}>
                                <option value="zone">Zonal Level</option>
                                <option value="district">District Level</option>
                                <option value="state">State</option>
                                <option value="national">National</option>
                                <option value="international">International</option>
                            </select>
                        </Field>
                        <Field label="Position" error={errors?.wins?.[i]?.position?.message}>
                            <input className="form-input" {...register(`wins.${i}.position`)} placeholder="Gold / Silver / Bronze" />
                        </Field>
                    </div>
                    <Field label="Proof Link" error={errors?.wins?.[i]?.proofLink?.message}>
                        <input className="form-input" {...register(`wins.${i}.proofLink`)} placeholder="https://..." />
                    </Field>
                </div>
            ))}
            {errors?.wins?.message && <span className="form-error">{errors.wins.message}</span>}
            <Field label="Master Proof Folder URL" error={errors?.masterProofFolderUrl?.message}>
                <input className="form-input" {...register('masterProofFolderUrl')} placeholder="https://drive.google.com/..." />
            </Field>
        </>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NssNccFields({ register, errors, control }: { register: any; errors: any; control: any }) {
    const org = useWatch({ control, name: 'organization' });
    return (
        <>
            <div className="form-grid-2">
                <Field label="Organization" error={errors?.organization?.message}>
                    <select className="form-input" {...register('organization')}>
                        <option value="">Select...</option>
                        <option value="NSS">NSS (National Service Scheme)</option>
                        <option value="NCC">NCC (National Cadet Corps)</option>
                        <option value="other">Other</option>
                    </select>
                </Field>
                {org === 'other' && (
                    <Field label="Specify Organization" error={errors?.otherOrganization?.message}>
                        <input className="form-input" {...register('otherOrganization')} placeholder="Enter organization name" />
                    </Field>
                )}
                <Field label="Role" error={errors?.role?.message}>
                    <input className="form-input" {...register('role')} placeholder="e.g., Volunteer, Leader" />
                </Field>
            </div>
            <div className="form-grid-2">
                <Field label="Highest Certificate / Camp" error={errors?.highestCertificate?.message}>
                    <select className="form-input" {...register('highestCertificate')}>
                        <option value="">Select Certificate</option>
                        <option value="None">None</option>
                        <option value="Camp">Special Camp Certificate</option>
                        <option value="A">'A' Certificate</option>
                        <option value="B">'B' Certificate</option>
                        <option value="C">'C' Certificate</option>
                    </select>
                </Field>
                <Field label="Total Hours Served" error={errors?.totalHoursServed?.message}>
                    <input className="form-input" type="number" {...register('totalHoursServed', { valueAsNumber: true })} />
                </Field>
            </div>
            <Field label="Events Organized" error={errors?.eventsOrganized?.message}>
                <textarea className="form-input" rows={2} {...register('eventsOrganized')} placeholder="List the events you organized..." />
            </Field>
            <Field label="Impact Description (min 20 chars)" error={errors?.impactDescription?.message}>
                <textarea className="form-input" rows={3} {...register('impactDescription')} placeholder="Describe the impact of your participation..." />
            </Field>
            <Field label="Proof Link" error={errors?.proofLink?.message}>
                <input className="form-input" {...register('proofLink')} placeholder="https://..." />
            </Field>
            <Field label="Master Proof Folder URL" error={errors?.masterProofFolderUrl?.message}>
                <input className="form-input" {...register('masterProofFolderUrl')} placeholder="https://drive.google.com/..." />
            </Field>
        </>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DeptContributionFields({ register, errors, control }: { register: any; errors: any; control: any }) {
    const { fields, append, remove } = useFieldArray({ control, name: 'contributions' });
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Contributions</h3>
                <button type="button" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    onClick={() => append({ id: crypto.randomUUID(), activityType: '', role: '', eventName: '', contributionDescription: '', proofLink: '' })}>
                    <Plus size={14} /> Add Contribution
                </button>
            </div>
            {fields.map((field, i) => (
                <div key={field.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>Contribution {i + 1}</strong>
                        <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={16} /></button>
                    </div>
                    <input type="hidden" {...register(`contributions.${i}.id`)} />
                    <Field label="Activity Type" error={errors?.contributions?.[i]?.activityType?.message}>
                        <select className="form-input" {...register(`contributions.${i}.activityType`)}>
                            <option value="">Select...</option>
                            <option value="Magazine">Magazine</option>
                            <option value="ECE Association">ECE Association</option>
                            <option value="Raueecci">Raueecci</option>
                            <option value="Other">Other</option>
                        </select>
                    </Field>
                    <div className="form-grid-2">
                        <Field label="Role" error={errors?.contributions?.[i]?.role?.message}>
                            <input className="form-input" {...register(`contributions.${i}.role`)} />
                        </Field>
                        <Field label="Event / Activity Name" error={errors?.contributions?.[i]?.eventName?.message}>
                            <input className="form-input" {...register(`contributions.${i}.eventName`)} />
                        </Field>
                    </div>
                    <Field label="Description" error={errors?.contributions?.[i]?.contributionDescription?.message}>
                        <textarea className="form-input" rows={2} {...register(`contributions.${i}.contributionDescription`)} />
                    </Field>
                    <Field label="Proof Link" error={errors?.contributions?.[i]?.proofLink?.message}>
                        <input className="form-input" {...register(`contributions.${i}.proofLink`)} placeholder="https://..." />
                    </Field>
                </div>
            ))}
            {errors?.contributions?.message && <span className="form-error">{errors.contributions.message}</span>}
            <Field label="Master Proof Folder URL" error={errors?.masterProofFolderUrl?.message}>
                <input className="form-input" {...register('masterProofFolderUrl')} placeholder="https://drive.google.com/..." />
            </Field>
        </>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SalaryFields({ register, errors }: { register: any; errors: any }) {
    return (
        <>
            <div className="form-grid-2">
                <Field label="Company Name" error={errors?.companyName?.message}>
                    <input className="form-input" {...register('companyName')} />
                </Field>
                <Field label="Job Role" error={errors?.jobRole?.message}>
                    <input className="form-input" {...register('jobRole')} />
                </Field>
            </div>
            <div className="form-grid-2">
                <Field label="Placement Type" error={errors?.placementType?.message}>
                    <select className="form-input" {...register('placementType')}>
                        <option value="">Select...</option>
                        <option value="on-campus">On-Campus</option>
                        <option value="off-campus">Off-Campus</option>
                    </select>
                </Field>
                <Field label="Offer Letter Link" error={errors?.offerLetterLink?.message}>
                    <input className="form-input" {...register('offerLetterLink')} placeholder="https://drive.google.com/..." />
                </Field>
            </div>
            <div className="form-grid-2">
                <Field label="Base / Fixed Pay (LPA)" error={errors?.basePayLpa?.message}>
                    <input className="form-input" type="number" step="0.01" {...register('basePayLpa', { valueAsNumber: true })} placeholder="e.g., 10.00" />
                </Field>
                <Field label="Total CTC (LPA)" error={errors?.ctcLpa?.message}>
                    <input className="form-input" type="number" step="0.01" {...register('ctcLpa', { valueAsNumber: true })} placeholder="e.g., 12.50" />
                </Field>
            </div>
        </>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CoreSalaryFields({ register, errors }: { register: any; errors: any }) {
    return (
        <>
            <div className="form-grid-2">
                <Field label="Company Name" error={errors?.companyName?.message}>
                    <input className="form-input" {...register('companyName')} />
                </Field>
                <Field label="Job Role" error={errors?.jobRole?.message}>
                    <input className="form-input" {...register('jobRole')} />
                </Field>
            </div>
            <div className="form-grid-2">
                <Field label="Placement Type" error={errors?.placementType?.message}>
                    <select className="form-input" {...register('placementType')}>
                        <option value="">Select...</option>
                        <option value="on-campus">On-Campus</option>
                        <option value="off-campus">Off-Campus</option>
                    </select>
                </Field>
                <Field label="Core Domain" error={errors?.coreDomain?.message}>
                    <input className="form-input" {...register('coreDomain')} placeholder="e.g., VLSI, Embedded Systems" />
                </Field>
            </div>
            <div className="form-grid-2">
                <Field label="Base / Fixed Pay (LPA)" error={errors?.basePayLpa?.message}>
                    <input className="form-input" type="number" step="0.01" {...register('basePayLpa', { valueAsNumber: true })} placeholder="e.g., 10.00" />
                </Field>
                <Field label="Total CTC (LPA)" error={errors?.ctcLpa?.message}>
                    <input className="form-input" type="number" step="0.01" {...register('ctcLpa', { valueAsNumber: true })} placeholder="e.g., 12.50" />
                </Field>
            </div>
            <div className="form-grid-2">
                <Field label="Offer Letter Link" error={errors?.offerLetterLink?.message}>
                    <input className="form-input" {...register('offerLetterLink')} placeholder="https://drive.google.com/..." />
                </Field>
                <Field label="Core Domain Proof Link" error={errors?.coreDomainProofLink?.message}>
                    <input className="form-input" {...register('coreDomainProofLink')} placeholder="https://..." />
                </Field>
            </div>
        </>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AcademicExcellenceFields({ register, errors }: { register: any; errors: any }) {
    return (
        <>
            <div className="form-grid-2">
                <Field label="History of Arrears?" error={errors?.hasArrears?.message}>
                    <select className="form-input" {...register('hasArrears')}>
                        <option value="">Select...</option>
                        <option value="no">No, I have clean records</option>
                        <option value="yes">Yes, I have historical arrears</option>
                    </select>
                </Field>
                <Field label="Overall CGPA (out of 10)" error={errors?.cgpa?.message}>
                    <input className="form-input" type="number" step="0.01" min="0" max="10" {...register('cgpa', { valueAsNumber: true })} placeholder="e.g., 9.25" />
                </Field>
            </div>
            <Field label="Grade Sheet / Transcript Link" error={errors?.gradeSheetLink?.message}>
                <input className="form-input" {...register('gradeSheetLink')} placeholder="https://drive.google.com/..." />
            </Field>
        </>
    );
}

// ===== MAIN DYNAMIC PAGE =====
export default function AwardApplyPage() {
    const params = useParams();
    const slug = params.award as AwardSlug;
    const award = getAwardBySlug(slug);

    const [currentStep, setCurrentStep] = useState(0); // 0 = Personal, 1 = Award Details + Consent
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<AwardSubmitResult | null>(null);
    const [deadlinePassed, setDeadlinePassed] = useState(false);
    const [isLoadingDeadline, setIsLoadingDeadline] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);

    const schema = getSchemaForAward(slug);

    const getDefaults = useCallback(() => {
        const base = {
            personalDetails: { name: '', registerNumber: '', department: '' as any, specialization: '', personalEmail: '', srmEmail: '', mobileNumber: '', section: '', facultyAdvisor: '', profilePhotoUrl: '' },
            consentGiven: false as unknown as true,
        };
        switch (slug) {
            case 'academic-excellence': return { ...base, cgpa: 0, gradeSheetLink: '' };
            case 'researcher': return { ...base, papers: [], patents: [], researchStatement: '', masterProofFolderUrl: '' };
            case 'hackathon': return { ...base, wins: [], masterProofFolderUrl: '' };
            case 'sports': return { ...base, wins: [], masterProofFolderUrl: '' };
            case 'nss-ncc': return { ...base, organization: '', role: '', totalHoursServed: 0, eventsOrganized: '', impactDescription: '', proofLink: '', masterProofFolderUrl: '' };
            case 'dept-contribution': return { ...base, contributions: [], masterProofFolderUrl: '' };
            case 'highest-salary': return { ...base, companyName: '', jobRole: '', ctcLpa: 0, offerLetterLink: '' };
            case 'core-salary': return { ...base, companyName: '', jobRole: '', ctcLpa: 0, coreDomain: '', offerLetterLink: '', coreDomainProofLink: '' };
            default: return base;
        }
    }, [slug]);

    const form = useForm({
        resolver: schema ? zodResolver(schema) as any : undefined,
        defaultValues: getDefaults() as any,
        mode: 'onTouched',
    });

    const { register, control, formState: { errors }, handleSubmit, trigger } = form;

    // ===== Deadline check =====
    useEffect(() => {
        fetch('/api/deadline')
            .then(res => res.json())
            .then(data => {
                if (data.deadline && new Date() > new Date(data.deadline)) {
                    setDeadlinePassed(true);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoadingDeadline(false));
    }, []);

    // ===== Load draft from localStorage =====
    useEffect(() => {
        const saved = localStorage.getItem(`bo-draft-${slug}`);
        if (saved) {
            try {
                form.reset(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse draft', e);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    // ===== Save draft to localStorage =====
    useEffect(() => {
        const subscription = form.watch((value) => {
            localStorage.setItem(`bo-draft-${slug}`, JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }, [form, slug]);

    if (!award || !schema) {
        return (
            <>
                <Navbar />
                <main style={{ paddingTop: '100px', textAlign: 'center', padding: '100px clamp(16px, 4vw, 24px)' }}>
                    <h1>Award Not Found</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>The award category &quot;{slug}&quot; does not exist.</p>
                    <Link href="/apply" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary" style={{ marginTop: '24px' }}>Browse Awards</button>
                    </Link>
                </main>
            </>
        );
    }

    // ===== Loading state =====
    if (isLoadingDeadline) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-app)' }}>
                <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
            </div>
        );
    }

    // ===== Deadline passed =====
    if (deadlinePassed) {
        return (
            <>
                <Navbar />
                <main style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}
                    >
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto',
                        }}>
                            <X size={40} color="#DC2626" />
                        </div>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>
                            Applications Closed
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                            The deadline for {award.title} applications has passed. We are no longer accepting new submissions.
                        </p>
                        <Link href="/apply" style={{ textDecoration: 'none' }}>
                            <button className="btn-secondary">Back to Awards</button>
                        </Link>
                    </motion.div>
                </main>
            </>
        );
    }

    const nextStep = async () => {
        if (isNavigating || currentStep !== 0) return;
        setIsNavigating(true);
        const valid = await trigger('personalDetails');
        if (valid) {
            setCurrentStep(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setTimeout(() => setIsNavigating(false), 300);
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const res = await submitAwardApplication(slug, data);
            setResult(res);
            if (res.success) {
                localStorage.removeItem(`bo-draft-${slug}`);
            }
        } catch {
            setResult({ success: false, message: 'An unexpected error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success screen
    if (result?.success) {
        return (
            <>
                <Navbar />
                <main style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto',
                        }}><Check size={40} color="white" /></div>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>
                            Application Submitted!
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                            {result.message}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/apply" style={{ textDecoration: 'none' }}>
                                <button className="btn-primary">Apply for More Awards</button>
                            </Link>
                            <Link href="/" style={{ textDecoration: 'none' }}>
                                <button className="btn-secondary">Back to Home</button>
                            </Link>
                        </div>
                    </motion.div>
                </main>
            </>
        );
    }

    const STEPS_LABELS = ['Personal Details', award.shortTitle + ' Details'];

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '80px', padding: '80px clamp(16px, 4vw, 24px) 60px', maxWidth: '900px', margin: '0 auto' }}>
                {/* Award badge */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span style={{
                        display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
                        background: `${award.color}18`, color: award.color, fontSize: '0.85rem', fontWeight: 600,
                    }}>
                        🏆 {award.title}
                    </span>
                </div>

                {/* Step Indicator */}
                <div className="step-indicator" style={{ justifyContent: 'center', marginBottom: '32px' }}>
                    {STEPS_LABELS.map((label, i) => (
                        <React.Fragment key={i}>
                            <div className={`step ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
                                onClick={() => { if (i < currentStep) setCurrentStep(i); }}
                                style={{ cursor: i < currentStep ? 'pointer' : 'default' }}>
                                <span className="step-number">{i < currentStep ? <Check size={12} /> : i + 1}</span>
                                <span className="hidden sm:inline">{label}</span>
                            </div>
                            {i < STEPS_LABELS.length - 1 && <div className={`step-connector ${i < currentStep ? 'active' : ''}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'BUTTON') {
                            if (currentStep === 0) {
                                e.preventDefault();
                                nextStep();
                            }
                        }
                    }}>
                    <AnimatePresence mode="wait">
                        <motion.div key={currentStep}
                            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}>
                            {currentStep === 0 && <PersonalStep register={register} errors={errors} />}
                            {currentStep === 1 && (
                                <>
                                    <AwardDetailsStep slug={slug} register={register} errors={errors} control={control} />
                                    {/* Consent */}
                                    <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-md)', marginTop: '24px' }}>
                                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                                            <input type="checkbox" {...register('consentGiven')} style={{ marginTop: '4px' }} />
                                            <span style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                                                I certify that all the information provided is accurate. I understand that any falsification may result in disqualification.
                                            </span>
                                        </label>
                                        {errors?.consentGiven?.message && <span className="form-error">{String(errors.consentGiven.message)}</span>}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Error display */}
                    {result && !result.success && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                            marginTop: '20px', padding: '16px', borderRadius: 'var(--radius-sm)',
                            background: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#DC2626', fontSize: '14px',
                        }}>{result.message}</motion.div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', gap: '16px' }}>
                        <button type="button" className="btn-secondary" onClick={prevStep}
                            disabled={currentStep === 0} style={{ opacity: currentStep === 0 ? 0.3 : 1 }}>
                            <ChevronLeft size={18} /> Previous
                        </button>
                        {currentStep === 0 ? (
                            <button key="next-step-btn" type="button" className="btn-primary" onClick={nextStep} disabled={isNavigating}>
                                Next <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button key="submit-application-btn" type="submit" className="btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <><Send size={18} /> Submit Application</>}
                            </button>
                        )}
                    </div>
                </form>
            </main>
        </>
    );
}
