import { google } from 'googleapis';
import { initializeSheet } from './src/lib/googleSheets';

async function resetSheet() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!email || !key || !sheetId) {
        console.error('Missing credentials');
        return;
    }

    const auth = new google.auth.JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('Fully resetting Sheet1...');
    try {
        // Clear EVERYTHING
        await sheets.spreadsheets.values.clear({
            spreadsheetId: sheetId,
            range: 'Sheet1!A1:AZ100',
        });
        console.log('Sheet cleared. Re-initializing headers...');

        await initializeSheet();
        console.log('Sheet reset and initialized successfully.');
    } catch (error) {
        console.error('Error resetting sheet:', error);
    }
}

resetSheet();
