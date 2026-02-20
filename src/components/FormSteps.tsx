'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, Control, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { ApplicationFormData } from '@/lib/schemas';
import { Plus, Trash2 } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { generateId } from '@/lib/utils';
import { SearchableSelect } from './SearchableSelect';

// ===== CURATED OPTION LISTS =====
const TOP_COMPANIES = [
    'TCS', 'Infosys', 'Wipro', 'Cognizant', 'HCL Technologies', 'Tech Mahindra',
    'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Adobe',
    'Accenture', 'Deloitte', 'IBM', 'Oracle', 'SAP', 'Capgemini', 'Zoho',
    'Flipkart', 'Samsung', 'Intel', 'Qualcomm', 'Goldman Sachs', 'JP Morgan',
    'Morgan Stanley', 'Cisco', 'Salesforce', 'PayPal', 'Uber', 'Freshworks',
    'Ola', 'PhonePe', 'Razorpay', 'BYJU\'S', 'Swiggy', 'Zomato',
    'L&T Infotech', 'Mphasis', 'Mindtree', 'Robert Bosch',
];

const TOP_HACKATHONS = [
    'Smart India Hackathon (SIH)', 'SIH 2024', 'SIH 2023',
    'HackMIT', 'HackHarvard', 'PennApps', 'TreeHacks', 'CalHacks',
    'MLH Local Hack Day', 'MLH Global Hack Week',
    'DevFolio Hackathon', 'ETHIndia', 'HackCBS', 'Hack36',
    'Google Code Jam', 'Meta Hacker Cup', 'ICPC',
    'AngelHack', 'Junction', 'HackZurich', 'TechCrunch Disrupt Hackathon',
    'NASA Space Apps Challenge', 'Kavach Hackathon', 'Toycathon',
    'IIIT Hackathon', 'CodeSangam', 'Hackfest',
];

const TOP_VOLUNTEERING_ORGS = [
    'NSS (National Service Scheme)', 'NCC (National Cadet Corps)',
    'Rotaract Club', 'Leo Club', 'Red Cross Society',
    'UNICEF', 'WWF', 'Teach India', 'CRY (Child Rights and You)',
    'Habitat for Humanity', 'Bhumi', 'Make A Wish Foundation',
    'Robin Hood Army', 'Goonj', 'Akshaya Patra Foundation',
    'Youth For Seva', 'iVolunteer', 'Pratham',
    'SRM Community Service', 'IEEE Humanitarian',
];

interface StepProps {
    register: UseFormRegister<ApplicationFormData>;
    errors: FieldErrors<ApplicationFormData>;
    control: Control<ApplicationFormData>;
}

// ===== STEP 1: Personal Details =====
export function PersonalDetailsStep({ register, errors }: StepProps) {
    return (
        <div>
            <h2 className="section-title">
                <span className="icon">👤</span>
                Personal Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <Field label="Full Name *" error={errors.personalDetails?.name?.message}>
                        <input className="form-input" placeholder="e.g. John Doe" {...register('personalDetails.name')} />
                    </Field>
                    <Field label="Section *" error={errors.personalDetails?.section?.message}>
                        <select className="form-input" {...register('personalDetails.section')}>
                            <option value="">Select</option>
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </Field>
                </div>
                <Field label="Register Number *" error={errors.personalDetails?.registerNumber?.message}>
                    <input className="form-input" placeholder="e.g. RA2111003010xxx" {...register('personalDetails.registerNumber')} />
                </Field>
                <Field label="Faculty Advisor Name *" error={errors.personalDetails?.facultyAdvisor?.message}>
                    <input className="form-input" placeholder="e.g. Dr. A. Smith" {...register('personalDetails.facultyAdvisor')} />
                </Field>
                <Field label="Department *" error={errors.personalDetails?.department?.message}>
                    <select className="form-input" {...register('personalDetails.department')}>
                        <option value="">Select Department</option>
                        <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                        <option value="Electronics And Computer Engineering">Electronics And Computer Engineering</option>
                    </select>
                </Field>
                <Field label="Specialization *" error={errors.personalDetails?.specialization?.message}>
                    <input className="form-input" placeholder="e.g. AI & ML" {...register('personalDetails.specialization')} />
                </Field>
                <Field label="Personal Email *" error={errors.personalDetails?.personalEmail?.message}>
                    <input className="form-input" type="email" placeholder="john.doe@gmail.com" {...register('personalDetails.personalEmail')} />
                </Field>
                <Field label="SRM Email *" error={errors.personalDetails?.srmEmail?.message}>
                    <input className="form-input" type="email" placeholder="xx1234@srmist.edu.in" {...register('personalDetails.srmEmail')} />
                </Field>
                <Field label="Mobile Number *" error={errors.personalDetails?.mobileNumber?.message}>
                    <input className="form-input" type="tel" placeholder="+91XXXXXXXXXX" {...register('personalDetails.mobileNumber')} />
                </Field>
                <Field label="Profile Photo URL" error={errors.personalDetails?.profilePhotoUrl?.message}>
                    <input className="form-input" placeholder="Google Drive / Imgur link" {...register('personalDetails.profilePhotoUrl')} />
                </Field>
            </div>
        </div>
    );
}

