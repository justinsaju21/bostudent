// API route to initialize/seed all award sheet tabs with headers and optional sample data
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { AWARD_CATEGORIES, AwardSlug } from '@/lib/awards';
import { appendAwardApplication } from '@/lib/awardSheets';

function getAuth() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!email || !key) throw new Error('Google Sheets credentials not configured.');
    return new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
}

function getSheetId(): string {
    const id = process.env.GOOGLE_SHEET_ID;
    if (!id) throw new Error('GOOGLE_SHEET_ID not set');
    return id;
}

// Headers for each award (matches awardSheets.ts getHeadersForAward)
function getHeadersForAward(slug: AwardSlug): string[] {
    const personal = ['Name', 'Register Number', 'Programme', 'Specialization', 'Personal Email', 'SRM Email', 'Mobile Number', 'Section', 'Faculty Advisor', 'Profile Photo URL'];
    switch (slug) {
        case 'best-outgoing':
            return []; // BO uses the existing BO_Main tab — skip
        case 'academic-excellence':
            return [...personal, 'CGPA', 'Grade Sheet Link', 'Submitted At', 'JSON_Full_Data'];
        case 'researcher':
            return [...personal, 'Papers (Summary)', 'Patents (Summary)', 'Research Statement', 'Master Proof Folder', 'Submitted At', 'JSON_Full_Data'];
        case 'hackathon':
            return [...personal, 'Wins (Summary)', 'Master Proof Folder', 'Submitted At', 'JSON_Full_Data'];
        case 'sports':
            return [...personal, 'Wins (Summary)', 'Master Proof Folder', 'Submitted At', 'JSON_Full_Data'];
        case 'nss-ncc':
            return [...personal, 'Organization', 'Role', 'Total Hours', 'Events Organized', 'Impact Description', 'Proof Link', 'Master Proof Folder', 'Submitted At', 'JSON_Full_Data'];
        case 'dept-contribution':
            return [...personal, 'Contributions (Summary)', 'Master Proof Folder', 'Submitted At', 'JSON_Full_Data'];
        case 'highest-salary':
            return [...personal, 'Company Name', 'Job Role', 'CTC (LPA)', 'Offer Letter Link', 'Submitted At', 'JSON_Full_Data'];
        case 'core-salary':
            return [...personal, 'Company Name', 'Job Role', 'CTC (LPA)', 'Core Domain', 'Offer Letter Link', 'Core Domain Proof', 'Submitted At', 'JSON_Full_Data'];
        default:
            return personal;
    }
}

// Sample data generators for each award
function sampleResearcher(i: number): Record<string, unknown> {
    const names = ['Aarav Sharma', 'Diya Verma', 'Ishaan Iyer', 'Kavya Nair'];
    return {
        personalDetails: {
            name: names[i % names.length], registerNumber: `RA2211053010${200 + i}`,
            department: 'B.Tech Electronics and Communication Engineering', specialization: 'Embedded Systems', personalEmail: `researcher${i}@example.com`,
            srmEmail: `res${i}@srmist.edu.in`, mobileNumber: `98401${100000 + i}`, section: 'A', facultyAdvisor: 'Dr. Ramesh Kumar',
            profilePhotoUrl: '',
        },
        papers: [
            { title: `Novel Approach to ${i % 2 === 0 ? 'VLSI Optimization' : 'IoT Security'}`, journalOrConference: 'IEEE Access', indexStatus: 'sci', publicationStatus: 'published', link: 'https://doi.org/example' },
            { title: `Deep Learning for ${i % 2 === 0 ? 'SAR Imaging' : 'Anomaly Detection'}`, journalOrConference: 'ICCC 2024', indexStatus: 'scopus', publicationStatus: 'under_review', link: '' },
        ],
        patents: i % 2 === 0 ? [{ title: 'Smart Sensor System', status: 'filed', patentNumber: '' }] : [],
        researchStatement: 'Passionate about interdisciplinary research combining hardware and AI.',
        masterProofFolderUrl: 'https://drive.google.com/proof-folder',
        consentGiven: true, submittedAt: new Date().toISOString(),
    };
}

function sampleHackathon(i: number): Record<string, unknown> {
    const names = ['Arjun Gupta', 'Sanya Malhotra', 'Rohan Reddy'];
    return {
        personalDetails: {
            name: names[i % names.length], registerNumber: `RA2211053010${300 + i}`,
            department: 'B.Tech Electronics and Communication Engineering', specialization: 'VLSI Design', personalEmail: `hack${i}@example.com`,
            srmEmail: `hack${i}@srmist.edu.in`, mobileNumber: `98402${100000 + i}`, section: 'B', facultyAdvisor: 'Dr. Priya Sharma',
            profilePhotoUrl: '',
        },
        wins: [
            { eventName: 'Smart India Hackathon', level: 'national', position: 'Winner', teamSize: 6, projectBuilt: 'AI Water Management', proofLink: 'https://drive.google.com/proof' },
            { eventName: 'HackMIT', level: 'international', position: 'Top 10', teamSize: 4, projectBuilt: 'Accessibility Tool', proofLink: '' },
        ],
        masterProofFolderUrl: 'https://drive.google.com/hackathon-proofs',
        consentGiven: true, submittedAt: new Date().toISOString(),
    };
}

