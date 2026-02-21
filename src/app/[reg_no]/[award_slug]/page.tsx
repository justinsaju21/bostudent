import { getAllAwardApplications } from '@/lib/awardSheets';
import { AwardSlug, getAwardBySlug } from '@/lib/awards';
import { notFound } from 'next/navigation';
import CustomAwardClient from './CustomAwardClient';

interface PageProps {
    params: Promise<{ reg_no: string; award_slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { reg_no, award_slug } = await params;
    const award = getAwardBySlug(award_slug as AwardSlug);
    if (!award) return { title: 'Award Not Found' };

    return {
        title: `${reg_no} | ${award.shortTitle}`,
        description: `Candidate portfolio for ${award.title}`,
    };
}

export default async function CustomAwardPage({ params }: PageProps) {
    const { reg_no, award_slug } = await params;

    // Validate that it's a known custom award
    const award = getAwardBySlug(award_slug as AwardSlug);
    if (!award || award.slug === 'best-outgoing') {
        notFound();
    }

    try {
        const applications = await getAllAwardApplications(award.slug);

        // Find candidate by reg_no
        const student = applications.find(a =>
            (a as any).personalDetails?.registerNumber?.toUpperCase() === reg_no.toUpperCase()
        );

        if (!student) {
            notFound();
        }

        return <CustomAwardClient student={student} award={award} />;
    } catch (error) {
        console.error('Error fetching custom award portfolio:', error);
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
                <div>
                    <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', marginBottom: '12px' }}>
                        Google Sheets Not Configured
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                        To view portfolios, please configure your Google Sheets credentials in <code>.env.local</code>.
                    </p>
                </div>
            </div>
        );
    }
}
