import { google } from 'googleapis';
import { StudentApplication } from './types';

// These environment variables must be set:
// GOOGLE_SERVICE_ACCOUNT_EMAIL - your service account email
// GOOGLE_PRIVATE_KEY - your service account private key
// GOOGLE_SHEET_ID - the spreadsheet ID

function getAuth() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!email || !key) {
        throw new Error('Google Sheets credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local');
    }

    return new google.auth.JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}

function getSheetId(): string {
    const id = process.env.GOOGLE_SHEET_ID;
    if (!id) throw new Error('GOOGLE_SHEET_ID not set in .env.local');
    return id;
}

// ===== Column Headers for the Sheet =====
const HEADERS = [
    'Register Number',
    'Name',
    'Department',
    'Specialization',
    'Personal Email',
    'SRM Email',
    'Mobile Number',
    'Profile Photo URL',
    'Faculty Advisor',
    'Section',
    'CGPA',
    '10th %',
    '12th %',
    'Arrears History',
    'Post-College Status',
    'Post-College Details',
    'Internships (Summary)',
    'Projects (Summary)',
    'Hackathons (Summary)',
    'Research (Summary)',
    'Entrepreneurship (Summary)',
    'Certifications (Summary)',
    'Competitive Exams (Summary)',
    'Sports/Cultural (Summary)',
    'Volunteering (Summary)',
    'Scholarships (Summary)',
    'Clubs/Leadership (Summary)',
    'Dept Contributions (Summary)',
    'References (Summary)',
    'Social Media (Summary)',
    'Future Goal',
    'Video Pitch URL',
    'Master Proof Folder',
    'Submitted At',
    'Faculty_Score',
    'Discarded_Items',
    // JSON columns (hidden by faculty)
    'JSON_Full_Data',
];

// ===== Generate Summary Strings =====
function summarizeInternships(items: StudentApplication['internships']): string {
    if (!items.length) return 'None';
    return items.map((i, idx) => `${idx + 1}. ${i.company} (${i.role}) - ${i.startDate} to ${i.endDate}`).join('\n');
}

function summarizeProjects(items: StudentApplication['projects']): string {
    if (!items.length) return 'None';
    return items.map((p, idx) => `${idx + 1}. ${p.title} [${p.techStack}]`).join('\n');
}

function summarizeHackathons(items: StudentApplication['hackathons']): string {
    if (!items.length) return 'None';
    return items.map((h, idx) => `${idx + 1}. ${h.name} - ${h.position} (Team: ${h.teamSize})`).join('\n');
}

function summarizeResearch(items: StudentApplication['research']): string {
    if (!items.length) return 'None';
    return items.map((r, idx) => `${idx + 1}. ${r.title} [${r.indexStatus.toUpperCase()}] - ${r.publicationStatus}`).join('\n');
}

function summarizeEntrepreneurship(items: StudentApplication['entrepreneurship']): string {
    if (!items.length) return 'None';
    return items.map((e, idx) => `${idx + 1}. ${e.startupName} - ${e.revenueOrFundingStatus || 'N/A'}`).join('\n');
}

function summarizeCertifications(items: StudentApplication['certifications']): string {
    if (!items.length) return 'None';
    return items.map((c, idx) => `${idx + 1}. ${c.certificateName} (${c.provider})`).join('\n');
}

function summarizeExams(items: StudentApplication['competitiveExams']): string {
    if (!items.length) return 'None';
    return items.map((e, idx) => `${idx + 1}. ${e.examName} - ${e.scoreOrRank}`).join('\n');
}

function summarizeSports(items: StudentApplication['sportsOrCultural']): string {
    if (!items.length) return 'None';
    return items.map((s, idx) => `${idx + 1}. ${s.eventName} (${s.level}) - ${s.positionWon}`).join('\n');
}

function summarizeVolunteering(items: StudentApplication['volunteering']): string {
    if (!items.length) return 'None';
    return items.map((v, idx) => `${idx + 1}. ${v.organization} (${v.role}) - ${v.hoursServed || '?'}h`).join('\n');
}

function summarizeScholarships(items: StudentApplication['scholarships']): string {
    if (!items.length) return 'None';
    return items.map((s, idx) => `${idx + 1}. ${s.name} by ${s.awardingBody}`).join('\n');
}

function summarizeClubs(items: StudentApplication['clubActivities']): string {
    if (!items.length) return 'None';
    return items.map((c, idx) => `${idx + 1}. ${c.clubName} - ${c.position}`).join('\n');
}

function summarizeDeptContributions(items: StudentApplication['departmentContributions']): string {
    if (!items.length) return 'None';
    return items.map((d, idx) => `${idx + 1}. ${d.eventName} (${d.role})`).join('\n');
}

