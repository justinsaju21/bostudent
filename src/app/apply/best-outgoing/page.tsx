'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { applicationSchema, ApplicationFormData } from '@/lib/schemas';
import { submitApplication, SubmitResult } from '@/app/actions';
import Navbar from '@/components/Navbar';
import {
    PersonalDetailsStep,
    AcademicStep,
    TechnicalStep,
    AchievementsStep,
    FinalStep,
    FormDataLists,
} from '@/components/FormSteps';
import {
    User,
    GraduationCap,
    Code,
    Trophy,
    Send,
    ChevronLeft,
    ChevronRight,
    Check,
    Loader2,
    X,
} from 'lucide-react';
import Link from 'next/link';



const STEPS = [
    { id: 0, label: 'Personal', icon: User },
    { id: 1, label: 'Academic', icon: GraduationCap },
    { id: 2, label: 'Technical', icon: Code },
    { id: 3, label: 'Achievements', icon: Trophy },
    { id: 4, label: 'Submit', icon: Send },
];

export default function BestOutgoingForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<SubmitResult | null>(null);
    const [deadlinePassed, setDeadlinePassed] = useState(false);
    const [isLoadingDeadline, setIsLoadingDeadline] = useState(true);

    const form = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationSchema) as any,
        defaultValues: {
            personalDetails: {
                name: '', registerNumber: '', department: '', specialization: '',
                personalEmail: '', srmEmail: '', mobileNumber: '', profilePhotoUrl: '',
                facultyAdvisor: '', section: '',
            },
            academicRecord: {
                cgpa: 0, tenthPercentage: 0, twelfthPercentage: 0,
                historyOfArrears: false, numberOfArrears: 0,
            },
            postCollegeStatus: { status: 'placed', placedCompany: '', offerLetterLink: '' },
            internships: [],
            projects: [],
            hackathons: [],
            research: [],
            entrepreneurship: [],
            certifications: [],
            competitiveExams: [],
            sportsOrCultural: [],
            volunteering: [],
            scholarships: [],
            clubActivities: [],
            departmentContributions: [],
            professionalMemberships: [],
            references: [],
            socialMedia: { linkedin: '', github: '', twitter: '', instagram: '', website: '', others: [] },
            futureGoal: { description: '' },
            videoPitchUrl: '',
            masterProofFolderUrl: '',
            consentGiven: false as unknown as true,
        },
        mode: 'onTouched',
    });

    // Check deadline
    React.useEffect(() => {
        fetch('/api/deadline')
            .then(res => res.json())
            .then(data => {
                if (data.deadline && new Date() > new Date(data.deadline)) {
                    setDeadlinePassed(true);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoadingDeadline(false));
    }, []);

    // Load draft
    React.useEffect(() => {
        const saved = localStorage.getItem('bo-student-draft');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                form.reset(data);
            } catch (e) {
                console.error('Failed to parse draft', e);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save draft
    React.useEffect(() => {
        const subscription = form.watch((value) => {
            localStorage.setItem('bo-student-draft', JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }, [form]);

    const { register, control, formState: { errors }, handleSubmit, trigger } = form;

    const nextStep = async () => {
        const stepFields = getStepFields(currentStep);
        const isValid = await trigger(stepFields as (keyof ApplicationFormData)[]);
        if (isValid && currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const onSubmit = async (data: ApplicationFormData) => {
        setIsSubmitting(true);
        try {
            const res = await submitApplication(data);
            setResult(res);
        } catch {
            setResult({ success: false, message: 'An unexpected error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };



    if (isLoadingDeadline) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-app)' }}>
                <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
            </div>
        );
    }

    if (deadlinePassed) {
        return (
            <>
                <Navbar />
                <main style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}
                    >
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto',
                        }}>
                            <X size={40} color="#DC2626" />
                        </div>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>
                            Applications Closed
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                            The deadline for the Best Outgoing Student application has passed. We are no longer accepting new submissions.
                        </p>
                        <Link href="/apply" style={{ textDecoration: 'none' }}>
                            <button className="btn-secondary">Back to Awards</button>
                        </Link>
                    </motion.div>
                </main>
            </>
        );
    }

    // Success screen
    if (result?.success) {
        return (
            <>
                <Navbar />
                <main style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}
                    >
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto',
                        }}>
                            <Check size={40} color="white" />
                        </div>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>
                            Application Submitted!
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                            Your Best Outgoing Student application has been submitted successfully. Faculty can now view and evaluate your profile.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/apply" style={{ textDecoration: 'none' }}>
                                <button className="btn-secondary">Apply for More Awards</button>
                            </Link>
                            <Link href="/" style={{ textDecoration: 'none' }}>
                                <button className="btn-secondary">Back to Home</button>
                            </Link>
                        </div>
                    </motion.div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '80px', padding: '80px 24px 60px 24px', maxWidth: '1000px', margin: '0 auto' }}>
                {/* Award badge */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span style={{
                        display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
                        background: 'rgba(3, 77, 161, 0.1)', color: '#034DA1', fontSize: '0.85rem', fontWeight: 600,
                    }}>
                        🏆 Best Outgoing Student Award
                    </span>
                </div>

                {/* Step Indicator */}
                <div className="step-indicator" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                    {STEPS.map((step, i) => (
                        <React.Fragment key={step.id}>
                            <div
                                className={`step ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
                                onClick={() => { if (i < currentStep) setCurrentStep(i); }}
                                style={{ cursor: i < currentStep ? 'pointer' : 'default' }}
                            >
                                <span className="step-number">
                                    {i < currentStep ? <Check size={12} /> : i + 1}
                                </span>
                                <span className="hidden sm:inline">{step.label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`step-connector ${i < currentStep ? 'active' : ''}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit as any)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
                            e.preventDefault();
                            if (currentStep < STEPS.length - 1) {
                                nextStep();
                            }
                        }
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentStep === 0 && <PersonalDetailsStep register={register} errors={errors} control={control as any} />}
                            {currentStep === 1 && <AcademicStep register={register} errors={errors} control={control as any} />}
                            {currentStep === 2 && <TechnicalStep register={register} errors={errors} control={control as any} />}
                            {currentStep === 3 && <AchievementsStep register={register} errors={errors} control={control as any} />}
                            {currentStep === 4 && <FinalStep register={register} errors={errors} control={control as any} />}
                        </motion.div>
                    </AnimatePresence>

                    {/* Error display */}
                    {result && !result.success && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                marginTop: '20px', padding: '16px', borderRadius: 'var(--radius-sm)',
                                background: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.2)',
                                color: '#DC2626', fontSize: '14px',
                            }}
                        >
                            {result.message}
                        </motion.div>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', gap: '16px' }}>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            style={{ opacity: currentStep === 0 ? 0.3 : 1 }}
                        >
                            <ChevronLeft size={18} /> Previous
                        </button>

                        {currentStep < STEPS.length - 1 ? (
                            <button
                                key="next-step-btn"
                                type="button"
                                className="btn-primary"
                                onClick={nextStep}
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                key="submit-application-btn"
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                                ) : (
                                    <><Send size={18} /> Submit Application</>
                                )}
                            </button>
                        )}
                    </div>
                </form>
                <FormDataLists />
            </main>
        </>
    );
}

function getStepFields(step: number): string[] {
    switch (step) {
        case 0: return ['personalDetails'];
        case 1: return ['academicRecord', 'postCollegeStatus'];
        case 2: return ['internships', 'projects', 'hackathons'];
        case 3: return ['research', 'entrepreneurship', 'certifications', 'competitiveExams', 'sportsOrCultural', 'volunteering', 'scholarships', 'clubActivities', 'departmentContributions', 'professionalMemberships', 'references'];
        case 4: return ['socialMedia', 'futureGoal', 'videoPitchUrl', 'consentGiven'];
        default: return [];
    }
}
