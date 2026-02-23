import { z } from 'zod';

// ===== Programme options (used globally) =====
export const PROGRAMME_OPTIONS = [
    'B.Tech Electronics and Communication Engineering',
    'B.Tech Electronics and Computer Engineering',
    'M.Tech Electronics and Communication Engineering',
] as const;

// ===== SHARED: Personal Details Schema (reused by all awards) =====
export const basePersonalSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    registerNumber: z
        .string()
        .min(5, 'Register number is required')
        .regex(/^RA\d+$/i, 'Must be a valid SRM register number (e.g., RA2211053010097)'),
    department: z.enum(PROGRAMME_OPTIONS).or(z.literal('')).refine(val => val !== '', 'Programme is required'),
    specialization: z.string().min(2, 'Specialization is required'),
    personalEmail: z.string().email('Invalid email address'),
    srmEmail: z
        .string()
        .email('Invalid SRM email')
        .regex(/@srmist\.edu\.in$/i, 'Must be a valid SRM email (@srmist.edu.in)'),
    mobileNumber: z
        .string()
        .min(10, 'Mobile number must be at least 10 digits')
        .regex(/^[+]?\d{10,15}$/, 'Invalid mobile number'),
    section: z.string().min(1, 'Section is required').max(3, 'Section too long'),
    facultyAdvisor: z.string().min(2, 'Faculty Advisor name is required'),
    profilePhotoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    linkedInUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    githubUrl: z.string().url('Invalid GitHub/Portfolio URL').optional().or(z.literal('')),
});

// ===== Award #2: Best Undergraduate Researcher =====
const researchEntrySchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Title is required'),
    journalOrConference: z.string().min(1, 'Journal/Conference is required'),
    indexStatus: z.enum(['scopus', 'sci', 'ugc', 'other', 'none']),
    publicationStatus: z.enum(['filed', 'published', 'granted', 'under_review']),
    link: z.string().url('Please provide a valid proof link'),
});

const patentEntrySchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Patent title is required'),
    patentNumber: z.string().optional().or(z.literal('')),
    status: z.enum(['filed', 'published', 'granted']),
    proofLink: z.string().url('Please provide a valid proof link'),
});

export const researcherSchema = z.object({
    personalDetails: basePersonalSchema,
    papers: z.array(researchEntrySchema).min(1, 'At least one paper is required'),
    patents: z.array(patentEntrySchema),
    researchStatement: z.string().min(20, 'Please describe your research focus (min 20 chars)'),
    masterProofFolderUrl: z.string().url('Please provide a Google Drive folder link with all proofs'),
    consentGiven: z.literal(true, { message: 'You must consent to data accuracy' }),
});

// ===== Award #3: Hackathon/Ideathon Prize Winner =====
const hackathonWinSchema = z.object({
    id: z.string(),
    eventName: z.string().min(1, 'Event name is required'),
    level: z.enum(['college', 'state', 'national', 'international']),
    position: z.string().min(1, 'Position is required'),
    teamSize: z.coerce.number().min(1, 'Team size must be at least 1'),
    projectBuilt: z.string().min(1, 'Project description is required'),
    proofLink: z.string().url('Please provide a valid proof link'),
});

export const hackathonWinnerSchema = z.object({
    personalDetails: basePersonalSchema,
    wins: z.array(hackathonWinSchema).min(1, 'At least one hackathon win is required'),
    masterProofFolderUrl: z.string().url('Please provide a Google Drive folder link with all proofs'),
    consentGiven: z.literal(true, { message: 'You must consent to data accuracy' }),
});

// ===== Award #4: Sports Prize Winner =====
const sportsWinSchema = z.object({
    id: z.string(),
    sportOrEvent: z.string().min(1, 'Sport/Event name is required'),
    level: z.enum(['zone', 'district', 'state', 'national', 'international']),
    position: z.string().min(1, 'Position is required'),
    proofLink: z.string().url('Please provide a valid proof link'),
});

export const sportsWinnerSchema = z.object({
    personalDetails: basePersonalSchema,
    wins: z.array(sportsWinSchema).min(1, 'At least one sports win is required'),
    masterProofFolderUrl: z.string().url('Please provide a Google Drive folder link with all proofs'),
    consentGiven: z.literal(true, { message: 'You must consent to data accuracy' }),
});

