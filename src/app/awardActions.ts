'use server';

import { AwardSlug, getAwardBySlug } from '@/lib/awards';
import { getSchemaForAward } from '@/lib/awardSchemas';
import { appendAwardApplication, checkAwardDuplicate } from '@/lib/awardSheets';

export interface AwardSubmitResult {
    success: boolean;
    message: string;
    errors?: Record<string, string>;
}

// Exponential backoff retry
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return withRetry(fn, retries - 1, delay * 2);
    }
}

export async function submitAwardApplication(slug: AwardSlug, data: unknown): Promise<AwardSubmitResult> {
    try {
        const award = getAwardBySlug(slug);
        if (!award) {
            return { success: false, message: 'Unknown award category.' };
        }

        // For best-outgoing, redirect to existing flow
        if (slug === 'best-outgoing') {
            return { success: false, message: 'Best Outgoing Student uses the main application form.' };
        }

        // Validate with the award-specific Zod schema
        const schema = getSchemaForAward(slug);
        if (!schema) {
            return { success: false, message: 'No schema found for this award.' };
        }

        const parsed = schema.safeParse(data);
        if (!parsed.success) {
            const errors: Record<string, string> = {};
            parsed.error.issues.forEach((issue) => {
                const path = issue.path.join('.');
                errors[path] = issue.message;
            });
            return { success: false, message: 'Validation failed. Please check your inputs.', errors };
        }

        const application = {
            ...parsed.data,
            submittedAt: new Date().toISOString(),
        };

        // Check for duplicates
        const pd = (application as { personalDetails: { registerNumber: string; personalEmail: string; mobileNumber: string } }).personalDetails;
        const dupCheck = await checkAwardDuplicate(slug, pd.registerNumber, pd.personalEmail, pd.mobileNumber);

        if (dupCheck.exists) {
            return {
                success: false,
                message: `An application with this ${dupCheck.field} already exists for the ${award.title} award. Each student can only submit once per award.`,
            };
        }

        // Submit with retry
        await withRetry(() => appendAwardApplication(slug, application as Record<string, unknown>));

        return {
            success: true,
            message: `Your ${award.title} application has been submitted successfully!`,
        };
    } catch (error) {
        console.error('Award submit error:', error);
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
}