// ===== STEP 2: Academic Record =====
export function AcademicStep({ register, errors, control }: StepProps) {
    return (
        <div>
            <h2 className="section-title">
                <span className="icon">📚</span>
                Academic Record
                <InfoTooltip text="📊 Weight: 18% of total score. CGPA is normalized to 10. Arrears history incurs a 15% penalty on your academic score." />
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <Field label="Current CGPA *" error={errors.academicRecord?.cgpa?.message}>
                    <input className="form-input" type="number" step="0.01" min="0" max="10" placeholder="8.5" {...register('academicRecord.cgpa')} />
                </Field>
                <Field label="10th Percentage *" error={errors.academicRecord?.tenthPercentage?.message}>
                    <input className="form-input" type="number" step="0.01" min="0" max="100" placeholder="95.0" {...register('academicRecord.tenthPercentage')} />
                </Field>
                <Field label="12th Percentage *" error={errors.academicRecord?.twelfthPercentage?.message}>
                    <input className="form-input" type="number" step="0.01" min="0" max="100" placeholder="92.0" {...register('academicRecord.twelfthPercentage')} />
                </Field>
                <Field label="History of Arrears" error={errors.academicRecord?.historyOfArrears?.message}>
                    <div style={{ display: 'flex', gap: '16px', paddingTop: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input type="radio" value="false" {...register('academicRecord.historyOfArrears')} /> No
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input type="radio" value="true" {...register('academicRecord.historyOfArrears')} /> Yes
                        </label>
                    </div>
                </Field>
                <Field label="Number of Arrears (if any)" error={errors.academicRecord?.numberOfArrears?.message}>
                    <input className="form-input" type="number" min="0" placeholder="0" {...register('academicRecord.numberOfArrears')} />
                </Field>
            </div>

            {/* Post-College Status */}
            <h2 className="section-title" style={{ marginTop: '40px' }}>
                <span className="icon">🎯</span>
                Post-College Status
                <InfoTooltip text="Having a placement, higher studies admit, or startup strengthens your overall profile." />
            </h2>
            <PostCollegeSection register={register} errors={errors} control={control} />
        </div>
    );
}

// ===== STEP 3: Technical Achievements =====
export function TechnicalStep({ register, errors, control }: StepProps) {
    const internships = useFieldArray({ control, name: 'internships' });
    const projects = useFieldArray({ control, name: 'projects' });
    const hackathons = useFieldArray({ control, name: 'hackathons' });

    return (
        <div>
            {/* Internships */}
            <ArraySection
                title="💼 Internships"
                hint="📊 Weight: 10%. Up to 5 internships are scored with diminishing returns."
                fields={internships.fields}
                onAdd={() => internships.append({ id: generateId(), company: '', role: '', startDate: '', endDate: '', certificateLink: '', description: '' })}
                onRemove={internships.remove}
            >
                {internships.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Internship #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => internships.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Company *" error={errors.internships?.[index]?.company?.message}>
                                <Controller
                                    control={control}
                                    name={`internships.${index}.company`}
                                    render={({ field }) => (
                                        <SearchableSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={TOP_COMPANIES}
                                            placeholder="Type or select company"
                                            error={errors.internships?.[index]?.company?.message}
                                        />
                                    )}
                                />
                            </Field>
                            <Field label="Role *" error={errors.internships?.[index]?.role?.message}>
                                <input className="form-input" placeholder="Software Engineer Intern" {...register(`internships.${index}.role`)} />
                            </Field>
                            <Field label="Start Date *" error={errors.internships?.[index]?.startDate?.message}>
                                <input className="form-input" type="month" {...register(`internships.${index}.startDate`)} />
                            </Field>
                            <Field label="End Date *" error={errors.internships?.[index]?.endDate?.message}>
                                <input className="form-input" type="month" {...register(`internships.${index}.endDate`)} />
                            </Field>
                            <Field label="Certificate Link *" error={errors.internships?.[index]?.certificateLink?.message}>
                                <input className="form-input" placeholder="https://drive.google.com/..." {...register(`internships.${index}.certificateLink`)} />
                            </Field>
                            <Field label="Description" error={errors.internships?.[index]?.description?.message}>
                                <input className="form-input" placeholder="Brief description of work" {...register(`internships.${index}.description`)} />
                            </Field>
                        </div>
                    </div>
                ))}
            </ArraySection>

            {/* Projects */}
            <ArraySection
                title="🚀 Projects"
                hint="📊 Weight: 10%. Up to 5 projects are scored. Deployed projects with GitHub links strengthen your case."
                fields={projects.fields}
                onAdd={() => projects.append({ id: generateId(), title: '', description: '', techStack: '', githubLink: '', deployedLink: '', proofLink: '' })}
                onRemove={projects.remove}
            >
                {projects.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Project #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => projects.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Title *" error={errors.projects?.[index]?.title?.message}>
                                <input className="form-input" placeholder="Project Title" {...register(`projects.${index}.title`)} />
                            </Field>
                            <Field label="Tech Stack *" error={errors.projects?.[index]?.techStack?.message}>
                                <input className="form-input" placeholder="React, Node.js, MongoDB" {...register(`projects.${index}.techStack`)} />
                            </Field>
                            <Field label="GitHub Link" error={errors.projects?.[index]?.githubLink?.message}>
                                <input className="form-input" placeholder="https://github.com/..." {...register(`projects.${index}.githubLink`)} />
                            </Field>
                            <Field label="Proof Link *" error={errors.projects?.[index]?.proofLink?.message}>
                                <input className="form-input" placeholder="https://drive.google.com/..." {...register(`projects.${index}.proofLink`)} />
                            </Field>
                            <Field label="Deployed Link" error={errors.projects?.[index]?.deployedLink?.message}>
                                <input className="form-input" placeholder="https://myproject.vercel.app" {...register(`projects.${index}.deployedLink`)} />
                            </Field>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Field label="Description *" error={errors.projects?.[index]?.description?.message}>
                                    <textarea className="form-input" rows={3} placeholder="What does this project do? What problem does it solve?" {...register(`projects.${index}.description`)} />
                                </Field>
                            </div>
                        </div>
                    </div>
                ))}
            </ArraySection>

            {/* Hackathons */}
            <ArraySection
                title="⚡ Hackathons"
                hint="📊 Weight: 8%. Up to 5 hackathon wins are scored. National-level wins are valued higher."
                fields={hackathons.fields}
                onAdd={() => hackathons.append({ id: generateId(), name: '', projectBuilt: '', teamSize: 1, position: '', proofLink: '' })}
                onRemove={hackathons.remove}
            >
                {hackathons.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Hackathon #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => hackathons.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Hackathon Name *" error={errors.hackathons?.[index]?.name?.message}>
                                <Controller
                                    control={control}
                                    name={`hackathons.${index}.name`}
                                    render={({ field }) => (
                                        <SearchableSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={TOP_HACKATHONS}
                                            placeholder="Type or select hackathon"
                                            error={errors.hackathons?.[index]?.name?.message}
                                        />
                                    )}
                                />
                            </Field>
                            <Field label="Project Built *" error={errors.hackathons?.[index]?.projectBuilt?.message}>
                                <input className="form-input" placeholder="What you built" {...register(`hackathons.${index}.projectBuilt`)} />
                            </Field>
                            <Field label="Team Size *" error={errors.hackathons?.[index]?.teamSize?.message}>
                                <input className="form-input" type="number" min="1" {...register(`hackathons.${index}.teamSize`)} />
                            </Field>
                            <Field label="Position *" error={errors.hackathons?.[index]?.position?.message}>
                                <input className="form-input" placeholder="Winner / Runner-up / Finalist" {...register(`hackathons.${index}.position`)} />
                            </Field>
                            <Field label="Proof Link *" error={errors.hackathons?.[index]?.proofLink?.message}>
                                <input className="form-input" placeholder="https://drive.google.com/..." {...register(`hackathons.${index}.proofLink`)} />
                            </Field>
                        </div>
                    </div>
                ))}
            </ArraySection>
        </div>
    );
}

