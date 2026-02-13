import { z } from 'zod';

// ===== Personal Details Schema =====
export const personalDetailsSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    registerNumber: z
        .string()
        .min(5, 'Register number is required')
        .regex(/^RA\d+$/i, 'Must be a valid SRM register number (e.g., RA2211053010097)'),
    department: z.string().min(2, 'Department is required'),
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
    profilePhotoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Academic Record Schema =====
export const academicRecordSchema = z.object({
    cgpa: z.coerce.number().min(0, 'CGPA must be 0 or above').max(10, 'CGPA cannot exceed 10'),
    tenthPercentage: z.coerce.number().min(0).max(100, 'Percentage cannot exceed 100'),
    twelfthPercentage: z.coerce.number().min(0).max(100, 'Percentage cannot exceed 100'),
    historyOfArrears: z.union([z.boolean(), z.string()]).transform((val) => val === true || val === 'true'),
    numberOfArrears: z.coerce.number().min(0).optional(),
});

// ===== Post-College Status Schema =====
export const postCollegeStatusSchema = z.object({
    status: z.enum(['placed', 'higher_studies', 'entrepreneur', 'unplaced', 'other']),
    placedCompany: z.string().optional(),
    offerLetterLink: z.string().url().optional().or(z.literal('')),
    universityName: z.string().optional(),
    admitCardLink: z.string().url().optional().or(z.literal('')),
    otherDetails: z.string().optional(),
});

// ===== Internship Schema =====
export const internshipSchema = z.object({
    id: z.string(),
    company: z.string().min(1, 'Company name is required'),
    role: z.string().min(1, 'Role is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    certificateLink: z.string().url('Invalid URL').or(z.literal('')),
    description: z.string().optional(),
});

// ===== Project Schema =====
export const projectSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Project title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    techStack: z.string().min(1, 'Tech stack is required'),
    githubLink: z.string().url('Invalid URL').optional().or(z.literal('')),
    deployedLink: z.string().url('Invalid URL').optional().or(z.literal('')),
    proofLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Hackathon Schema =====
export const hackathonSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Hackathon name is required'),
    projectBuilt: z.string().min(1, 'Project built is required'),
    teamSize: z.coerce.number().min(1, 'Team size must be at least 1'),
    position: z.string().min(1, 'Position is required'),
    proofLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Research Schema =====
export const researchSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Title is required'),
    journalOrConference: z.string().min(1, 'Journal/Conference is required'),
    indexStatus: z.enum(['scopus', 'sci', 'ugc', 'other', 'none']),
    publicationStatus: z.enum(['filed', 'published', 'granted', 'under_review']),
    link: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Entrepreneurship Schema =====
export const entrepreneurshipSchema = z.object({
    id: z.string(),
    startupName: z.string().min(1, 'Startup name is required'),
    registrationDetails: z.string().optional(),
    revenueOrFundingStatus: z.string().optional(),
    description: z.string().optional(),
    proofLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Certification Schema =====
export const certificationSchema = z.object({
    id: z.string(),
    provider: z.string().min(1, 'Provider is required'),
    certificateName: z.string().min(1, 'Certificate name is required'),
    validationId: z.string().optional(),
    proofLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Competitive Exam Schema =====
export const competitiveExamSchema = z.object({
    id: z.string(),
    examName: z.string().min(1, 'Exam name is required'),
    scoreOrRank: z.string().min(1, 'Score/Rank is required'),
    proofLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Sports/Cultural Schema =====
export const sportsOrCulturalSchema = z.object({
    id: z.string(),
    eventName: z.string().min(1, 'Event name is required'),
    level: z.enum(['zone', 'district', 'state', 'national', 'international']),
    positionWon: z.string().min(1, 'Position is required'),
    proofLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Volunteering Schema =====
export const volunteeringSchema = z.object({
    id: z.string(),
    organization: z.string().min(1, 'Organization is required'),
    role: z.string().min(1, 'Role is required'),
    hoursServed: z.coerce.number().min(0).optional(),
    impact: z.string().optional(),
    proofLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Scholarship Schema =====
export const scholarshipSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Scholarship name is required'),
    awardingBody: z.string().min(1, 'Awarding body is required'),
    amountOrPrestige: z.string().optional(),
    proofLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Club Activity Schema =====
export const clubActivitySchema = z.object({
    id: z.string(),
    clubName: z.string().min(1, 'Club name is required'),
    position: z.string().min(1, 'Position is required'),
    keyEventsOrganized: z.string().optional(),
    impactDescription: z.string().optional(),
    proofLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Department Contribution Schema =====
export const departmentContributionSchema = z.object({
    id: z.string(),
    eventName: z.string().min(1, 'Event name is required'),
    role: z.string().min(1, 'Role is required'),
    contributionDescription: z.string().optional(),
    proofLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Reference Schema =====
export const referenceSchema = z.object({
    id: z.string(),
    facultyName: z.string().min(1, 'Faculty name is required'),
    contact: z.string().min(1, 'Contact is required'),
    lorLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// ===== Social Media Schema =====
export const socialMediaSchema = z.object({
    linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
    github: z.string().url('Invalid URL').optional().or(z.literal('')),
    twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
    instagram: z.string().url('Invalid URL').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    others: z
        .array(
            z.object({
                platform: z.string().min(1),
                url: z.string().url('Invalid URL'),
            })
        )
        .optional(),
});

// ===== Future Goal Schema =====
export const futureGoalSchema = z.object({
    description: z.string().min(20, 'Please describe your future goals (min 20 characters)'),
});

// ===== Full Application Schema =====
export const applicationSchema = z.object({
    personalDetails: personalDetailsSchema,
    academicRecord: academicRecordSchema,
    postCollegeStatus: postCollegeStatusSchema,
    internships: z.array(internshipSchema),
    projects: z.array(projectSchema),
    hackathons: z.array(hackathonSchema),
    research: z.array(researchSchema),
    entrepreneurship: z.array(entrepreneurshipSchema),
    certifications: z.array(certificationSchema),
    competitiveExams: z.array(competitiveExamSchema),
    sportsOrCultural: z.array(sportsOrCulturalSchema),
    volunteering: z.array(volunteeringSchema),
    scholarships: z.array(scholarshipSchema),
    clubActivities: z.array(clubActivitySchema),
    departmentContributions: z.array(departmentContributionSchema),
    references: z.array(referenceSchema),
    socialMedia: socialMediaSchema,
    futureGoal: futureGoalSchema,
    videoPitchUrl: z.string().url('Please provide a valid video URL'),
    masterProofFolderUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    consentGiven: z.literal(true, {
        message: 'You must consent to data accuracy',
    }),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
