// ===== AWARD CATEGORY DEFINITIONS =====

export type AwardSlug =
    | 'best-outgoing'
    | 'academic-excellence'
    | 'researcher'
    | 'hackathon'
    | 'sports'
    | 'nss-ncc'
    | 'dept-contribution'
    | 'highest-salary'
    | 'core-salary';

export interface AwardCategory {
    slug: AwardSlug;
    title: string;
    shortTitle: string;
    description: string;
    sheetName: string;
    icon: string; // Lucide icon name
    color: string; // Accent color
}

export const AWARD_CATEGORIES: AwardCategory[] = [
    {
        slug: 'best-outgoing',
        title: 'Best Outgoing Student',
        shortTitle: 'Best Outgoing',
        description: 'CGPA, publications, hackathons, internships, extracurricular, funded projects, placements, memberships & special achievements.',
        sheetName: 'BO_Main',
        icon: 'GraduationCap',
        color: '#034DA1',
    },
    {
        slug: 'academic-excellence',
        title: 'Best Student for Academic Excellence',
        shortTitle: 'Academic Excellence',
        description: 'Programme-wise award for the student with the highest overall CGPA.',
        sheetName: 'Academic_Excellence',
        icon: 'Star',
        color: '#D97706',
    },
    {
        slug: 'researcher',
        title: 'Best Undergraduate Researcher',
        shortTitle: 'Researcher',
        description: 'Paper publications, patents, and research contributions during undergraduate studies.',
        sheetName: 'Researcher',
        icon: 'BookOpen',
        color: '#7C3AED',
    },
    {
        slug: 'hackathon',
        title: 'Prize Winner — Hackathon/Ideathon',
        shortTitle: 'Hackathon Winner',
        description: 'Prize-winning performances in State or National level hackathons and ideathons.',
        sheetName: 'Hackathon_Winners',
        icon: 'Trophy',
        color: '#F59E0B',
    },
    {
        slug: 'sports',
        title: 'Prize Winner — State/National Sports',
        shortTitle: 'Sports Winner',
        description: 'Prize-winning achievements in State or National level sports events.',
        sheetName: 'Sports_Winners',
        icon: 'Medal',
        color: '#EF4444',
    },
    {
        slug: 'nss-ncc',
        title: 'Best NSS/NCC/Membership Participant',
        shortTitle: 'NSS/NCC',
        description: 'Active and impactful participation in NSS, NCC, or similar membership organizations.',
        sheetName: 'NSS_NCC',
        icon: 'Heart',
        color: '#10B981',
    },
    {
        slug: 'dept-contribution',
        title: 'Best Departmental Contributor',
        shortTitle: 'Dept Contributor',
        description: 'Contributions to departmental activities — Magazine, ECE Association, Raueecci, etc.',
        sheetName: 'Dept_Contributions',
        icon: 'Users',
        color: '#3B82F6',
    },
    {
        slug: 'highest-salary',
        title: 'Highest Salary Package',
        shortTitle: 'Highest Salary',
        description: 'Certificate for the student with the highest salary package (any company).',
        sheetName: 'Highest_Salary',
        icon: 'TrendingUp',
        color: '#14B8A6',
    },
    {
        slug: 'core-salary',
        title: 'Highest Salary — Core Company',
        shortTitle: 'Core Salary',
        description: 'Certificate for the student with the highest salary package in a core (domain-relevant) company.',
        sheetName: 'Highest_Core_Salary',
        icon: 'Briefcase',
        color: '#8B5CF6',
    },
];

export function getAwardBySlug(slug: string): AwardCategory | undefined {
    return AWARD_CATEGORIES.find(a => a.slug === slug);
}

export function getAwardBySheet(sheetName: string): AwardCategory | undefined {
    return AWARD_CATEGORIES.find(a => a.sheetName === sheetName);
}