// ===== STEP 4: Achievements & Co-curricular =====
export function AchievementsStep({ register, errors, control }: StepProps) {
    const research = useFieldArray({ control, name: 'research' });
    const entrepreneurship = useFieldArray({ control, name: 'entrepreneurship' });
    const certifications = useFieldArray({ control, name: 'certifications' });
    const exams = useFieldArray({ control, name: 'competitiveExams' });
    const sports = useFieldArray({ control, name: 'sportsOrCultural' });
    const volunteering = useFieldArray({ control, name: 'volunteering' });
    const scholarships = useFieldArray({ control, name: 'scholarships' });
    const clubs = useFieldArray({ control, name: 'clubActivities' });
    const deptContributions = useFieldArray({ control, name: 'departmentContributions' });
    const professionalMemberships = useFieldArray({ control, name: 'professionalMemberships' });
    const references = useFieldArray({ control, name: 'references' });

    return (
        <div>
            {/* Research */}
            <ArraySection title="📄 Research / Papers / Patents" hint="📊 Weight: 12%. SCI > Scopus > UGC indexed. Published papers score highest. Up to 5 counted." fields={research.fields}
                onAdd={() => research.append({ id: generateId(), title: '', journalOrConference: '', indexStatus: 'none', publicationStatus: 'under_review', link: '' })}
                onRemove={research.remove}
            >
                {research.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Paper #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => research.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Title *"><input className="form-input" {...register(`research.${index}.title`)} /></Field>
                            <Field label="Journal / Conference *"><input className="form-input" {...register(`research.${index}.journalOrConference`)} /></Field>
                            <Field label="Index Status *">
                                <select className="form-input" {...register(`research.${index}.indexStatus`)}>
                                    <option value="none">None</option><option value="scopus">Scopus</option><option value="sci">SCI</option><option value="ugc">UGC</option><option value="other">Other</option>
                                </select>
                            </Field>
                            <Field label="Publication Status *">
                                <select className="form-input" {...register(`research.${index}.publicationStatus`)}>
                                    <option value="under_review">Under Review</option><option value="filed">Filed</option><option value="published">Published</option><option value="granted">Granted</option>
                                </select>
                            </Field>
                            <Field label="Paper Link *" error={errors.research?.[index]?.link?.message}><input className="form-input" placeholder="https://doi.org/... or URL" {...register(`research.${index}.link`)} /></Field>
                        </div>
                    </div>
                ))}
            </ArraySection>

            {/* Entrepreneurship */}
            <ArraySection title="🏢 Entrepreneurship" hint="📊 Weight: 8%. Registered startups with revenue/funding score higher. Up to 3 counted." fields={entrepreneurship.fields}
                onAdd={() => entrepreneurship.append({ id: generateId(), startupName: '', registrationDetails: '', revenueOrFundingStatus: '', description: '', proofLink: '' })}
                onRemove={entrepreneurship.remove}
            >
                {entrepreneurship.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Startup #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => entrepreneurship.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Startup Name *"><input className="form-input" {...register(`entrepreneurship.${index}.startupName`)} /></Field>
                            <Field label="Registration Details"><input className="form-input" {...register(`entrepreneurship.${index}.registrationDetails`)} /></Field>
                            <Field label="Revenue / Funding Status"><input className="form-input" {...register(`entrepreneurship.${index}.revenueOrFundingStatus`)} /></Field>
                            <Field label="Proof Link *" error={errors.entrepreneurship?.[index]?.proofLink?.message}><input className="form-input" placeholder="https://drive.google.com/..." {...register(`entrepreneurship.${index}.proofLink`)} /></Field>
                        </div>
                    </div>
                ))}
            </ArraySection>

            {/* Certifications */}
            <ArraySection title="🏅 Global Certifications" hint="📊 Weight: 5%. Up to 5 certifications are scored. Industry-recognized certs (AWS, Google, Cisco) are valued." fields={certifications.fields}
                onAdd={() => certifications.append({ id: generateId(), provider: '', certificateName: '', validationId: '', proofLink: '' })}
                onRemove={certifications.remove}
            >
                {certifications.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Certificate #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => certifications.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Provider *"><input className="form-input" placeholder="AWS / Google / Cisco" {...register(`certifications.${index}.provider`)} /></Field>
                            <Field label="Certificate Name *"><input className="form-input" {...register(`certifications.${index}.certificateName`)} /></Field>
                            <Field label="Validation ID"><input className="form-input" {...register(`certifications.${index}.validationId`)} /></Field>
                            <Field label="Proof Link *" error={errors.certifications?.[index]?.proofLink?.message}><input className="form-input" placeholder="https://drive.google.com/..." {...register(`certifications.${index}.proofLink`)} /></Field>
                        </div>
                    </div>
                ))}
            </ArraySection>

            {/* Competitive Exams */}
            <ArraySection title="📝 Competitive Exams" hint="📊 Weight: 5%. GATE, GRE, CAT, etc. Up to 3 scored." fields={exams.fields}
                onAdd={() => exams.append({ id: generateId(), examName: '', scoreOrRank: '', proofLink: '' })}
                onRemove={exams.remove}
            >
                {exams.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Exam #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => exams.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Exam Name *"><input className="form-input" placeholder="GATE / GRE / CAT" {...register(`competitiveExams.${index}.examName`)} /></Field>
                            <Field label="Score / Rank *"><input className="form-input" placeholder="Score or AIR" {...register(`competitiveExams.${index}.scoreOrRank`)} /></Field>
                            <Field label="Proof Link *" error={errors.competitiveExams?.[index]?.proofLink?.message}><input className="form-input" placeholder="https://drive.google.com/..." {...register(`competitiveExams.${index}.proofLink`)} /></Field>
                        </div>
                    </div>
                ))}
            </ArraySection>

            {/* Sports */}
            <ArraySection title="🏆 Sports / Cultural" hint="📊 Weight: 5%. International > National > State > District > Zone level. Up to 5 counted." fields={sports.fields}
                onAdd={() => sports.append({ id: generateId(), eventName: '', level: 'zone', positionWon: '', proofLink: '' })}
                onRemove={sports.remove}
            >
                {sports.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Event #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => sports.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Event Name *"><input className="form-input" {...register(`sportsOrCultural.${index}.eventName`)} /></Field>
                            <Field label="Level *">
                                <select className="form-input" {...register(`sportsOrCultural.${index}.level`)}>
                                    <option value="zone">Zone</option><option value="district">District</option><option value="state">State</option><option value="national">National</option><option value="international">International</option>
                                </select>
                            </Field>
                            <Field label="Position Won *"><input className="form-input" placeholder="1st / 2nd / Finalist" {...register(`sportsOrCultural.${index}.positionWon`)} /></Field>
                            <Field label="Proof Link *" error={errors.sportsOrCultural?.[index]?.proofLink?.message}><input className="form-input" placeholder="https://drive.google.com/..." {...register(`sportsOrCultural.${index}.proofLink`)} /></Field>
                        </div>
                    </div>
                ))}
            </ArraySection>

            {/* Volunteering */}
            <ArraySection title="🤝 Volunteering / Social Service" hint="📊 Weight: 5%. Up to 5 activities scored. Hours served and impact matter." fields={volunteering.fields}
                onAdd={() => volunteering.append({ id: generateId(), organization: '', role: '', hoursServed: 0, impact: '', proofLink: '' })}
                onRemove={volunteering.remove}
            >
                {volunteering.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Activity #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => volunteering.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Organization *" error={errors.volunteering?.[index]?.organization?.message}>
                                <Controller
                                    control={control}
                                    name={`volunteering.${index}.organization`}
                                    render={({ field }) => (
                                        <SearchableSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={TOP_VOLUNTEERING_ORGS}
                                            placeholder="Type or select organization"
                                            error={errors.volunteering?.[index]?.organization?.message}
                                        />
                                    )}
                                />
                            </Field>
                            <Field label="Role *"><input className="form-input" {...register(`volunteering.${index}.role`)} /></Field>
                            <Field label="Hours Served"><input className="form-input" type="number" {...register(`volunteering.${index}.hoursServed`)} /></Field>
                            <Field label="Impact"><input className="form-input" placeholder="Describe impact" {...register(`volunteering.${index}.impact`)} /></Field>
                            <Field label="Proof Link *" error={errors.volunteering?.[index]?.proofLink?.message}><input className="form-input" placeholder="https://drive.google.com/..." {...register(`volunteering.${index}.proofLink`)} /></Field>
                        </div>
                    </div>
                ))}
            </ArraySection>

            {/* Scholarships */}
            <ArraySection title="🎓 Scholarships / Grants" hint="📊 Weight: 4%. Up to 3 scholarships are scored." fields={scholarships.fields}
                onAdd={() => scholarships.append({ id: generateId(), name: '', awardingBody: '', amountOrPrestige: '', proofLink: '' })}
                onRemove={scholarships.remove}
            >
                {scholarships.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Scholarship #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => scholarships.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Scholarship Name *"><input className="form-input" {...register(`scholarships.${index}.name`)} /></Field>
                            <Field label="Awarding Body *"><input className="form-input" {...register(`scholarships.${index}.awardingBody`)} /></Field>
                            <Field label="Amount / Prestige"><input className="form-input" {...register(`scholarships.${index}.amountOrPrestige`)} /></Field>
                            <Field label="Proof Link *" error={errors.scholarships?.[index]?.proofLink?.message}><input className="form-input" placeholder="https://drive.google.com/..." {...register(`scholarships.${index}.proofLink`)} /></Field>
                        </div>
                    </div>
                ))}
            </ArraySection>

            {/* Clubs */}
            <ArraySection title="🏛️ Clubs / Leadership Roles" hint="📊 Weight: 4%. Up to 3 club roles are scored. Leadership positions (President, Secretary) count more." fields={clubs.fields}
                onAdd={() => clubs.append({ id: generateId(), clubName: '', position: '', keyEventsOrganized: '', impactDescription: '', proofLink: '' })}
                onRemove={clubs.remove}
            >
                {clubs.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Club #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => clubs.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Club Name *"><input className="form-input" {...register(`clubActivities.${index}.clubName`)} /></Field>
                            <Field label="Position *"><input className="form-input" placeholder="President / Secretary / Member" {...register(`clubActivities.${index}.position`)} /></Field>
                            <Field label="Key Events Organized"><input className="form-input" {...register(`clubActivities.${index}.keyEventsOrganized`)} /></Field>
                            <Field label="Impact Description"><input className="form-input" {...register(`clubActivities.${index}.impactDescription`)} /></Field>
                            <Field label="Proof Link *" error={errors.clubActivities?.[index]?.proofLink?.message}><input className="form-input" placeholder="https://drive.google.com/..." {...register(`clubActivities.${index}.proofLink`)} /></Field>
                        </div>
                    </div>
                ))}
            </ArraySection>

            {/* Department Contributions */}
            <ArraySection title="🏫 Department Contributions" hint="📊 Weight: 2%. Up to 3 contributions are scored." fields={deptContributions.fields}
                onAdd={() => deptContributions.append({ id: generateId(), eventName: '', role: '', contributionDescription: '', proofLink: '' })}
                onRemove={deptContributions.remove}
            >
                {deptContributions.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Contribution #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => deptContributions.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Event Name *"><input className="form-input" {...register(`departmentContributions.${index}.eventName`)} /></Field>
                            <Field label="Role *"><input className="form-input" placeholder="Organizer / Volunteer" {...register(`departmentContributions.${index}.role`)} /></Field>
                            <Field label="Contribution Description"><input className="form-input" {...register(`departmentContributions.${index}.contributionDescription`)} /></Field>
                            <Field label="Proof Link *" error={errors.departmentContributions?.[index]?.proofLink?.message}><input className="form-input" placeholder="https://drive.google.com/..." {...register(`departmentContributions.${index}.proofLink`)} /></Field>
                        </div>
                    </div>
                ))}
            </ArraySection>

            {/* Professional Memberships */}
            <ArraySection title="🪪 Professional Body Memberships" hint="📊 Weight: 2%. IEEE, ACM, etc. Up to 3 scored." fields={professionalMemberships.fields}
                onAdd={() => professionalMemberships.append({ id: generateId(), organization: '', membershipId: '', role: '', proofLink: '' })}
                onRemove={professionalMemberships.remove}
            >
                {professionalMemberships.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Membership #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => professionalMemberships.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Organization / Body * (e.g. IEEE, ACM)" error={errors.professionalMemberships?.[index]?.organization?.message}>
                                <input className="form-input" {...register(`professionalMemberships.${index}.organization`)} />
                            </Field>
                            <Field label="Membership ID / Reg. No" error={errors.professionalMemberships?.[index]?.membershipId?.message}>
                                <input className="form-input" {...register(`professionalMemberships.${index}.membershipId`)} />
                            </Field>
                            <Field label="Role / Grade (e.g. Student Member)" error={errors.professionalMemberships?.[index]?.role?.message}>
                                <input className="form-input" {...register(`professionalMemberships.${index}.role`)} />
                            </Field>
                            <Field label="Proof Link" error={errors.professionalMemberships?.[index]?.proofLink?.message}>
                                <input className="form-input" placeholder="ID Card / Certificate link" {...register(`professionalMemberships.${index}.proofLink`)} />
                            </Field>
                        </div>
                    </div>
                ))}
            </ArraySection>

            {/* References */}
            <ArraySection title="👨‍🏫 References / Letter of Recommendation" hint="📊 Weight: 2%. Faculty references strengthen your application." fields={references.fields}
                onAdd={() => references.append({ id: generateId(), facultyName: '', contact: '', lorLink: '' })}
                onRemove={references.remove}
            >
                {references.fields.map((field, index) => (
                    <div key={field.id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>Reference #{index + 1}</span>
                            <button type="button" className="btn-danger" onClick={() => references.remove(index)}><Trash2 size={14} /> Remove</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <Field label="Faculty Name *"><input className="form-input" {...register(`references.${index}.facultyName`)} /></Field>
                            <Field label="Contact *"><input className="form-input" placeholder="Email or Phone" {...register(`references.${index}.contact`)} /></Field>
                            <Field label="LoR Link"><input className="form-input" placeholder="Google Drive link" {...register(`references.${index}.lorLink`)} /></Field>
                        </div>
                    </div>
                ))}
            </ArraySection>
        </div>
    );
}