function summarizeReferences(items: StudentApplication['references']): string {
    if (!items.length) return 'None';
    return items.map((r, idx) => `${idx + 1}. ${r.facultyName} (${r.contact})`).join('\n');
}

function summarizeSocials(socials: StudentApplication['socialMedia']): string {
    const parts: string[] = [];
    if (socials.linkedin) parts.push(`LinkedIn: ${socials.linkedin}`);
    if (socials.github) parts.push(`GitHub: ${socials.github}`);
    if (socials.twitter) parts.push(`X: ${socials.twitter}`);
    if (socials.instagram) parts.push(`Instagram: ${socials.instagram}`);
    if (socials.website) parts.push(`Website: ${socials.website}`);
    if (socials.others?.length) {
        socials.others.forEach((o) => parts.push(`${o.platform}: ${o.url}`));
    }
    return parts.length ? parts.join('\n') : 'None';
}

function postCollegeDetails(pc: StudentApplication['postCollegeStatus']): string {
    if (pc.status === 'placed') return `Placed: ${pc.placedCompany || 'N/A'}`;
    if (pc.status === 'higher_studies') return `Higher Studies: ${pc.universityName || 'N/A'}`;
    if (pc.status === 'entrepreneur') return `Entrepreneur`;
    return pc.otherDetails || 'Other';
}

// ===== Convert StudentApplication to a Row =====
function applicationToRow(app: StudentApplication): string[] {
    return [
        app.personalDetails.registerNumber,
        app.personalDetails.name,
        app.personalDetails.department,
        app.personalDetails.specialization,
        app.personalDetails.personalEmail,
        app.personalDetails.srmEmail,
        app.personalDetails.mobileNumber,
        app.personalDetails.mobileNumber,
        app.personalDetails.profilePhotoUrl || '',
        app.personalDetails.facultyAdvisor || '',
        app.personalDetails.section || '',
        String(app.academicRecord.cgpa),
        String(app.academicRecord.tenthPercentage),
        String(app.academicRecord.twelfthPercentage),
        app.academicRecord.historyOfArrears ? `Yes (${app.academicRecord.numberOfArrears || 0})` : 'No',
        app.postCollegeStatus.status,
        postCollegeDetails(app.postCollegeStatus),
        summarizeInternships(app.internships),
        summarizeProjects(app.projects),
        summarizeHackathons(app.hackathons),
        summarizeResearch(app.research),
        summarizeEntrepreneurship(app.entrepreneurship),
        summarizeCertifications(app.certifications),
        summarizeExams(app.competitiveExams),
        summarizeSports(app.sportsOrCultural),
        summarizeVolunteering(app.volunteering),
        summarizeScholarships(app.scholarships),
        summarizeClubs(app.clubActivities),
        summarizeDeptContributions(app.departmentContributions),
        summarizeReferences(app.references),
        summarizeSocials(app.socialMedia),
        app.futureGoal.description,
        app.videoPitchUrl,
        app.masterProofFolderUrl || '',
        app.submittedAt || new Date().toISOString(),
        app.facultyScore?.toString() || '',
        app.discardedItems ? JSON.stringify(app.discardedItems) : '[]',
        // JSON column
        JSON.stringify(app),
    ];
}

// ===== Parse Row back to StudentApplication =====
function rowToApplication(row: string[]): StudentApplication | null {
    try {
        // The last column is the full JSON
        const jsonStr = row[row.length - 1];
        if (jsonStr) {
            const app = JSON.parse(jsonStr) as StudentApplication;

            // Enrich with sheet columns if JSON is stale (e.g. faculty made updates)
            const facultyScoreIdx = HEADERS.indexOf('Faculty_Score');
            const discardedItemsIdx = HEADERS.indexOf('Discarded_Items');

            if (facultyScoreIdx !== -1 && row[facultyScoreIdx]) {
                const score = parseFloat(row[facultyScoreIdx]);
                if (!isNaN(score)) app.facultyScore = score;
            }
            if (discardedItemsIdx !== -1 && row[discardedItemsIdx]) {
                try {
                    app.discardedItems = JSON.parse(row[discardedItemsIdx]);
                } catch { app.discardedItems = []; }
            }
            // Verify essential fields exist
            if (!app.personalDetails || !app.personalDetails.registerNumber) return null;

            return app;
        }
        return null;
    } catch {
        return null;
    }
}

// ===== PUBLIC API =====

