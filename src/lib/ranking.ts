import { StudentApplication, RankedStudent, RankingWeights } from './types';

// Default Ranking Weights (out of 100)
export const DEFAULT_WEIGHTS: RankingWeights = {
    cgpa: 20,
    internships: 10,
    projects: 10,
    hackathons: 8,
    research: 12,
    entrepreneurship: 8,
    certifications: 5,
    competitiveExams: 5,
    sportsOrCultural: 5,
    volunteering: 5,
    scholarships: 4,
    clubActivities: 4,
    departmentContributions: 2,
    references: 2,
};

function scoreCGPA(cgpa: number): number {
    // Max CGPA is 10, normalize to 0-1
    return Math.min(cgpa / 10, 1);
}

function scoreListItems(items: unknown[], maxItems: number = 5): number {
    // Diminishing returns: first items worth more
    const count = Math.min(items.length, maxItems);
    return count / maxItems;
}

function scoreResearch(items: { indexStatus: string; publicationStatus: string }[]): number {
    if (items.length === 0) return 0;
    let totalScore = 0;
    const maxItems = 5;
    for (let i = 0; i < Math.min(items.length, maxItems); i++) {
        let itemScore = 0.5; // base
        const item = items[i];
        // Index bonus
        if (item.indexStatus === 'scopus') itemScore += 0.3;
        else if (item.indexStatus === 'sci') itemScore += 0.4;
        else if (item.indexStatus === 'ugc') itemScore += 0.2;
        // Publication status bonus
        if (item.publicationStatus === 'published') itemScore += 0.2;
        else if (item.publicationStatus === 'granted') itemScore += 0.3;
        totalScore += Math.min(itemScore, 1);
    }
    return totalScore / maxItems;
}

function scoreSportsOrCultural(items: { level: string }[]): number {
    if (items.length === 0) return 0;
    let totalScore = 0;
    const maxItems = 5;
    const levelMultiplier: Record<string, number> = {
        zone: 0.4,
        district: 0.6,
        state: 0.75,
        national: 0.9,
        international: 1.0,
    };
    for (let i = 0; i < Math.min(items.length, maxItems); i++) {
        totalScore += levelMultiplier[items[i].level] || 0.3;
    }
    return totalScore / maxItems;
}

export function calculateScore(
    student: StudentApplication,
    weights: RankingWeights = DEFAULT_WEIGHTS
): { totalScore: number; breakdown: Record<string, number> } {
    const breakdown: Record<string, number> = {};

    // CGPA
    breakdown.cgpa = scoreCGPA(student.academicRecord.cgpa) * weights.cgpa;
    if (student.academicRecord.historyOfArrears) {
        breakdown.cgpa *= 0.85; // 15% penalty for arrears
    }

    // List-based scores
    breakdown.internships = scoreListItems(student.internships) * weights.internships;
    breakdown.projects = scoreListItems(student.projects) * weights.projects;
    breakdown.hackathons = scoreListItems(student.hackathons) * weights.hackathons;
    breakdown.research = scoreResearch(student.research) * weights.research;
    breakdown.entrepreneurship = scoreListItems(student.entrepreneurship, 3) * weights.entrepreneurship;
    breakdown.certifications = scoreListItems(student.certifications) * weights.certifications;
    breakdown.competitiveExams = scoreListItems(student.competitiveExams, 3) * weights.competitiveExams;
    breakdown.sportsOrCultural = scoreSportsOrCultural(student.sportsOrCultural) * weights.sportsOrCultural;
    breakdown.volunteering = scoreListItems(student.volunteering) * weights.volunteering;
    breakdown.scholarships = scoreListItems(student.scholarships, 3) * weights.scholarships;
    breakdown.clubActivities = scoreListItems(student.clubActivities) * weights.clubActivities;
    breakdown.departmentContributions = scoreListItems(student.departmentContributions) * weights.departmentContributions;
    breakdown.references = scoreListItems(student.references, 3) * weights.references;

    // Total
    const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    // Round all values
    for (const key in breakdown) {
        breakdown[key] = Math.round(breakdown[key] * 100) / 100;
    }

    return { totalScore: Math.round(totalScore * 100) / 100, breakdown };
}

export function rankStudents(
    students: StudentApplication[],
    weights: RankingWeights = DEFAULT_WEIGHTS
): RankedStudent[] {
    return students
        .map((student) => {
            const { totalScore, breakdown } = calculateScore(student, weights);
            return {
                registerNumber: student.personalDetails.registerNumber,
                name: student.personalDetails.name,
                department: student.personalDetails.department,
                totalScore,
                breakdown,
            };
        })
        .sort((a, b) => b.totalScore - a.totalScore);
}
