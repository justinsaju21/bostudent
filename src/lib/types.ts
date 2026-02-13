// ===== BEST OUTGOING STUDENT - TYPE DEFINITIONS =====

// ---- Personal Details ----
export interface PersonalDetails {
    name: string;
    registerNumber: string;
    department: string;
    specialization: string;
    personalEmail: string;
    srmEmail: string;
    mobileNumber: string;
    profilePhotoUrl?: string;
}

// ---- Academic Record ----
export interface AcademicRecord {
    cgpa: number;
    tenthPercentage: number;
    twelfthPercentage: number;
    historyOfArrears: boolean;
    numberOfArrears?: number;
}

// ---- Post-College Status ----
export interface PostCollegeStatus {
    status: 'placed' | 'higher_studies' | 'entrepreneur' | 'other';
    placedCompany?: string;
    offerLetterLink?: string;
    universityName?: string;
    admitCardLink?: string;
    otherDetails?: string;
}

// ---- Internship ----
export interface Internship {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    certificateLink: string;
    description?: string;
}

// ---- Project ----
export interface Project {
    id: string;
    title: string;
    description: string;
    techStack: string;
    githubLink?: string;
    deployedLink?: string;
    proofLink?: string;
}

// ---- Hackathon ----
export interface Hackathon {
    id: string;
    name: string;
    projectBuilt: string;
    teamSize: number;
    position: string;
    proofLink?: string;
}

// ---- Research / Paper / Patent ----
export interface Research {
    id: string;
    title: string;
    journalOrConference: string;
    indexStatus: 'scopus' | 'sci' | 'ugc' | 'other' | 'none';
    publicationStatus: 'filed' | 'published' | 'granted' | 'under_review';
    link?: string;
}

// ---- Entrepreneurship ----
export interface Entrepreneurship {
    id: string;
    startupName: string;
    registrationDetails?: string;
    revenueOrFundingStatus?: string;
    description?: string;
    proofLink?: string;
}

// ---- Global Certification ----
export interface Certification {
    id: string;
    provider: string;
    certificateName: string;
    validationId?: string;
    proofLink?: string;
}

// ---- Competitive Exam ----
export interface CompetitiveExam {
    id: string;
    examName: string;
    scoreOrRank: string;
    proofLink?: string;
}

// ---- Sports / Cultural ----
export interface SportsOrCultural {
    id: string;
    eventName: string;
    level: 'zone' | 'district' | 'state' | 'national' | 'international';
    positionWon: string;
    proofLink?: string;
}

// ---- Volunteering / Social Service ----
export interface Volunteering {
    id: string;
    organization: string;
    role: string;
    hoursServed?: number;
    impact?: string;
    proofLink?: string;
}

// ---- Scholarship ----
export interface Scholarship {
    id: string;
    name: string;
    awardingBody: string;
    amountOrPrestige?: string;
    proofLink?: string;
}

// ---- Club / Leadership ----
export interface ClubActivity {
    id: string;
    clubName: string;
    position: string;
    keyEventsOrganized?: string;
    impactDescription?: string;
    proofLink?: string;
}

// ---- Department Contribution ----
export interface DepartmentContribution {
    id: string;
    eventName: string;
    role: string;
    contributionDescription?: string;
    proofLink?: string;
}

// ---- Reference ----
export interface Reference {
    id: string;
    facultyName: string;
    contact: string;
    lorLink?: string;
}

// ---- Social Media ----
export interface SocialMedia {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
    others?: { platform: string; url: string }[];
}

// ---- Future Goal ----
export interface FutureGoal {
    description: string;
}

// ===== FULL STUDENT APPLICATION =====
export interface StudentApplication {
    personalDetails: PersonalDetails;
    academicRecord: AcademicRecord;
    postCollegeStatus: PostCollegeStatus;
    internships: Internship[];
    projects: Project[];
    hackathons: Hackathon[];
    research: Research[];
    entrepreneurship: Entrepreneurship[];
    certifications: Certification[];
    competitiveExams: CompetitiveExam[];
    sportsOrCultural: SportsOrCultural[];
    volunteering: Volunteering[];
    scholarships: Scholarship[];
    clubActivities: ClubActivity[];
    departmentContributions: DepartmentContribution[];
    references: Reference[];
    socialMedia: SocialMedia;
    futureGoal: FutureGoal;
    videoPitchUrl: string;
    masterProofFolderUrl?: string;
    consentGiven: boolean;
    submittedAt?: string;
}

// ===== RANKING =====
export interface RankingWeights {
    cgpa: number;
    internships: number;
    projects: number;
    hackathons: number;
    research: number;
    entrepreneurship: number;
    certifications: number;
    competitiveExams: number;
    sportsOrCultural: number;
    volunteering: number;
    scholarships: number;
    clubActivities: number;
    departmentContributions: number;
    references: number;
}

export interface RankedStudent {
    registerNumber: string;
    name: string;
    department: string;
    totalScore: number;
    breakdown: Record<string, number>;
}