// ===== STEP 5: Final (Social Media, Goals, Video, Consent) =====
export function FinalStep({ register, errors, control }: StepProps) {
    const otherSocials = useFieldArray({ control, name: 'socialMedia.others' });

    return (
        <div>
            {/* Social Media */}
            <h2 className="section-title"><span className="icon">🌐</span>Social Media</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <Field label="LinkedIn" error={errors.socialMedia?.linkedin?.message}>
                    <input className="form-input" placeholder="https://linkedin.com/in/..." {...register('socialMedia.linkedin')} />
                </Field>
                <Field label="GitHub" error={errors.socialMedia?.github?.message}>
                    <input className="form-input" placeholder="https://github.com/..." {...register('socialMedia.github')} />
                </Field>
                <Field label="X (Twitter)" error={errors.socialMedia?.twitter?.message}>
                    <input className="form-input" placeholder="https://x.com/..." {...register('socialMedia.twitter')} />
                </Field>
                <Field label="Instagram" error={errors.socialMedia?.instagram?.message}>
                    <input className="form-input" placeholder="https://instagram.com/..." {...register('socialMedia.instagram')} />
                </Field>
                <Field label="Personal Website" error={errors.socialMedia?.website?.message}>
                    <input className="form-input" placeholder="https://yourwebsite.com" {...register('socialMedia.website')} />
                </Field>
            </div>

            {/* Other Socials */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Other Platforms</span>
                    <button type="button" className="btn-ghost" onClick={() => otherSocials.append({ platform: '', url: '' })}>
                        <Plus size={14} /> Add Platform
                    </button>
                </div>
                {otherSocials.fields.map((field, index) => (
                    <div key={field.id} style={{ display: 'flex', gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
                        <input className="form-input" style={{ flex: 1 }} placeholder="Platform Name" {...register(`socialMedia.others.${index}.platform`)} />
                        <input className="form-input" style={{ flex: 2 }} placeholder="URL" {...register(`socialMedia.others.${index}.url`)} />
                        <button type="button" className="btn-danger" onClick={() => otherSocials.remove(index)}><Trash2 size={14} /></button>
                    </div>
                ))}
            </div>

            {/* Future Goal */}
            <h2 className="section-title"><span className="icon">🎯</span>Future Goal</h2>
            <Field label="What is your goal after college? *" error={errors.futureGoal?.description?.message}>
                <textarea className="form-input" rows={5} placeholder="Describe your future goals, aspirations, and how SRM has prepared you for them..." {...register('futureGoal.description')} />
            </Field>

            {/* Video Pitch */}
            <h2 className="section-title" style={{ marginTop: '40px' }}><span className="icon">🎬</span>Video Pitch</h2>
            <Field label="Video URL (YouTube / Google Drive / Loom) *" error={errors.videoPitchUrl?.message}>
                <input className="form-input" placeholder="https://youtube.com/watch?v=..." {...register('videoPitchUrl')} />
            </Field>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Record a 2-5 minute video explaining why you deserve the Best Outgoing Student award.
            </p>

            {/* Master Proof Folder */}
            <h2 className="section-title" style={{ marginTop: '40px' }}><span className="icon">📁</span>Master Proof Folder</h2>
            <Field label="Google Drive Folder Link (All proofs in one place) *" error={errors.masterProofFolderUrl?.message}>
                <input className="form-input" placeholder="https://drive.google.com/drive/folders/..." {...register('masterProofFolderUrl')} />
            </Field>

            {/* Consent */}
            <div style={{ marginTop: '40px', padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" {...register('consentGiven')} style={{ marginTop: '4px', accentColor: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        I hereby declare that all the information provided above is true and accurate to the best of my knowledge. I understand that any false information may lead to disqualification from the Best Outgoing Student Award.
                    </span>
                </label>
                {errors.consentGiven && <p className="form-error" style={{ marginTop: '8px' }}>{errors.consentGiven.message}</p>}
            </div>
        </div>
    );
}

// ===== POST-COLLEGE STATUS (with conditional fields) =====
function PostCollegeSection({ register, errors, control }: StepProps) {
    const statusValue = useWatch({ control, name: 'postCollegeStatus.status' });

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <Field label="Current Status *" error={errors.postCollegeStatus?.status?.message}>
                <select className="form-input" {...register('postCollegeStatus.status')}>
                    <option value="">Select...</option>
                    <option value="placed">Placed</option>
                    <option value="higher_studies">Higher Studies</option>
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="unplaced">Unplaced</option>
                    <option value="other">Other</option>
                </select>
            </Field>
            {statusValue === 'placed' && (
                <>
                    <Field label="Company Name *" error={errors.postCollegeStatus?.placedCompany?.message}>
                        <input className="form-input" placeholder="e.g. Google, TCS" {...register('postCollegeStatus.placedCompany')} />
                    </Field>
                    <Field label="Offer Letter Link" error={errors.postCollegeStatus?.offerLetterLink?.message}>
                        <input className="form-input" placeholder="Google Drive link" {...register('postCollegeStatus.offerLetterLink')} />
                    </Field>
                </>
            )}
            {statusValue === 'higher_studies' && (
                <>
                    <Field label="University Name *" error={errors.postCollegeStatus?.placedCompany?.message}>
                        <input className="form-input" placeholder="e.g. MIT, Stanford" {...register('postCollegeStatus.placedCompany')} />
                    </Field>
                    <Field label="Admit Card Link" error={errors.postCollegeStatus?.offerLetterLink?.message}>
                        <input className="form-input" placeholder="Google Drive link" {...register('postCollegeStatus.offerLetterLink')} />
                    </Field>
                </>
            )}
            {statusValue === 'entrepreneur' && (
                <Field label="Startup / Venture Name" error={errors.postCollegeStatus?.placedCompany?.message}>
                    <input className="form-input" placeholder="e.g. My Startup" {...register('postCollegeStatus.placedCompany')} />
                </Field>
            )}
            {statusValue === 'other' && (
                <Field label="Please specify *" error={errors.postCollegeStatus?.otherDetails?.message}>
                    <input className="form-input" placeholder="Describe your current status" {...register('postCollegeStatus.otherDetails')} />
                </Field>
            )}
        </div>
    );
}

// ===== HELPER COMPONENTS =====

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="form-label">{label}</label>
            {children}
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}

function ArraySection({
    title,
    hint,
    fields,
    onAdd,
    onRemove,
    children,
}: {
    title: string;
    hint?: string;
    fields: { id: string }[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    children: React.ReactNode;
}) {
    void onRemove; // used by individual items
    return (
        <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>{title}{hint && <InfoTooltip text={hint} />}</h2>
                <button type="button" className="btn-ghost" onClick={onAdd}>
                    <Plus size={14} /> Add {fields.length > 0 ? 'Another' : 'Entry'}
                </button>
            </div>
            {fields.length === 0 && (
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No entries yet. Click the button above to add one.
                </div>
            )}
            {children}
        </div>
    );
}

// ===== GLOBAL DATALISTS (rendered once) =====
export function FormDataLists() {
    return (
        <>
            <datalist id="companyList">
                {TOP_COMPANIES.map(c => <option key={c} value={c} />)}
            </datalist>
            <datalist id="hackathonList">
                {TOP_HACKATHONS.map(h => <option key={h} value={h} />)}
            </datalist>
            <datalist id="volunteerOrgList">
                {TOP_VOLUNTEERING_ORGS.map(o => <option key={o} value={o} />)}
            </datalist>
        </>
    );
}
