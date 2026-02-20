// ===== MULTI-AWARD TYPE DEFINITIONS =====
// These types are SEPARATE from the existing StudentApplication (types.ts).
// The existing types.ts is used only for the Best Outgoing Student award.

// ---- Shared Personal Details (reused across all awards) ----
export interface BasePersonalDetails {
    name: string;
    registerNumber: string;
    department: string;
    specialization: string;
    personalEmail: string;
    srmEmail: string;
    mobileNumber: string;
    section: string;
    facultyAdvisor: string;
    profilePhotoUrl?: string;
}

// ---- Award #2: Best Undergraduate Researcher ----
export interface ResearchEntry {
    id: string;
    title: string;
    journalOrConference: string;
    indexStatus: 'scopus' | 'sci' | 'ugc' | 'other' | 'none';
    publicationStatus: 'filed' | 'published' | 'granted' | 'under_review';
    link: string;
}

export interface PatentEntry {
    id: string;
    title: string;
    patentNumber: string;
    status: 'filed' | 'granted';
    proofLink: string;
}

export interface ResearcherApplication {
    personalDetails: BasePersonalDetails;
    papers: ResearchEntry[];
    patents: PatentEntry[];
    researchStatement: string;
    masterProofFolderUrl: string;
    consentGiven: boolean;
    submittedAt?: string;
}

// ---- Award #3: Hackathon/Ideathon Prize Winner ----
export interface HackathonWinEntry {
    id: string;
    eventName: string;
    level: 'state' | 'national';
    position: string; // 1st, 2nd, 3rd, Finalist
    teamSize: number;
    projectBuilt: string;
    proofLink: string;
}

export interface HackathonWinnerApplication {
    personalDetails: BasePersonalDetails;
    wins: HackathonWinEntry[];
    masterProofFolderUrl: string;
    consentGiven: boolean;
    submittedAt?: string;
}

// ---- Award #4: Sports Prize Winner ----
export interface SportsWinEntry {
    id: string;
    sportOrEvent: string;
    level: 'state' | 'national';
    position: string;
    proofLink: string;
}

export interface SportsWinnerApplication {
    personalDetails: BasePersonalDetails;
    wins: SportsWinEntry[];
    masterProofFolderUrl: string;
    consentGiven: boolean;
    submittedAt?: string;
}

// ---- Award #5: Best NSS/NCC/Membership Participant ----
export interface NssNccApplication {
    personalDetails: BasePersonalDetails;
    organization: string; // NSS, NCC, or other
    otherOrganization?: string;
    role: string;
    totalHoursServed: number;
    eventsOrganized: string;
    impactDescription: string;
    proofLink: string;
    masterProofFolderUrl: string;
    consentGiven: boolean;
    submittedAt?: string;
}

// ---- Award #6: Best Departmental Contributor ----
export interface DeptContributionEntry {
    id: string;
    activityType: string; // Magazine, ECE Association, Raueecci, Other
    role: string;
    eventName: string;
    contributionDescription: string;
    proofLink: string;
}

export interface DeptContributorApplication {
    personalDetails: BasePersonalDetails;
    contributions: DeptContributionEntry[];
    masterProofFolderUrl: string;
    consentGiven: boolean;
    submittedAt?: string;
}

// ---- Award #7: Highest Salary Package ----
export interface HighestSalaryApplication {
    personalDetails: BasePersonalDetails;
    companyName: string;
    jobRole: string;
    ctcLpa: number;
    offerLetterLink: string;
    consentGiven: boolean;
    submittedAt?: string;
}

// ---- Award #8: Highest Salary in Core Company ----
export interface CoreSalaryApplication {
    personalDetails: BasePersonalDetails;
    companyName: string;
    jobRole: string;
    ctcLpa: number;
    coreDomain: string;
    offerLetterLink: string;
    coreDomainProofLink: string;
    consentGiven: boolean;
    submittedAt?: string;
}

// ---- Award #9: Best Student for Academic Excellence ----
export interface AcademicExcellenceApplication {
    personalDetails: BasePersonalDetails;
    cgpa: number;
    gradeSheetLink: string;
    consentGiven: boolean;
    submittedAt?: string;
}

// ---- Union type for all award applications ----
export type AwardApplication =
    | ResearcherApplication
    | HackathonWinnerApplication
    | SportsWinnerApplication
    | NssNccApplication
    | DeptContributorApplication
    | HighestSalaryApplication
    | CoreSalaryApplication
    | AcademicExcellenceApplication;
