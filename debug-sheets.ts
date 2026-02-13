import { getAllStudents } from './src/lib/googleSheets';

async function debug() {
    console.log('Fetching students...');
    try {
        const students = await getAllStudents();
        console.log(`Found ${students.length} valid students.`);
        if (students.length > 0) {
            console.log('First student:', students[0].personalDetails.name);
        } else {
            console.log('No valid students found. This suggests JSON parsing is still failing or rows are empty.');
        }
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

debug();
