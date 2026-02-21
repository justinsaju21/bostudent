import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env.local parsing to avoid 'dotenv' dependency issues
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

function getAuth() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!email || !key) throw new Error('Google Sheets credentials not configured.');
    return new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
}

function getSheetId() {
    const id = process.env.GOOGLE_SHEET_ID;
    if (!id) throw new Error('GOOGLE_SHEET_ID not set');
    return id;
}

const HEADERS = [
    'Name', 'Register Number', 'Department', 'Specialization', 'Section', 'Faculty Advisor',
    'Personal Email', 'SRM Email', 'Mobile Number', 'Profile Photo URL', 'CGPA', '10th %', '12th %',
    'Arrears History', 'Post-College Status', 'Post-College Details', 'Internships (Summary)',
    'Projects (Summary)', 'Hackathons (Summary)', 'Research (Summary)', 'Entrepreneurship (Summary)',
    'Certifications (Summary)', 'Competitive Exams (Summary)', 'Sports/Cultural (Summary)',
    'Volunteering (Summary)', 'Scholarships (Summary)', 'Clubs/Leadership (Summary)',
    'Dept Contributions (Summary)', 'Professional Memberships (Summary)', 'References (Summary)',
    'Social Media (Summary)', 'Future Goal', 'Video Pitch URL', 'Master Proof Folder', 'Submitted At',
    'Faculty_Score', 'Verified', 'Discarded_Items', 'JSON_Full_Data'
];

async function main() {
    console.log('🔄 Rebuilding database schemas...');
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetId();

    try {
        console.log('📝 Forcing HEADERS reset on BO_Main...');
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: 'BO_Main!A1:AZ1',
            valueInputOption: 'RAW',
            requestBody: { values: [HEADERS] },
        });

        // Initialize Custom Awards sheets as well
        const customTabs = [
            'bo_research',
            'bo_coder',
            'bo_hardware',
            'bo_sports',
            'bo_cultural',
            'bo_social',
            'bo_leader'
        ];

        for (const tab of customTabs) {
            console.log(`📝 Checking Tab: ${tab}`);
            try {
                await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `${tab}!A1` });
                // Update header row for custom awards
                await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: `${tab}!A1:Z1`,
                    valueInputOption: 'RAW',
                    requestBody: { values: [['Register_Number', 'Faculty_Score', 'Verified', 'Discarded_Items']] }
                });
            } catch (e) {
                console.log(`Creating missing tab: ${tab}`);
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: sheetId,
                    requestBody: { requests: [{ addSheet: { properties: { title: tab } } }] }
                });
                await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: `${tab}!A1:Z1`,
                    valueInputOption: 'RAW',
                    requestBody: { values: [['Register_Number', 'Faculty_Score', 'Verified', 'Discarded_Items']] }
                });
            }
        }

        console.log('✅ Database schemas reset and ready!');
    } catch (e) {
        console.error('❌ Failed to rebuild DB:', e);
    }
}

main();