// ===== Award #5: Best NSS/NCC/Membership Participant =====
export const nssNccSchema = z.object({
    personalDetails: basePersonalSchema,
    organization: z.string().min(1, 'Organization name is required'),
    otherOrganization: z.string().optional().or(z.literal('')),
    role: z.string().min(1, 'Role is required'),
    highestCertificate: z.enum(['None', 'A', 'B', 'C', 'Camp']),
    totalHoursServed: z.coerce.number().min(0, 'Hours must be 0 or above'),
    eventsOrganized: z.string().optional().or(z.literal('')),
    impactDescription: z.string().min(20, 'Please describe your impact (min 20 chars)'),
    proofLink: z.string().url('Please provide a valid proof link'),
    masterProofFolderUrl: z.string().url('Please provide a Google Drive folder link with all proofs'),
    consentGiven: z.literal(true, { message: 'You must consent to data accuracy' }),
});

// ===== Award #6: Best Departmental Contributor =====
const deptContributionSchema = z.object({
    id: z.string(),
    activityType: z.string().min(1, 'Activity type is required'),
    role: z.string().min(1, 'Role is required'),
    eventName: z.string().min(1, 'Event/Activity name is required'),
    contributionDescription: z.string().min(10, 'Please describe your contribution'),
    proofLink: z.string().url('Please provide a valid proof link'),
});

export const deptContributorSchema = z.object({
    personalDetails: basePersonalSchema,
    contributions: z.array(deptContributionSchema).min(1, 'At least one contribution is required'),
    masterProofFolderUrl: z.string().url('Please provide a Google Drive folder link with all proofs'),
    consentGiven: z.literal(true, { message: 'You must consent to data accuracy' }),
});

// ===== Award #7: Highest Salary Package =====
export const highestSalarySchema = z.object({
    personalDetails: basePersonalSchema,
    companyName: z.string().min(1, 'Company name is required'),
    jobRole: z.string().min(1, 'Job role is required'),
    placementType: z.enum(['on-campus', 'off-campus']),
    ctcLpa: z.coerce.number().min(0.1, 'CTC must be greater than 0'),
    basePayLpa: z.coerce.number().min(0.1, 'Base pay must be greater than 0'),
    offerLetterLink: z.string().url('Please provide a valid offer letter link'),
    consentGiven: z.literal(true, { message: 'You must consent to data accuracy' }),
});

// ===== Award #8: Highest Salary in Core Company =====
export const coreSalarySchema = z.object({
    personalDetails: basePersonalSchema,
    companyName: z.string().min(1, 'Company name is required'),
    jobRole: z.string().min(1, 'Job role is required'),
    placementType: z.enum(['on-campus', 'off-campus']),
    ctcLpa: z.coerce.number().min(0.1, 'CTC must be greater than 0'),
    basePayLpa: z.coerce.number().min(0.1, 'Base pay must be greater than 0'),
    coreDomain: z.string().min(1, 'Core domain is required'),
    offerLetterLink: z.string().url('Please provide a valid offer letter link'),
    coreDomainProofLink: z.string().url('Please provide a valid core domain proof link'),
    consentGiven: z.literal(true, { message: 'You must consent to data accuracy' }),
});

// ===== Award #9: Best Student for Academic Excellence =====
export const academicExcellenceSchema = z.object({
    personalDetails: basePersonalSchema,
    cgpa: z.coerce.number().min(0, 'CGPA must be 0 or above').max(10, 'CGPA cannot exceed 10'),
    hasArrears: z.enum(['yes', 'no'], { message: 'Please declare if you have standing or historical arrears' }),
    gradeSheetLink: z.string().url('Please provide a valid grade sheet link'),
    consentGiven: z.literal(true, { message: 'You must consent to data accuracy' }),
});

// ===== Inferred Form Data Types =====
export type ResearcherFormData = z.infer<typeof researcherSchema>;
export type HackathonWinnerFormData = z.infer<typeof hackathonWinnerSchema>;
export type SportsWinnerFormData = z.infer<typeof sportsWinnerSchema>;
export type NssNccFormData = z.infer<typeof nssNccSchema>;
export type DeptContributorFormData = z.infer<typeof deptContributorSchema>;
export type HighestSalaryFormData = z.infer<typeof highestSalarySchema>;
export type CoreSalaryFormData = z.infer<typeof coreSalarySchema>;
export type AcademicExcellenceFormData = z.infer<typeof academicExcellenceSchema>;

// ===== Schema lookup by award slug =====
import { AwardSlug } from './awards';

export function getSchemaForAward(slug: AwardSlug) {
    switch (slug) {
        case 'academic-excellence': return academicExcellenceSchema;
        case 'researcher': return researcherSchema;
        case 'hackathon': return hackathonWinnerSchema;
        case 'sports': return sportsWinnerSchema;
        case 'nss-ncc': return nssNccSchema;
        case 'dept-contribution': return deptContributorSchema;
        case 'highest-salary': return highestSalarySchema;
        case 'core-salary': return coreSalarySchema;
        default: return null; // best-outgoing uses existing applicationSchema
    }
}
