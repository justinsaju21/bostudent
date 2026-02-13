import { getStudentByRegNo } from '@/lib/googleSheets';
import { notFound } from 'next/navigation';
import PortfolioClient from './PortfolioClient';

interface PageProps {
    params: Promise<{ reg_no: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { reg_no } = await params;
    try {
        const student = await getStudentByRegNo(reg_no);
        if (!student) return { title: 'Student Not Found' };
        return {
            title: `${student.personalDetails.name} | Best Outgoing Student`,
            description: `Portfolio of ${student.personalDetails.name} - ${student.personalDetails.department}`,
        };
    } catch {
        return { title: `${reg_no} | Best Outgoing Student` };
    }
}

export default async function PortfolioPage({ params }: PageProps) {
    const { reg_no } = await params;

    let student;
    try {
        student = await getStudentByRegNo(reg_no);
    } catch (error) {
        console.error('Error fetching student:', error);
        // For development: show a placeholder if Sheets isn't configured
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
                <div>
                    <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', marginBottom: '12px' }}>
                        Google Sheets Not Configured
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                        To view student portfolios, please configure your Google Sheets credentials in <code>.env.local</code>.
                    </p>
                </div>
            </div>
        );
    }

    if (!student) {
        notFound();
    }

    return <PortfolioClient student={student} />;
}
