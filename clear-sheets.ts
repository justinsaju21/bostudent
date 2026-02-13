import { google } from 'googleapis';

async function clearSheet() {
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

    console.log('Clearing Sheet1 (keeping headers)...');
    try {
        // Clear everything from row 2 onwards
        await sheets.spreadsheets.values.clear({
            spreadsheetId: sheetId,
            range: 'Sheet1!A2:AZ50',
        });
        console.log('Sheet cleared successfully.');
    } catch (error) {
        console.error('Error clearing sheet:', error);
    }
}

clearSheet();
