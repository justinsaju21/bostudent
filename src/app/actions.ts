'use server';

import { appendStudent, checkDuplicateRegNo, getDeadline } from '@/lib/googleSheets';
import { applicationSchema } from '@/lib/schemas';
import { StudentApplication } from '@/lib/types';

export interface SubmitResult {
    success: boolean;
    message: string;
    errors?: Record<string, string>;
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

        // Check for duplicate register number
        const isDuplicate = await checkDuplicateRegNo(application.personalDetails.registerNumber);
        if (isDuplicate) {
            return {
                success: false,
                message: `An application with register number ${application.personalDetails.registerNumber} already exists.`,
            };
        }

        // Submit to Google Sheets
        await appendStudent(application);

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
