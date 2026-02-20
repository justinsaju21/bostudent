// ===== GENERIC MULTI-SHEET CRUD FOR AWARD CATEGORIES =====
// This module works alongside the existing googleSheets.ts (which handles BO_Main).
// It provides generic append/read/dedup for any award sheet tab.

import { google } from 'googleapis';
import { AwardSlug, getAwardBySlug } from './awards';
import { BasePersonalDetails } from './awardTypes';

// ===== Per-sheet caches =====
const _awardCaches: Record<string, { data: Record<string, unknown>[]; timestamp: number }> = {};
const CACHE_TTL_MS = 30 * 1000;

function getAuth() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!email || !key) {
        throw new Error('Google Sheets credentials not configured.');
    }
    return new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
}

function getSheetId(): string {
    const id = process.env.GOOGLE_SHEET_ID;
    if (!id) throw new Error('GOOGLE_SHEET_ID not set');
    return id;
}

// ===== Ensure a sheet tab exists, creating it if needed =====
async function ensureSheet(sheetName: string, headers: string[]): Promise<void> {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    try {
        await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${sheetName}!A1`,
        });
    } catch {
        // Sheet doesn't exist — create it
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [{ addSheet: { properties: { title: sheetName } } }],
            },
        });
    }

    // Always write headers to row 1
    await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:AZ1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] },
    });
}

// ===== HEADERS for each award sheet =====
function getHeadersForAward(slug: AwardSlug): string[] {
    const personal = ['Name', 'Register Number', 'Programme', 'Specialization', 'Personal Email', 'SRM Email', 'Mobile Number', 'Section', 'Faculty Advisor', 'Profile Photo URL'];

    switch (slug) {
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

// ===== Generic row builder =====
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function awardApplicationToRow(slug: AwardSlug, app: any): string[] {
    const pd: BasePersonalDetails = app.personalDetails;
    const personal = [pd.name, pd.registerNumber, pd.department, pd.specialization, pd.personalEmail, pd.srmEmail, pd.mobileNumber, pd.section, pd.facultyAdvisor, pd.profilePhotoUrl || ''];

    switch (slug) {
        case 'academic-excellence':
            return [...personal, String(app.cgpa || 0), app.gradeSheetLink || '', app.submittedAt || new Date().toISOString(), JSON.stringify(app)];
        case 'researcher': {
            const papersSummary = (app.papers || []).map((p: { title: string; indexStatus: string }, i: number) =>
                `${i + 1}. ${p.title} [${p.indexStatus?.toUpperCase()}]`).join('\n') || 'None';
            const patentsSummary = (app.patents || []).map((p: { title: string; status: string }, i: number) =>
                `${i + 1}. ${p.title} (${p.status})`).join('\n') || 'None';
            return [...personal, papersSummary, patentsSummary, app.researchStatement || '', app.masterProofFolderUrl || '', app.submittedAt || new Date().toISOString(), JSON.stringify(app)];
        }
        case 'hackathon': {
            const summary = (app.wins || []).map((w: { eventName: string; level: string; position: string }, i: number) =>
                `${i + 1}. ${w.eventName} (${w.level}) - ${w.position}`).join('\n') || 'None';
            return [...personal, summary, app.masterProofFolderUrl || '', app.submittedAt || new Date().toISOString(), JSON.stringify(app)];
        }
        case 'sports': {
            const summary = (app.wins || []).map((w: { sportOrEvent: string; level: string; position: string }, i: number) =>
                `${i + 1}. ${w.sportOrEvent} (${w.level}) - ${w.position}`).join('\n') || 'None';
            return [...personal, summary, app.masterProofFolderUrl || '', app.submittedAt || new Date().toISOString(), JSON.stringify(app)];
        }
        case 'nss-ncc':
            return [...personal, app.organization || '', app.role || '', String(app.totalHoursServed || 0), app.eventsOrganized || '', app.impactDescription || '', app.proofLink || '', app.masterProofFolderUrl || '', app.submittedAt || new Date().toISOString(), JSON.stringify(app)];
        case 'dept-contribution': {
            const summary = (app.contributions || []).map((c: { activityType: string; role: string; eventName: string }, i: number) =>
                `${i + 1}. ${c.eventName} (${c.activityType}) - ${c.role}`).join('\n') || 'None';
            return [...personal, summary, app.masterProofFolderUrl || '', app.submittedAt || new Date().toISOString(), JSON.stringify(app)];
        }
        case 'highest-salary':
            return [...personal, app.companyName || '', app.jobRole || '', String(app.ctcLpa || 0), app.offerLetterLink || '', app.submittedAt || new Date().toISOString(), JSON.stringify(app)];
        case 'core-salary':
            return [...personal, app.companyName || '', app.jobRole || '', String(app.ctcLpa || 0), app.coreDomain || '', app.offerLetterLink || '', app.coreDomainProofLink || '', app.submittedAt || new Date().toISOString(), JSON.stringify(app)];
        default:
            return [...personal, app.submittedAt || new Date().toISOString(), JSON.stringify(app)];
    }
}

// ===== PUBLIC API =====

export async function appendAwardApplication(slug: AwardSlug, data: Record<string, unknown>): Promise<void> {
    const award = getAwardBySlug(slug);
    if (!award) throw new Error(`Unknown award: ${slug}`);

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    const headers = getHeadersForAward(slug);
    await ensureSheet(award.sheetName, headers);

    // Invalidate cache
    delete _awardCaches[slug];

    const row = awardApplicationToRow(slug, data);
    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${award.sheetName}!A:AZ`,
        valueInputOption: 'RAW',
        requestBody: { values: [row] },
    });
}

export async function getAllAwardApplications(slug: AwardSlug): Promise<Record<string, unknown>[]> {
    const now = Date.now();
    if (_awardCaches[slug] && (now - _awardCaches[slug].timestamp < CACHE_TTL_MS)) {
        return _awardCaches[slug].data;
    }

    const award = getAwardBySlug(slug);
    if (!award) throw new Error(`Unknown award: ${slug}`);

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${award.sheetName}!A2:AZ`,
        });

        if (!res.data.values) {
            _awardCaches[slug] = { data: [], timestamp: now };
            return [];
        }

        const results: Record<string, unknown>[] = [];
        for (const row of res.data.values) {
            try {
                const jsonStr = row[row.length - 1];
                if (jsonStr) {
                    results.push(JSON.parse(jsonStr));
                }
            } catch { /* skip malformed rows */ }
        }

        _awardCaches[slug] = { data: results, timestamp: now };
        return results;
    } catch {
        // Sheet might not exist yet
        return [];
    }
}

export async function checkAwardDuplicate(slug: AwardSlug, regNo: string, email: string, mobile: string): Promise<{ exists: boolean; field?: string }> {
    const all = await getAllAwardApplications(slug);

    for (const app of all) {
        const pd = (app as { personalDetails?: BasePersonalDetails }).personalDetails;
        if (!pd) continue;

        if (pd.registerNumber.toUpperCase() === regNo.toUpperCase()) {
            return { exists: true, field: 'Register Number' };
        }
        if (pd.personalEmail.toLowerCase() === email.toLowerCase() || pd.srmEmail.toLowerCase() === email.toLowerCase()) {
            return { exists: true, field: 'Email Address' };
        }
        if (pd.mobileNumber.trim() === mobile.trim()) {
            return { exists: true, field: 'Mobile Number' };
        }
    }
    return { exists: false };
}