function sampleSports(i: number): Record<string, unknown> {
    const names = ['Vikram Singh', 'Anjali Das'];
    return {
        personalDetails: {
            name: names[i % names.length], registerNumber: `RA2211053010${400 + i}`,
            department: 'B.Tech Electronics and Communication Engineering', specialization: 'Communication', personalEmail: `sports${i}@example.com`,
            srmEmail: `sp${i}@srmist.edu.in`, mobileNumber: `98403${100000 + i}`, section: 'C', facultyAdvisor: 'Prof. Lakshmi Narayanan',
            profilePhotoUrl: '',
        },
        wins: [
            { sportOrEvent: 'Table Tennis', level: 'state', position: 'Gold', proofLink: 'https://drive.google.com/proof-sports' },
        ],
        masterProofFolderUrl: '',
        consentGiven: true, submittedAt: new Date().toISOString(),
    };
}

function sampleNssNcc(i: number): Record<string, unknown> {
    const names = ['Meera Joshi', 'Kabir Kulkarni'];
    return {
        personalDetails: {
            name: names[i % names.length], registerNumber: `RA2211053010${500 + i}`,
            department: 'B.Tech Electronics and Communication Engineering', specialization: 'VLSI', personalEmail: `nss${i}@example.com`,
            srmEmail: `nss${i}@srmist.edu.in`, mobileNumber: `98404${100000 + i}`, section: 'D', facultyAdvisor: 'Dr. A. Smith',
            profilePhotoUrl: '',
        },
        organization: i % 2 === 0 ? 'NSS' : 'NCC',
        role: i % 2 === 0 ? 'Volunteer Lead' : 'Cadet Sergeant',
        totalHoursServed: 120 + i * 10,
        eventsOrganized: 'Blood Donation Camp, Tree Plantation Drive, Rural Awareness Program',
        impactDescription: 'Led camps serving 500+ community members across 3 districts.',
        proofLink: 'https://drive.google.com/nss-proof',
        masterProofFolderUrl: '',
        consentGiven: true, submittedAt: new Date().toISOString(),
    };
}

function sampleDeptContribution(i: number): Record<string, unknown> {
    const names = ['Pooja Chopra', 'Siddharth Bose'];
    return {
        personalDetails: {
            name: names[i % names.length], registerNumber: `RA2211053010${600 + i}`,
            department: 'B.Tech Electronics and Computer Engineering', specialization: 'N/A', personalEmail: `dept${i}@example.com`,
            srmEmail: `dept${i}@srmist.edu.in`, mobileNumber: `98405${100000 + i}`, section: 'E', facultyAdvisor: 'Prof. R. Johnson',
            profilePhotoUrl: '',
        },
        contributions: [
            { activityType: 'magazine', role: 'Editor', eventName: 'ECE Annual Magazine', contributionDescription: 'Compiled and edited 40+ articles from students and faculty.', proofLink: 'https://drive.google.com/magazine' },
            { activityType: 'association', role: 'Technical Lead', eventName: 'Raueecci 2025', contributionDescription: 'Organized technical events for 300+ participants.', proofLink: '' },
        ],
        masterProofFolderUrl: '',
        consentGiven: true, submittedAt: new Date().toISOString(),
    };
}

function sampleHighestSalary(i: number): Record<string, unknown> {
    const data = [
        { name: 'Varun Menon', company: 'Google', role: 'SDE-1', ctc: 45.00 },
        { name: 'Riya Kapoor', company: 'Microsoft', role: 'Software Engineer', ctc: 38.50 },
        { name: 'Akash Aggarwal', company: 'NVIDIA', role: 'ASIC Engineer', ctc: 32.00 },
    ];
    const d = data[i % data.length];
    return {
        personalDetails: {
            name: d.name, registerNumber: `RA2211053010${700 + i}`,
            department: 'B.Tech Electronics and Computer Engineering', specialization: 'AI & ML', personalEmail: `salary${i}@example.com`,
            srmEmail: `sal${i}@srmist.edu.in`, mobileNumber: `98406${100000 + i}`, section: 'F', facultyAdvisor: 'Dr. K. Lee',
            profilePhotoUrl: '',
        },
        companyName: d.company, jobRole: d.role, ctcLpa: d.ctc,
        offerLetterLink: 'https://drive.google.com/offer-letter',
        consentGiven: true, submittedAt: new Date().toISOString(),
    };
}

