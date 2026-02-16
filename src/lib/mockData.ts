import { StudentApplication } from './types';

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DEPARTMENTS = ['Electronics and Communication Engineering'];
const SPECIALIZATIONS = ['Wireless Communication', 'VLSI Design', 'Embedded Systems', 'Robotics'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const FULL_NAMES = [
    'Aarav Patel', 'Vihaan Rao', 'Aditya Kumar', 'Sai Krishna', 'Rahul Sharma',
    'Ishaan Gupta', 'Reyansh Singh', 'Arjun Reddy', 'Vivaan Joshi', 'Ayan Mehta',
    'Ananya Verma', 'Diya Nair', 'Saanvi Iyer', 'Aadhya Menon', 'Kiara Shah',
    'Myra Choudhury', 'Pari Agarwal', 'Riya Malhotra', 'Anvi Saxena', 'Prisha Bhatt'
];
const COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Zoho', 'Freshworks', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant'];
const ADVISORS = ['Dr. Smitha', 'Prof. Rajesh', 'Dr. Anjali', 'Prof. Kumar', 'Dr. Venkatesh'];

export function generateMockStudents(count: number): StudentApplication[] {
    const students: StudentApplication[] = [];

    for (let i = 0; i < count; i++) {
        const regNo = `RA211100301${(1000 + i).toString().slice(1)}`;
        const name = `${randomChoice(FULL_NAMES)} ${i}`;
        const dept = randomChoice(DEPARTMENTS);

        const app: StudentApplication = {
            personalDetails: {
                name,
                registerNumber: regNo,
                department: dept,
                section: randomChoice(SECTIONS),
                facultyAdvisor: randomChoice(ADVISORS),
                specialization: 'Core',
                personalEmail: `student${i}@gmail.com`,
                srmEmail: `${regNo.toLowerCase()}@srmist.edu.in`,
                mobileNumber: `98765${randomInt(10000, 99999)}`,
                profilePhotoUrl: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`
            },
            academicRecord: {
                cgpa: parseFloat((randomInt(60, 100) / 10).toFixed(2)),
                tenthPercentage: randomInt(70, 99),
                twelfthPercentage: randomInt(70, 99),
                historyOfArrears: Math.random() > 0.8,
                numberOfArrears: Math.random() > 0.8 ? randomInt(1, 3) : 0
            },
            postCollegeStatus: {
                status: randomChoice(['placed', 'higher_studies', 'entrepreneur', 'unplaced']) as any,
                placedCompany: Math.random() > 0.5 ? randomChoice(COMPANIES) : undefined
            },
            internships: Array(randomInt(0, 3)).fill(null).map((_, idx) => ({
                id: `int-${idx}`,
                company: randomChoice(COMPANIES),
                role: 'Intern',
                startDate: '2023-01-01',
                endDate: '2023-03-01',
                certificateLink: 'https://example.com/cert.pdf'
            })),
            projects: Array(randomInt(1, 4)).fill(null).map((_, idx) => ({
                id: `proj-${idx}`,
                title: `Project ${idx + 1}`,
                techStack: 'React, Node.js',
                description: 'A mock project description.'
            })),
            hackathons: [],
            research: [],
            entrepreneurship: [],
            certifications: [],
            competitiveExams: [],
            sportsOrCultural: [],
            volunteering: [],
            scholarships: [],
            clubActivities: [],
            departmentContributions: [],
            professionalMemberships: [],
            references: [],
            socialMedia: {},
            futureGoal: { description: 'To be a successful engineer.' },
            videoPitchUrl: 'https://youtube.com/watch?v=example',
            consentGiven: true,
            submittedAt: new Date().toISOString()
        };
        students.push(app);
    }
    return students;
}
