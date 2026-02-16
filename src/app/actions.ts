'use server';

import { appendStudent, checkExistingSubmission, getDeadline } from '@/lib/googleSheets';
import { applicationSchema } from '@/lib/schemas';
import { StudentApplication } from '@/lib/types';

export interface SubmitResult {
    success: boolean;
    message: string;
    errors?: Record<string, string>;
}

// Helper for exponential backoff retry
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;

        // Wait for delay
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry with exponential backoff (double the delay)
        return withRetry(fn, retries - 1, delay * 2);
    }
}

export async function submitApplication(data: unknown): Promise<SubmitResult> {
    try {
        // Check Deadline
        const deadline = await getDeadline();
        if (deadline && new Date() > new Date(deadline)) {
            return { success: false, message: "Applications are closed." };
        }

        // Validate with Zod
        const parsed = applicationSchema.safeParse(data);
        if (!parsed.success) {
            const errors: Record<string, string> = {};
            parsed.error.issues.forEach((issue) => {
                const path = issue.path.join('.');
                errors[path] = issue.message;
            });
            return { success: false, message: 'Validation failed. Please check your inputs.', errors };
        }

        const application: StudentApplication = {
            ...parsed.data,
            consentGiven: parsed.data.consentGiven as boolean,
            submittedAt: new Date().toISOString(),
        };

        // Check for duplicate entry (Triple Check: Reg No, Email, Mobile)
        const dupCheck = await checkExistingSubmission({
            registerNumber: application.personalDetails.registerNumber,
            email: application.personalDetails.personalEmail,
            mobile: application.personalDetails.mobileNumber
        });

        if (dupCheck.exists) {
            return {
                success: false,
                message: `An application with this ${dupCheck.field} already exists. Each student can only submit once.`,
            };
        }

        // Submit to Google Sheets with Retry Logic
        await withRetry(() => appendStudent(application));

        return {
            success: true,
            message: 'Application submitted successfully! Your profile is now live.',
        };
    } catch (error) {
        console.error('Submit error:', error);

        // If Google Sheets isn't configured yet, still save locally (for development)
        if (error instanceof Error && error.message.includes('credentials not configured')) {
            return {
                success: false,
                message: 'Google Sheets is not configured yet. Please set up your .env.local file with the required credentials.',
            };
        }

        return {
            success: false,
            message: 'An unexpected error occurred. Please try again.',
        };
    }
}
