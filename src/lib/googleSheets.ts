import { google } from 'googleapis';
import { StudentApplication } from './types';



// These environment variables must be set:
// GOOGLE_SERVICE_ACCOUNT_EMAIL - your service account email
// GOOGLE_PRIVATE_KEY - your service account private key
// GOOGLE_SHEET_ID - the spreadsheet ID

// ===== CACHING STATE =====
let _isInitialized = false;
let _studentsCache: { data: StudentApplication[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

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
    'Name',
    'Register Number',
    'Department',
    'Specialization',
    'Section',
    'Faculty Advisor',
    'Personal Email',
    'SRM Email',
    'Mobile Number',
    'Profile Photo URL',
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
    'Professional Memberships (Summary)',
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

function summarizeProfessionalMemberships(items: StudentApplication['professionalMemberships']): string {
    if (!items || !items.length) return 'None';
    return items.map((m, idx) => `${idx + 1}. ${m.organization}${m.role ? ` (${m.role})` : ''}`).join('\n');
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
        app.personalDetails.name,
        app.personalDetails.registerNumber,
        app.personalDetails.department,
        app.personalDetails.specialization,
        app.personalDetails.section || '',
        app.personalDetails.facultyAdvisor || '',
        app.personalDetails.personalEmail,
        app.personalDetails.srmEmail,
        app.personalDetails.mobileNumber,
        app.personalDetails.profilePhotoUrl || '',
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
        summarizeProfessionalMemberships(app.professionalMemberships),
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

// ===== Helper to Get Column Letter =====
const getColLetter = (n: number) => {
    let s = '';
    while (n >= 0) {
        s = String.fromCharCode(n % 26 + 65) + s;
        n = Math.floor(n / 26) - 1;
    }
    return s;
};

// ===== PUBLIC API =====

export async function initializeSheet(): Promise<void> {
    // Optimization: Skip if we've already initialized in this functional instance
    if (_isInitialized) return;

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    try {
        // Always update headers to ensure new columns are added
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: 'Sheet1!A1:AZ1',
            valueInputOption: 'RAW',
            requestBody: { values: [HEADERS] },
        });

        // Check if Settings sheet exists/init
        try {
            await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: 'Settings!A1',
            });
        } catch {
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
        }
        _isInitialized = true;
    } catch (e) {
        console.error('Error initializing sheet:', e);
        throw e;
    }
}

export async function appendStudent(app: StudentApplication): Promise<void> {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    // Ensure initialized, but uses cached flag
    await initializeSheet();

    // Invalidate cache on new write
    _studentsCache = null;

    const row = applicationToRow(app);
    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Sheet1!A:AZ',
        valueInputOption: 'RAW',
        requestBody: { values: [row] },
    });
}

export async function addStudentsBatch(apps: StudentApplication[]): Promise<void> {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    if (apps.length === 0) return;

    console.log('Initializing sheet before batch push...');
    await initializeSheet();
    _studentsCache = null;

    const rows = apps.map(applicationToRow);

    // Chunking to avoid large payload/timeout issues (100 students per request)
    const chunkSize = 100;
    for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        console.log(`Pushing chunk ${Math.floor(i / chunkSize) + 1}... (${chunk.length} rows)`);

        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Sheet1!A:AZ',
            valueInputOption: 'RAW',
            requestBody: { values: chunk },
        });
    }
    console.log('Batch push complete!');
}

export async function getAllStudents(): Promise<StudentApplication[]> {
    // Optimization: Return cached data if available and fresh
    const now = Date.now();
    if (_studentsCache && (now - _studentsCache.timestamp < CACHE_TTL_MS)) {
        return _studentsCache.data;
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Sheet1!A2:AZ',
    });

    if (!res.data.values) {
        // Cache empty result too
        _studentsCache = { data: [], timestamp: now };
        return [];
    }

    const students: StudentApplication[] = [];
    for (const row of res.data.values) {
        const app = rowToApplication(row);
        if (app) students.push(app);
    }

    // Update Cache
    _studentsCache = { data: students, timestamp: now };

    return students;
}

export async function getStudentByRegNo(regNo: string): Promise<StudentApplication | null> {
    // This will now use the cache automatically
    const students = await getAllStudents();
    return students.find(
        (s) => s.personalDetails.registerNumber.toUpperCase() === regNo.toUpperCase()
    ) || null;
}

export async function checkExistingSubmission(data: {
    registerNumber: string,
    email: string,
    mobile: string
}): Promise<{ exists: boolean; field?: string }> {
    const students = await getAllStudents();
    const regNo = data.registerNumber.toUpperCase();
    const email = data.email.toLowerCase();
    const mobile = data.mobile.trim();

    for (const s of students) {
        if (s.personalDetails.registerNumber.toUpperCase() === regNo) {
            return { exists: true, field: 'Register Number' };
        }
        if (s.personalDetails.personalEmail.toLowerCase() === email ||
            s.personalDetails.srmEmail.toLowerCase() === email) {
            return { exists: true, field: 'Email Address' };
        }
        if (s.personalDetails.mobileNumber.trim() === mobile) {
            return { exists: true, field: 'Mobile Number' };
        }
    }
    return { exists: false };
}