export async function initializeSheet(): Promise<void> {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    // Check if headers exist
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Sheet1!A1:AZ1',
    });

    if (!res.data.values || res.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'RAW',
            requestBody: { values: [HEADERS] },
        });
    }

    // Check if Settings sheet exists/init
    try {
        await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Settings!A1',
        });
    } catch {
        // Likely sheet doesn't exist, create it (adding sheet is complex with values API, usually requires batchUpdate)
        // For simplicity, we assume the user might need to create it, OR we try to add it.
        // Actually, 'values' API cannot creating sheets. We need 'batchUpdate' with 'addSheet'.
        try {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: sheetId,
                requestBody: {
                    requests: [{ addSheet: { properties: { title: 'Settings' } } }]
                }
            });
            // Initialize headers
            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: 'Settings!A1',
                valueInputOption: 'RAW',
                requestBody: { values: [['Key', 'Value'], ['DEADLINE', '']] },
            });
        } catch (e) {
            console.log('Settings sheet might already exist or error creating:', e);
        }
    }
}

export async function appendStudent(app: StudentApplication): Promise<void> {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    await initializeSheet();

    const row = applicationToRow(app);
    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Sheet1!A:AZ',
        valueInputOption: 'RAW',
        requestBody: { values: [row] },
    });
}

export async function getAllStudents(): Promise<StudentApplication[]> {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Sheet1!A2:AZ',
    });

    if (!res.data.values) return [];

    const students: StudentApplication[] = [];
    for (const row of res.data.values) {
        const app = rowToApplication(row);
        if (app) students.push(app);
    }
    return students;
}

export async function getStudentByRegNo(regNo: string): Promise<StudentApplication | null> {
    const students = await getAllStudents();
    return students.find(
        (s) => s.personalDetails.registerNumber.toUpperCase() === regNo.toUpperCase()
    ) || null;
}

export async function checkDuplicateRegNo(regNo: string): Promise<boolean> {
    const students = await getAllStudents();
    return students.some(s => s.personalDetails.registerNumber === regNo);
}

export async function updateStudentEvaluation(
    regNo: string,
    facultyScore?: number,
    discardedItems?: string[]
): Promise<boolean> {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    try {
        // 1. Find the row index
        const range = 'Sheet1!A:A'; // Register Number is column A
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range,
        });

        const rows = response.data.values;
        if (!rows) return false;

        const rowIndex = rows.findIndex(row => row[0] === regNo); // 0-indexed
        if (rowIndex === -1) return false;

        const sheetRow = rowIndex + 1; // 1-indexed for API

        // 2. Determine column indices
        const scoreColIndex = HEADERS.indexOf('Faculty_Score');
        const discardedColIndex = HEADERS.indexOf('Discarded_Items');

        if (scoreColIndex === -1 || discardedColIndex === -1) return false;

        // Convert column index to letter (A, B, ... AA, AB...)
        const getColLetter = (n: number) => {
            let s = '';
            while (n >= 0) {
                s = String.fromCharCode(n % 26 + 65) + s;
                n = Math.floor(n / 26) - 1;
            }
            return s;
        };

        const scoreCol = getColLetter(scoreColIndex);
        const discardedCol = getColLetter(discardedColIndex);

        const updates = [];

        if (facultyScore !== undefined) {
            updates.push({
                range: `Sheet1!${scoreCol}${sheetRow}`,
                values: [[facultyScore.toString()]],
            });
        }

        if (discardedItems !== undefined) {
            updates.push({
                range: `Sheet1!${discardedCol}${sheetRow}`,
                values: [[JSON.stringify(discardedItems)]],
            });
        }

        if (updates.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: sheetId,
                requestBody: {
                    valueInputOption: 'RAW',
                    data: updates,
                },
            });
        }

        return true;
    } catch (error) {
        console.error('Error updating evaluation:', error);
        return false;
    }
}

// ===== SETTINGS (Deadline) =====

export async function getDeadline(): Promise<string | null> {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Settings!A2:B10', // Look for DEADLINE key
        });

        const rows = res.data.values;
        if (!rows) return null;

        const deadlineRow = rows.find(r => r[0] === 'DEADLINE');
        return deadlineRow ? deadlineRow[1] : null;
    } catch {
        return null;
    }
}

export async function setDeadline(dateStr: string): Promise<boolean> {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    try {
        // We need to find the row for DEADLINE or append it.
        // Simpler: Just read all, find index, update.
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Settings!A:A',
        });

        const rows = res.data.values || [];
        let rowIndex = rows.findIndex(r => r[0] === 'DEADLINE');

        if (rowIndex === -1) {
            // Append
            await sheets.spreadsheets.values.append({
                spreadsheetId: sheetId,
                range: 'Settings!A:B',
                valueInputOption: 'RAW',
                requestBody: { values: [['DEADLINE', dateStr]] },
            });
        } else {
            // Update
            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: `Settings!B${rowIndex + 1}`,
                valueInputOption: 'RAW',
                requestBody: { values: [[dateStr]] },
            });
        }
        return true;
    } catch (e) {
        console.error('Error setting deadline:', e);
        return false;
    }
}
