import { getAllStudents } from './src/lib/googleSheets';
import { rankStudents } from './src/lib/ranking';

async function debug() {
    console.log('Fetching students...');
    try {
        const students = await getAllStudents();
        console.log(`Found ${students.length} raw students in sheet.`);

        const ranked = rankStudents(students);
        console.log(`Ranked ${ranked.length} students.`);

        if (ranked.length > 0) {
            console.log('Top ranked student:', ranked[0].name, 'Score:', ranked[0].totalScore);
        } else if (students.length > 0) {
            console.log('WARNING: students found in sheet but 0 were ranked. Check ranking.ts filter logic.');
        }
    } catch (error) {
        console.error('Error in debug script:', error);
    }
}

debug();