// Keep this for backward compatibility if needed, but updated to use the new logic
export async function checkDuplicateRegNo(regNo: string): Promise<boolean> {
    const result = await checkExistingSubmission({ registerNumber: regNo, email: '', mobile: '' });
    return result.exists;
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
        const regNoIndex = HEADERS.indexOf('Register Number');
        if (regNoIndex === -1) return false;

        const regNoCol = getColLetter(regNoIndex);
        const range = `Sheet1!${regNoCol}:${regNoCol}`;

        // Optimization: We could cache this lookup map if rows don't change order, but for safety we look it up.
        // However, we can at least avoid re-reading the whole sheet if we just want indices?
        // Actually, fetching just one column (Register Number) is much lighter than fetching all columns.
        // The original code was already doing this (good), but let's ensure we invalidate cache after update.

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
            // Invalidate cache so the new score shows up immediately for everyone (or at least next fetch)
            _studentsCache = null;
        }

        return true;
    } catch (error) {
        console.error('Error updating evaluation:', error);
        return false;
    }
}

export async function updateFullStudentApplication(app: StudentApplication): Promise<boolean> {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    await initializeSheet();

    try {
        const regNoIndex = HEADERS.indexOf('Register Number');
        if (regNoIndex === -1) return false;

        const regNoCol = getColLetter(regNoIndex);
        const range = `Sheet1!${regNoCol}:${regNoCol}`;
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        const rows = response.data.values;
        if (!rows) return false;

        const rowIndex = rows.findIndex(row => row[0] === app.personalDetails.registerNumber);
        if (rowIndex === -1) return false; // Not found

        const sheetRow = rowIndex + 1;
        const rowData = applicationToRow(app);

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Sheet1!A${sheetRow}:AZ${sheetRow}`,
            valueInputOption: 'RAW',
            requestBody: { values: [rowData] },
        });

        // Invalidate cache
        _studentsCache = null;

        return true;
    } catch (error) {
        console.error('Error updating student application:', error);
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

export async function batchUpdateStudentEvaluations(
    updates: { regNo: string; facultyScore?: number; discardedItems?: string[] }[]
): Promise<boolean> {
    if (updates.length === 0) return true;

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    try {
        // 1. Fetch Register Numbers to map to Row Indices
        // To be safe, we fetch the column.
        const regNoIndex = HEADERS.indexOf('Register Number');
        if (regNoIndex === -1) return false;

        const regNoCol = getColLetter(regNoIndex);
        const range = `Sheet1!${regNoCol}:${regNoCol}`;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range,
        });

        const rows = response.data.values;
        if (!rows) return false;

        // Create Map: RegNo -> RowIndex (1-indexed for Sheets API)
        const regNoMap = new Map<string, number>();
        rows.forEach((row, index) => {
            if (row[0]) regNoMap.set(row[0].toString().toUpperCase(), index + 1);
        });

        // 2. Prepare Updates
        const scoreColIndex = HEADERS.indexOf('Faculty_Score');
        const discardedColIndex = HEADERS.indexOf('Discarded_Items');
        if (scoreColIndex === -1 || discardedColIndex === -1) return false;

        const scoreCol = getColLetter(scoreColIndex);
        const discardedCol = getColLetter(discardedColIndex);

        const sheetUpdates: any[] = [];

        for (const update of updates) {
            const sheetRow = regNoMap.get(update.regNo.toUpperCase());
            if (!sheetRow) continue; // Skip if student not found

            if (update.facultyScore !== undefined) {
                sheetUpdates.push({
                    range: `Sheet1!${scoreCol}${sheetRow}`,
                    values: [[update.facultyScore.toString()]],
                });
            }

            if (update.discardedItems !== undefined) {
                sheetUpdates.push({
                    range: `Sheet1!${discardedCol}${sheetRow}`,
                    values: [[JSON.stringify(update.discardedItems)]],
                });
            }
        }

        if (sheetUpdates.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: sheetId,
                requestBody: {
                    valueInputOption: 'RAW',
                    data: sheetUpdates,
                },
            });
            _studentsCache = null; // Invalidate cache
        }

        return true;

    } catch (error) {
        console.error('Error batch updating evaluations:', error);
        return false;
    }
}

export async function clearAllStudents(): Promise<void> {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    // Clear everything from row 2 onwards to preserve headers
    await sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: 'Sheet1!A2:AZ1000',
    });

    _studentsCache = null;
}
