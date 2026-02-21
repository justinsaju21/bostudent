import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            process.env[key] = value;
        }
    });
}

const mockStudents = [
    {
        personalDetails: {
            name: "John Doe",
            registerNumber: "RA2111000010001",
            department: "Computer Science",
            specialization: "Core",
            section: "A",
            facultyAdvisor: "Dr. Smith",
            personalEmail: "john@example.com",
            srmEmail: "jd1234@srmist.edu.in",
            mobileNumber: "9876543210",
            profilePhotoUrl: "https://example.com/photo1.jpg"
        },
        academicRecord: {
            cgpa: 9.5,
            tenthPercentage: 95,
            twelfthPercentage: 96,
            historyOfArrears: false
        },
        postCollegeStatus: {
            status: "placed",
            placedCompany: "Google",
            offerLetterLink: "https://example.com/offer1.pdf"
        },
        internships: [
            { id: "1", company: "Microsoft", role: "SDE Intern", startDate: "2023-05-01", endDate: "2023-07-31", certificateLink: "https://example.com/cert1.pdf" }
        ],
        projects: [
            { id: "1", title: "AI Assistant", description: "Built an AI assistant", techStack: "Python, React", githubLink: "https://github.com/johndoe/project" }
        ],
        hackathons: [], research: [], entrepreneurship: [], certifications: [], competitiveExams: [], sportsOrCultural: [], volunteering: [], scholarships: [], clubActivities: [], departmentContributions: [], professionalMemberships: [], references: [],
        socialMedia: { linkedin: "https://linkedin.com/in/johndoe", github: "https://github.com/johndoe" },
        futureGoal: { description: "Become a top-tier software engineer." },
        videoPitchUrl: "https://youtube.com/watch?v=123",
        masterProofFolderUrl: "https://drive.google.com/folder/123",
        consentGiven: true,
        termsAccepted: true,
        submittedAt: new Date().toISOString()
    },
    {
        personalDetails: {
            name: "Jane Smith",
            registerNumber: "RA2111000010002",
            department: "Electrical Engineering",
            specialization: "VLSI",
            section: "B",
            facultyAdvisor: "Dr. Jones",
            personalEmail: "jane@example.com",
            srmEmail: "js5678@srmist.edu.in",
            mobileNumber: "9876543211",
            profilePhotoUrl: "https://example.com/photo2.jpg"
        },
        academicRecord: {
            cgpa: 8.8,
            tenthPercentage: 92,
            twelfthPercentage: 90,
            historyOfArrears: false
        },
        postCollegeStatus: { status: "higher_studies", universityName: "MIT", admitCardLink: "https://example.com/admit1.pdf" },
        internships: [],
        projects: [
            { id: "2", title: "IoT Smart Home", description: "Developed an IoT system", techStack: "C++, Arduino", githubLink: "https://github.com/janesmith/iot" }
        ],
        hackathons: [
            { id: "1", name: "Hack Harvard", projectBuilt: "EcoTracker", teamSize: 4, position: "Winner", proofLink: "https://example.com/win" }
        ],
        research: [], entrepreneurship: [], certifications: [], competitiveExams: [], sportsOrCultural: [], volunteering: [], scholarships: [], clubActivities: [], departmentContributions: [], professionalMemberships: [], references: [],
        socialMedia: { linkedin: "https://linkedin.com/in/janesmith" },
        futureGoal: { description: "Pioneer new microchip designs." },
        videoPitchUrl: "https://youtube.com/watch?v=456",
        masterProofFolderUrl: "https://drive.google.com/folder/456",
        consentGiven: true,
        termsAccepted: true,
        submittedAt: new Date().toISOString()
    }
];

function applicationToRow(app: any) {
    const summarize = (arr: any[]) => arr ? arr.map((i: any, idx) => `${idx + 1}. ${i.title || i.company || i.name}`).join('\n') : 'None';
    return [
        app.personalDetails.name, app.personalDetails.registerNumber, app.personalDetails.department, app.personalDetails.specialization,
        app.personalDetails.section, app.personalDetails.facultyAdvisor, app.personalDetails.personalEmail, app.personalDetails.srmEmail,
        app.personalDetails.mobileNumber, app.personalDetails.profilePhotoUrl, String(app.academicRecord.cgpa), String(app.academicRecord.tenthPercentage),
        String(app.academicRecord.twelfthPercentage), app.academicRecord.historyOfArrears ? 'Yes' : 'No', app.postCollegeStatus.status,
        app.postCollegeStatus.placedCompany || app.postCollegeStatus.universityName || 'Other',
        summarize(app.internships), summarize(app.projects), summarize(app.hackathons), 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None',
        `LinkedIn: ${app.socialMedia.linkedin}`, app.futureGoal.description, app.videoPitchUrl, app.masterProofFolderUrl, app.submittedAt,
        '', 'FALSE', '[]', JSON.stringify(app)
    ];
}

async function main() {
    console.log('🌱 Seeding BO_Main Database...');
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Convert to Row Array
    const rows = mockStudents.map(applicationToRow);

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID!,
            range: 'BO_Main!A:AZ',
            valueInputOption: 'RAW',
            requestBody: { values: rows }
        });

        // Seed some custom awards 
        const customRows = [
            ['RA2111000010001', '85', 'TRUE', '["1::2"]'],
            ['RA2111000010002', '92', 'FALSE', '[]']
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID!,
            range: 'bo_research!A:D',
            valueInputOption: 'RAW',
            requestBody: { values: customRows }
        });

        console.log('✅ Seeding complete!');
    } catch (e) {
        console.error('❌ Failed to seed:', e);
    }
}

main();