function sampleCoreSalary(i: number): Record<string, unknown> {
    const data = [
        { name: 'Tara Deshmukh', company: 'Texas Instruments', role: 'Analog Design Engineer', ctc: 28.00, domain: 'VLSI Design' },
        { name: 'Aditya Pillai', company: 'Qualcomm', role: 'Modem Software Engineer', ctc: 24.50, domain: 'Communication Systems' },
    ];
    const d = data[i % data.length];
    return {
        personalDetails: {
            name: d.name, registerNumber: `RA2211053010${800 + i}`,
            department: 'B.Tech Electronics and Communication Engineering', specialization: 'Core ECE', personalEmail: `core${i}@example.com`,
            srmEmail: `core${i}@srmist.edu.in`, mobileNumber: `98407${100000 + i}`, section: 'A', facultyAdvisor: 'Dr. S. Nair',
            profilePhotoUrl: '',
        },
        companyName: d.company, jobRole: d.role, ctcLpa: d.ctc,
        coreDomain: d.domain,
        offerLetterLink: 'https://drive.google.com/offer-core',
        coreDomainProofLink: 'https://drive.google.com/core-proof',
        consentGiven: true, submittedAt: new Date().toISOString(),
    };
}

function sampleAcademicExcellence(i: number): Record<string, unknown> {
    const data = [
        { name: 'Priya Sharma', cgpa: 9.72, programme: 'B.Tech Electronics and Communication Engineering' },
        { name: 'Rahul Iyer', cgpa: 9.58, programme: 'B.Tech Electronics and Computer Engineering' },
        { name: 'Sneha Nair', cgpa: 9.45, programme: 'M.Tech Electronics and Communication Engineering' },
    ];
    const d = data[i % data.length];
    return {
        personalDetails: {
            name: d.name, registerNumber: `RA2211053010${900 + i}`,
            department: d.programme, specialization: 'Academic Excellence', personalEmail: `acad${i}@example.com`,
            srmEmail: `acad${i}@srmist.edu.in`, mobileNumber: `98408${100000 + i}`, section: 'A', facultyAdvisor: 'Dr. Ramesh Kumar',
            profilePhotoUrl: '',
        },
        cgpa: d.cgpa,
        gradeSheetLink: 'https://drive.google.com/grade-sheet',
        consentGiven: true, submittedAt: new Date().toISOString(),
    };
}

export async function GET(req: NextRequest) {
    // Block in production to prevent accidental data wipe
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'This endpoint is disabled in production' },
            { status: 403 }
        );
    }

    const { searchParams } = new URL(req.url);
    const headersOnly = searchParams.get('headersOnly') === 'true';
    const withSample = searchParams.get('sample') === 'true';

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    const results: { sheet: string; status: string }[] = [];

    try {
        // Get existing sheet tabs
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
        const existingTabs = spreadsheet.data.sheets?.map(s => s.properties?.title || '') || [];

        for (const award of AWARD_CATEGORIES) {
            if (award.slug === 'best-outgoing') {
                results.push({ sheet: award.sheetName, status: 'Skipped (uses existing BO_Main tab)' });
                continue;
            }

            const headers = getHeadersForAward(award.slug);
            if (headers.length === 0) continue;

            // Check if tab exists
            if (existingTabs.includes(award.sheetName)) {
                // Clear all data (keep nothing — we'll rewrite headers)
                try {
                    await sheets.spreadsheets.values.clear({
                        spreadsheetId: sheetId,
                        range: `${award.sheetName}!A:AZ`,
                    });
                } catch { /* tab might be empty */ }
            } else {
                // Create the tab
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: sheetId,
                    requestBody: {
                        requests: [{ addSheet: { properties: { title: award.sheetName } } }],
                    },
                });
            }

            // Write headers
            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: `${award.sheetName}!A1:AZ1`,
                valueInputOption: 'RAW',
                requestBody: { values: [headers] },
            });

            results.push({ sheet: award.sheetName, status: headersOnly ? 'Headers written' : 'Cleared & headers written' });
        }

        // Seed sample data if requested
        if (withSample) {
            const sampleGenerators: Record<string, (i: number) => Record<string, unknown>> = {
                'academic-excellence': sampleAcademicExcellence,
                'researcher': sampleResearcher,
                'hackathon': sampleHackathon,
                'sports': sampleSports,
                'nss-ncc': sampleNssNcc,
                'dept-contribution': sampleDeptContribution,
                'highest-salary': sampleHighestSalary,
                'core-salary': sampleCoreSalary,
            };

            for (const [slug, generator] of Object.entries(sampleGenerators)) {
                const count = slug === 'highest-salary' ? 3 : 2;
                for (let i = 0; i < count; i++) {
                    await appendAwardApplication(slug as AwardSlug, generator(i));
                }
                results.push({ sheet: slug, status: `${count} sample entries added` });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${results.length} sheet tabs.${withSample ? ' Sample data seeded.' : ''}`,
            details: results,
        });
    } catch (error: any) {
        console.error('Seed awards error:', error);
        return NextResponse.json({
            success: false,
            error: error?.message || String(error),
        }, { status: 500 });
    }
}
