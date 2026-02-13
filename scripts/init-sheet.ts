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
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
}

// Headers mapping (must match lib/googleSheets.ts logic)
const HEADERS = [
    'Register Number', 'Name', 'Department', 'Specialization',
    'Personal Email', 'SRM Email', 'Mobile Number', 'Profile Photo URL',
    'CGPA', '10th %', '12th %', 'Arrears History',
    'Post-College Status', 'Post-College Details',
    'Internships (Summary)', 'Projects (Summary)', 'Hackathons (Summary)',
    'Research (Summary)', 'Entrepreneurship (Summary)', 'Certifications (Summary)',
    'Competitive Exams (Summary)', 'Sports/Cultural (Summary)', 'Volunteering (Summary)',
    'Scholarships (Summary)', 'Clubs/Leadership (Summary)', 'Dept Contributions (Summary)',
    'References (Summary)', 'Social Media (Summary)',
    'Future Goal', 'Video Pitch URL', 'Master Proof Folder',
    'Submitted At',
    'JSON_Full_Data'
];

async function main() {
    console.log('Initializing Google Sheet...');

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // Handle newlines in private key
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!email || !key || !sheetId) {
        console.error('❌ Missing credentials in .env.local');
        console.error('Email:', !!email);
        console.error('Key:', !!key);
        console.error('SheetID:', !!sheetId);
        process.exit(1);
    }

    const auth = new google.auth.JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Check existing headers (read first row)
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Sheet1!A1:AH1',
        });

        if (res.data.values && res.data.values.length > 0) {
            console.log('⚠️ Headers already exist. Skipping initialization.');
            console.log('Existing Headers:', res.data.values[0]);
        } else {
            console.log('Writing new headers...');
            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: 'Sheet1!A1',
                valueInputOption: 'RAW',
                requestBody: { values: [HEADERS] },
            });
            console.log('✅ Success! Headers written to Sheet1.');
        }

    } catch (error: any) {
        console.error('Error accessing sheet:', error.message);
        if (error.code === 403 || error.code === 404) {
            console.log('\n❌ PERMISSION ERROR');
            console.log(`Please share the sheet with: ${email}`);
        }
    }
}

main();
