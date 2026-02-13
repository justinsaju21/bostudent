import { google } from 'googleapis';

async function debug() {
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

    console.log('Fetching raw rows from Sheet1!A1:AZ...');
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Sheet1!A1:AZ5',
        });

        const rows = res.data.values;
        if (!rows || rows.length === 0) {
            console.log('No data found.');
            return;
        }

        console.log('Headers:', rows[0].join(' | '));
        console.log('Header Count:', rows[0].length);

        for (let i = 1; i < rows.length; i++) {
            console.log(`Row ${i} Length:`, rows[i].length);
            console.log(`Row ${i} Last element (supposedly JSON):`, rows[i][rows[i].length - 1].substring(0, 50) + '...');
            console.log(`Row ${i} Col 35 (index 34):`, rows[i][34] ? 'EXISTS' : 'EMPTY');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

debug();
