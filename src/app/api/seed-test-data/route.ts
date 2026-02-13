import { NextResponse } from 'next/server';
import { appendStudent } from '@/lib/googleSheets';
import { StudentApplication } from '@/lib/types';
import { generateId } from '@/lib/utils'; // Assuming this utility exists, or I'll use a simple UUID generator

// Simple UUID generator if needed
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const MOCK_STUDENTS: StudentApplication[] = [
    {
        personalDetails: {
            name: "Alice Researcher",
            registerNumber: "RA2111003011001",
            department: "CSE",
            specialization: "AI/ML",
            personalEmail: "alice@example.com",
            srmEmail: "alice@srmist.edu.in",
            mobileNumber: "9876543210",
            profilePhotoUrl: "https://ui-avatars.com/api/?name=Alice+Researcher"
        },
        academicRecord: {
            cgpa: 9.8,
            tenthPercentage: 95,
            twelfthPercentage: 94,
            historyOfArrears: false
        },
        postCollegeStatus: {
            status: "higher_studies",
            universityName: "Stanford University",
            otherDetails: "Accepted for MS CS"
        },
        internships: [
            {
                id: uuid(),
                company: "Google Research",
                role: "Research Intern",
                startDate: "2024-05-01",
                endDate: "2024-07-31",
                certificateLink: "https://example.com/cert",
                description: "Worked on LLM optimization."
            }
        ],
        projects: [
            {
                id: uuid(),
                title: "AI Cancer Detection",
                techStack: "Python, PyTorch",
                description: "Detecting early stage cancer using MRI scans.",
                githubLink: "https://github.com/alice/cancer-detect"
            }
        ],
        hackathons: [],
        research: [
            {
                id: uuid(),
                title: "Novel Transformer Architectures",
                journalOrConference: "NeurIPS 2024",
                indexStatus: "scopus",
                publicationStatus: "published",
                link: "https://doi.org/..."
            },
            {
                id: uuid(),
                title: "Efficient Attention Mechanisms",
                journalOrConference: "ICLR 2025",
                indexStatus: "sci",
                publicationStatus: "under_review"
            }
        ],
        entrepreneurship: [],
        certifications: [],
        competitiveExams: [
            {
                id: uuid(),
                examName: "GRE",
                scoreOrRank: "335/340"
            }
        ],
        sportsOrCultural: [],
        volunteering: [],
        scholarships: [],
        clubActivities: [],
        departmentContributions: [],
        references: [],
        socialMedia: {
            linkedin: "linkedin.com/in/alice",
            github: "github.com/alice"
        },
        futureGoal: { description: "Become a leading AI researcher." },
        videoPitchUrl: "https://youtube.com/watch?v=alice",
        consentGiven: true,
        submittedAt: new Date().toISOString()
    },
    {
        personalDetails: {
            name: "Bob Hacker",
            registerNumber: "RA2111003011002",
            department: "IT",
            specialization: "Cloud Computing",
            personalEmail: "bob@example.com",
            srmEmail: "bob@srmist.edu.in",
            mobileNumber: "9876543211",
            profilePhotoUrl: "https://ui-avatars.com/api/?name=Bob+Hacker"
        },
        academicRecord: {
            cgpa: 8.5,
            tenthPercentage: 90,
            twelfthPercentage: 88,
            historyOfArrears: false
        },
        postCollegeStatus: {
            status: "placed",
            placedCompany: "Juspay",
            otherDetails: "Full Stack role"
        },
        internships: [
            {
                id: uuid(),
                company: "Juspay",
                role: "SDE Intern",
                startDate: "2024-01-01",
                endDate: "2024-06-30",
                certificateLink: "https://example.com/cert"
            },
            {
                id: uuid(),
                company: "Zoho",
                role: "Web Developer",
                startDate: "2023-05-01",
                endDate: "2023-07-31",
                certificateLink: "https://example.com/cert"
            }
        ],
        projects: [
            {
                id: uuid(),
                title: "Decentralized Voting",
                techStack: "Solidity, React",
                description: "Blockchain based voting system."
            },
            {
                id: uuid(),
                title: "Realtime Chat App",
                techStack: "Node.js, Socket.io",
                description: "Scalable chat application."
            }
        ],
        hackathons: [
            {
                id: uuid(),
                name: "Smart India Hackathon",
                projectBuilt: "Smart Grid",
                teamSize: 6,
                position: "Winner"
            },
            {
                id: uuid(),
                name: "HackHarvard",
                projectBuilt: "EdTech Tool",
                teamSize: 4,
                position: "Finalist"
            }
        ],
        research: [],
        entrepreneurship: [],
        certifications: [
            {
                id: uuid(),
                provider: "AWS",
                certificateName: "Solutions Architect Associate"
            }
        ],
        competitiveExams: [],
        sportsOrCultural: [],
        volunteering: [],
        scholarships: [],
        clubActivities: [
            {
                id: uuid(),
                clubName: "DSC",
                position: "Technical Lead"
            }
        ],
        departmentContributions: [],
        references: [],
        socialMedia: {
            github: "github.com/bob",
            twitter: "x.com/bob"
        },
        futureGoal: { description: "Build scalable systems." },
        videoPitchUrl: "https://youtube.com/watch?v=bob",
        consentGiven: true,
        submittedAt: new Date().toISOString()
    },
    {
        personalDetails: {
            name: "Charlie Sportstar",
            registerNumber: "RA2111003011003",
            department: "ECE",
            specialization: "VLSI",
            personalEmail: "charlie@example.com",
            srmEmail: "charlie@srmist.edu.in",
            mobileNumber: "9876543212",
            profilePhotoUrl: "https://ui-avatars.com/api/?name=Charlie+S"
        },
        academicRecord: {
            cgpa: 7.9,
            tenthPercentage: 85,
            twelfthPercentage: 80,
            historyOfArrears: true,
            numberOfArrears: 1
        },
        postCollegeStatus: {
            status: "entrepreneur",
            otherDetails: "Starting a sports academy"
        },
        internships: [],
        projects: [],
        hackathons: [],
        research: [],
        entrepreneurship: [
            {
                id: uuid(),
                startupName: "FitPro",
                revenueOrFundingStatus: "Pre-revenue",
                description: "AI personal trainer app."
            }
        ],
        certifications: [],
        competitiveExams: [],
        sportsOrCultural: [
            {
                id: uuid(),
                eventName: "National Badminton Championship",
                level: "national",
                positionWon: "Silver Medal"
            },
            {
                id: uuid(),
                eventName: "Inter-University Cricket",
                level: "state",
                positionWon: "Captain"
            }
        ],
        volunteering: [
            {
                id: uuid(),
                organization: "NSS",
                role: "Volunteer",
                hoursServed: 100
            }
        ],
        scholarships: [
            {
                id: uuid(),
                name: "Sports Quota Scholarship",
                awardingBody: "SRMIST"
            }
        ],
        clubActivities: [],
        departmentContributions: [],
        references: [],
        socialMedia: {
            instagram: "instagram.com/charlie"
        },
        futureGoal: { description: "Promote sports in India." },
        videoPitchUrl: "https://youtube.com/watch?v=charlie",
        consentGiven: true,
        submittedAt: new Date().toISOString()
    }
];

export async function GET() {
    try {
        let count = 0;
        for (const student of MOCK_STUDENTS) {
            await appendStudent(student);
            count++;
        }
        return NextResponse.json({ success: true, message: `Seeded ${count} students.` });
    } catch (error) {
        console.error("Seeding failed:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
