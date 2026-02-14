import { NextRequest, NextResponse } from 'next/server';
import { clearAllStudents, addStudentsBatch } from '@/lib/googleSheets';
import { StudentApplication } from '@/lib/types';

// Simple UUID generator
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const DEPARTMENTS = ["Electronics and Communication Engineering"];
const SECTIONS = ["A", "B", "C", "D", "E", "F"];
const ADVISORS = ["Dr. Ramesh Kumar", "Dr. Priya Sharma", "Prof. Lakshmi Narayanan", "Dr. A. Smith", "Prof. R. Johnson"];
const SPECIALIZATIONS = ["VLSI Design", "Embedded Systems", "Communication Systems", "Signal Processing", "Robotics & Automation"];

const PROFESSIONAL_ORGS = [
    { name: "IEEE", role: "Student Member" },
    { name: "ACM", role: "Ambassador" },
    { name: "IETE", role: "Contributor" },
    { name: "CSI", role: "Member" },
    { name: "Optica", role: "Chapter Head" }
];

const COMPANIES = ["Texas Instruments", "Intel", "Qualcomm", "NVIDIA", "Qualcomm", "Analog Devices", "Samsung", "Google", "Microsoft", "TCS", "Infosys"];

function generateRealisticStudent(index: number): StudentApplication {
    const firstName = ["Arjun", "Neha", "Rohan", "Sanya", "Vikram", "Anjali", "Kabir", "Ishita", "Aditya", "Meera", "Siddharth", "Pooja", "Varun", "Kavya", "Akash", "Riya", "Karan", "Tanvi", "Nikhil", "Zoya"][index];
    const lastName = ["Sharma", "Verma", "Iyer", "Nair", "Gupta", "Malhotra", "Reddy", "Patel", "Singh", "Das", "Joshi", "Kulkarni", "Chopra", "Bose", "Menon", "Kapoor", "Khan", "Deshmukh", "Pillai", "Aggarwal"][index];
    const name = `${firstName} ${lastName}`;
    const regNo = `RA2211053010${(100 + index).toString()}`;
    const cgpa = 7.5 + (Math.random() * 2.4); // 7.5 to 9.9

    const student: StudentApplication = {
        personalDetails: {
            name,
            registerNumber: regNo,
            department: DEPARTMENTS[0],
            specialization: SPECIALIZATIONS[index % SPECIALIZATIONS.length],
            personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            srmEmail: `${firstName[0].toLowerCase()}${lastName.toLowerCase()}@srmist.edu.in`,
            mobileNumber: `9840${Math.floor(100000 + Math.random() * 899999)}`,
            facultyAdvisor: ADVISORS[index % ADVISORS.length],
            section: SECTIONS[index % SECTIONS.length],
            profilePhotoUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff&size=128`
        },
        academicRecord: {
            cgpa: parseFloat(cgpa.toFixed(2)),
            tenthPercentage: 85 + Math.floor(Math.random() * 14),
            twelfthPercentage: 82 + Math.floor(Math.random() * 16),
            historyOfArrears: false,
        },
        postCollegeStatus: {
            status: Math.random() > 0.4 ? "placed" : "higher_studies",
            placedCompany: Math.random() > 0.4 ? COMPANIES[index % COMPANIES.length] : undefined,
            universityName: Math.random() > 0.7 ? "SRM University" : undefined
        },
        internships: index % 2 === 0 ? [{
            id: uuid(),
            company: COMPANIES[index % COMPANIES.length],
            role: "Engineering Intern",
            startDate: "2024-05-01",
            endDate: "2024-07-31",
            certificateLink: "https://drive.google.com/cert-example",
            description: "Developed hardware modules for signal processing."
        }] : [],
        projects: [{
            id: uuid(),
            title: `${["Smart City", "Grid Monitor", "Health AI", "Traffic Control", "AgriBot"][index % 5]}`,
            techStack: "Arduino, IoT, Node.js",
            description: "A comprehensive project leveraging IoT and embedded systems for automation.",
            githubLink: "https://github.com/example/project"
        }],
        hackathons: index % 3 === 0 ? [{
            id: uuid(),
            name: "Smart India Hackathon",
            projectBuilt: "Disaster Management App",
            teamSize: 6,
            position: "Finalist"
        }] : [],
        research: index % 4 === 0 ? [{
            id: uuid(),
            title: `Analysis of ${["ML", "VLSI", "5G", "Robotics"][index % 4]} Architectures`,
            journalOrConference: "IEEE Xplore",
            indexStatus: "scopus",
            publicationStatus: "published"
        }] : [],
        entrepreneurship: [],
        certifications: [{
            id: uuid(),
            provider: "Coursera",
            certificateName: "Digital VLSI Design",
            proofLink: "https://coursera.org/verify/123"
        }],
        competitiveExams: [],
        sportsOrCultural: index % 5 === 0 ? [{
            id: uuid(),
            eventName: "Inter-University Sports Meet",
            level: "state",
            positionWon: "Gold Medal"
        }] : [],
        volunteering: [],
        scholarships: [],
        clubActivities: [{
            id: uuid(),
            clubName: "Technical Club",
            position: "Member"
        }],
        departmentContributions: [],
        professionalMemberships: [{
            id: uuid(),
            organization: PROFESSIONAL_ORGS[index % PROFESSIONAL_ORGS.length].name,
            role: PROFESSIONAL_ORGS[index % PROFESSIONAL_ORGS.length].role,
            membershipId: `MEM-${index}-2024`
        }],
        references: [{
            id: uuid(),
            facultyName: ADVISORS[(index + 1) % ADVISORS.length],
            contact: "faculty@srmist.edu.in"
        }],
        socialMedia: {
            linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`
        },
        futureGoal: { description: "To lead a research team in advanced communications." },
        videoPitchUrl: "https://youtube.com/watch?v=example",
        consentGiven: true,
        submittedAt: new Date().toISOString()
    };

    return student;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const clear = searchParams.get('clear') === 'true';

    try {
        if (clear) {
            console.log('Clearing existing students...');
            await clearAllStudents();
        }

        console.log('Generating 20 realistic students...');
        const students: StudentApplication[] = [];
        for (let i = 0; i < 20; i++) {
            students.push(generateRealisticStudent(i));
        }

        console.log('Batch inserting students...');
        await addStudentsBatch(students);

        return NextResponse.json({
            success: true,
            message: `Successfully ${clear ? 'cleared and ' : ''}seeded 20 realistic students.`
        });
    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to seed data',
            details: error?.message || String(error)
        }, { status: 500 });
    }
}
