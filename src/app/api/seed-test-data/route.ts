import { NextResponse } from 'next/server';
import { appendStudent, checkDuplicateRegNo } from '@/lib/googleSheets';
import { StudentApplication } from '@/lib/types';

// Simple UUID generator
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ===== MOCK DATA MATCHING FORM CONSTRAINTS =====
// Department: "Electronics and Communication Engineering" (only option in dropdown)
// Register Number: Must match /^RA\d+$/i
// SRM Email: Must end with @srmist.edu.in
// Social Media URLs: Must be valid https:// URLs
// Sports level: 'zone' | 'district' | 'state' | 'national' | 'international'
// Research indexStatus: 'scopus' | 'sci' | 'ugc' | 'other' | 'none'
// Research publicationStatus: 'filed' | 'published' | 'granted' | 'under_review'
// Post-college status: 'placed' | 'higher_studies' | 'entrepreneur' | 'unplaced' | 'other'
// Company names: from TOP_COMPANIES list in FormSteps
// Hackathon names: from TOP_HACKATHONS list in FormSteps
// Volunteering orgs: from TOP_VOLUNTEERING_ORGS list in FormSteps

const MOCK_STUDENTS: StudentApplication[] = [
    // ===== STUDENT 1: Research-focused topper =====
    {
        personalDetails: {
            name: "Alice Mehra",
            registerNumber: "RA2211053010001",
            department: "Electronics and Communication Engineering",
            specialization: "VLSI Design",
            personalEmail: "alice.mehra@gmail.com",
            srmEmail: "am1234@srmist.edu.in",
            mobileNumber: "9876543210",
            profilePhotoUrl: "https://ui-avatars.com/api/?name=Alice+Mehra&background=4F46E5&color=fff"
        },
        academicRecord: {
            cgpa: 9.8,
            tenthPercentage: 95,
            twelfthPercentage: 94,
            historyOfArrears: false
        },
        postCollegeStatus: {
            status: "higher_studies",
            universityName: "Stanford University",
            otherDetails: "Accepted for MS in EE"
        },
        internships: [
            {
                id: uuid(),
                company: "Texas Instruments",
                role: "VLSI Design Intern",
                startDate: "2024-05-01",
                endDate: "2024-07-31",
                certificateLink: "https://drive.google.com/cert-alice-ti",
                description: "Designed low-power ASIC blocks for automotive chips."
            },
            {
                id: uuid(),
                company: "Intel",
                role: "Research Intern",
                startDate: "2023-12-01",
                endDate: "2024-02-28",
                certificateLink: "https://drive.google.com/cert-alice-intel",
                description: "Worked on next-gen FPGA architectures."
            }
        ],
        projects: [
            {
                id: uuid(),
                title: "Low-Power Neural Accelerator",
                techStack: "Verilog, Cadence Virtuoso, Python",
                description: "Designed a custom neural network accelerator achieving 3x power efficiency over baseline.",
                githubLink: "https://github.com/alicemehra/neural-accel"
            }
        ],
        hackathons: [],
        research: [
            {
                id: uuid(),
                title: "Novel Low-Power SRAM Cell Design for IoT Applications",
                journalOrConference: "IEEE TCAS-I",
                indexStatus: "sci",
                publicationStatus: "published",
                link: "https://doi.org/10.1109/alice-sram"
            },
            {
                id: uuid(),
                title: "Energy-Efficient Neuromorphic Computing Architecture",
                journalOrConference: "IEEE ISCAS 2025",
                indexStatus: "scopus",
                publicationStatus: "under_review"
            }
        ],
        entrepreneurship: [],
        certifications: [
            {
                id: uuid(),
                provider: "Cadence",
                certificateName: "Certified Virtuoso Layout Designer",
                proofLink: "https://drive.google.com/cert-alice-cadence"
            }
        ],
        competitiveExams: [
            {
                id: uuid(),
                examName: "GRE",
                scoreOrRank: "335/340"
            },
            {
                id: uuid(),
                examName: "GATE",
                scoreOrRank: "AIR 42"
            }
        ],
        sportsOrCultural: [],
        volunteering: [
            {
                id: uuid(),
                organization: "IEEE Humanitarian",
                role: "Tech Educator",
                hoursServed: 40,
                impact: "Taught basic electronics to 200+ rural school students."
            }
        ],
        scholarships: [
            {
                id: uuid(),
                name: "Chancellor's Merit Scholarship",
                awardingBody: "SRMIST",
                amountOrPrestige: "Full tuition waiver"
            }
        ],
        clubActivities: [],
        departmentContributions: [
            {
                id: uuid(),
                eventName: "ECE Tech Fest 2024",
                role: "Technical Head",
                contributionDescription: "Organized workshops on FPGA design for 300+ students."
            }
        ],
        references: [
            {
                id: uuid(),
                facultyName: "Dr. Ramesh Kumar",
                contact: "ramesh.k@srmist.edu.in"
            }
        ],
        socialMedia: {
            linkedin: "https://linkedin.com/in/alicemehra",
            github: "https://github.com/alicemehra"
        },
        futureGoal: { description: "Pursue a PhD in VLSI systems and contribute to next-generation low-power computing architectures for sustainable electronics." },
        videoPitchUrl: "https://youtube.com/watch?v=alice-pitch",
        masterProofFolderUrl: "https://drive.google.com/alice-proofs",
        consentGiven: true,
        submittedAt: new Date().toISOString()
    },

    // ===== STUDENT 2: Hackathon-focused builder =====
    {
        personalDetails: {
            name: "Bob Krishnan",
            registerNumber: "RA2211053010002",
            department: "Electronics and Communication Engineering",
            specialization: "Embedded Systems",
            personalEmail: "bob.krishnan@gmail.com",
            srmEmail: "bk5678@srmist.edu.in",
            mobileNumber: "9876543211",
            profilePhotoUrl: "https://ui-avatars.com/api/?name=Bob+Krishnan&background=059669&color=fff"
        },
        academicRecord: {
            cgpa: 8.5,
            tenthPercentage: 90,
            twelfthPercentage: 88,
            historyOfArrears: false
        },
        postCollegeStatus: {
            status: "placed",
            placedCompany: "Qualcomm",
            offerLetterLink: "https://drive.google.com/bob-offer"
        },
        internships: [
            {
                id: uuid(),
                company: "Qualcomm",
                role: "Embedded Systems Intern",
                startDate: "2024-01-01",
                endDate: "2024-06-30",
                certificateLink: "https://drive.google.com/cert-bob-qualcomm",
                description: "Developed firmware for 5G modem chipsets."
            },
            {
                id: uuid(),
                company: "Bosch",
                role: "IoT Developer Intern",
                startDate: "2023-05-01",
                endDate: "2023-07-31",
                certificateLink: "https://drive.google.com/cert-bob-bosch"
            }
        ],
        projects: [
            {
                id: uuid(),
                title: "Smart Agriculture Drone",
                techStack: "STM32, ROS, Python, Computer Vision",
                description: "Built an autonomous drone for crop health monitoring using NDVI imaging and real-time data relay.",
                githubLink: "https://github.com/bobk/agri-drone",
                deployedLink: "https://agridrone.vercel.app"
            },
            {
                id: uuid(),
                title: "BLE Mesh Network for Smart Campus",
                techStack: "nRF52, Zephyr RTOS, React Native",
                description: "Created Bluetooth mesh network for campus-wide IoT sensor deployment with mobile dashboard."
            }
        ],
        hackathons: [
            {
                id: uuid(),
                name: "Smart India Hackathon (SIH)",
                projectBuilt: "Smart Grid Energy Monitor",
                teamSize: 6,
                position: "Winner",
                proofLink: "https://drive.google.com/bob-sih"
            },
            {
                id: uuid(),
                name: "HackMIT",
                projectBuilt: "Real-time Air Quality Dashboard",
                teamSize: 4,
                position: "Finalist"
            },
            {
                id: uuid(),
                name: "IEEE Xtreme",
                projectBuilt: "Embedded CI/CD Pipeline",
                teamSize: 3,
                position: "Top 100 Global"
            }
        ],
        research: [],
        entrepreneurship: [],
        certifications: [
            {
                id: uuid(),
                provider: "ARM",
                certificateName: "ARM Cortex-M Developer",
                proofLink: "https://drive.google.com/cert-bob-arm"
            },
            {
                id: uuid(),
                provider: "AWS",
                certificateName: "AWS IoT Core Specialty",
                validationId: "AWS-IOT-BOB-2024"
            }
        ],
        competitiveExams: [],
        sportsOrCultural: [],
        volunteering: [],
        scholarships: [],
        clubActivities: [
            {
                id: uuid(),
                clubName: "SRM Robotics Club",
                position: "Technical Lead",
                keyEventsOrganized: "RoboWars 2024, IoT Workshop Series",
                impactDescription: "Led a team of 25 members, organized 4 major events."
            }
        ],
        departmentContributions: [],
        references: [
            {
                id: uuid(),
                facultyName: "Prof. Lakshmi Narayanan",
                contact: "lakshmi.n@srmist.edu.in"
            }
        ],
        socialMedia: {
            linkedin: "https://linkedin.com/in/bobkrishnan",
            github: "https://github.com/bobk",
            twitter: "https://x.com/bobkrishnan"
        },
        futureGoal: { description: "Work on cutting-edge embedded systems at Qualcomm and eventually build a startup focused on affordable IoT solutions for Indian agriculture." },
        videoPitchUrl: "https://youtube.com/watch?v=bob-pitch",
        consentGiven: true,
        submittedAt: new Date().toISOString()
    },

    // ===== STUDENT 3: Sports + Volunteering =====
    {
        personalDetails: {
            name: "Charlie Fernandez",
            registerNumber: "RA2211053010003",
            department: "Electronics and Communication Engineering",
            specialization: "Communication Systems",
            personalEmail: "charlie.fern@gmail.com",
            srmEmail: "cf9012@srmist.edu.in",
            mobileNumber: "9876543212",
            profilePhotoUrl: "https://ui-avatars.com/api/?name=Charlie+F&background=DC2626&color=fff"
        },
        academicRecord: {
            cgpa: 7.9,
            tenthPercentage: 85,
            twelfthPercentage: 80,
            historyOfArrears: true,
            numberOfArrears: 1
        },
        postCollegeStatus: {
            status: "entrepreneur",
            otherDetails: "Co-founding a sports-tech startup"
        },
        internships: [
            {
                id: uuid(),
                company: "Samsung",
                role: "RF Engineering Intern",
                startDate: "2024-06-01",
                endDate: "2024-08-31",
                certificateLink: "https://drive.google.com/cert-charlie-samsung",
                description: "Tested 5G antenna patterns for flagship smartphones."
            }
        ],
        projects: [
            {
                id: uuid(),
                title: "Smart Sports Analytics Band",
                techStack: "ESP32, TensorFlow Lite, Flutter",
                description: "Wearable device that tracks athlete performance metrics using IMU sensors and provides AI-driven coaching insights."
            }
        ],
        hackathons: [
            {
                id: uuid(),
                name: "Hack The Box",
                projectBuilt: "Cybersecurity Training Gamification",
                teamSize: 4,
                position: "2nd Place"
            }
        ],
        research: [],
        entrepreneurship: [
            {
                id: uuid(),
                startupName: "FitPro Analytics",
                registrationDetails: "DPIIT recognized startup",
                revenueOrFundingStatus: "Seed funded - ₹5L from SRM incubator",
                description: "AI-powered sports performance analytics platform for athletes.",
                proofLink: "https://drive.google.com/charlie-fitpro"
            }
        ],
        certifications: [],
        competitiveExams: [],
        sportsOrCultural: [
            {
                id: uuid(),
                eventName: "All India Inter-University Badminton",
                level: "national",
                positionWon: "Silver Medal",
                proofLink: "https://drive.google.com/charlie-badminton"
            },
            {
                id: uuid(),
                eventName: "South Zone Inter-University Cricket",
                level: "state",
                positionWon: "Team Captain - Runners Up"
            },
            {
                id: uuid(),
                eventName: "SRM Cultural Fest - Western Dance",
                level: "district",
                positionWon: "1st Prize"
            }
        ],
        volunteering: [
            {
                id: uuid(),
                organization: "NSS",
                role: "Unit Leader",
                hoursServed: 120,
                impact: "Led rural adoption drive benefiting 500+ families.",
                proofLink: "https://drive.google.com/charlie-nss"
            },
            {
                id: uuid(),
                organization: "Rotaract Club",
                role: "Events Coordinator",
                hoursServed: 60,
                impact: "Organized blood donation camps collecting 200+ units."
            }
        ],
        scholarships: [
            {
                id: uuid(),
                name: "Sports Excellence Award",
                awardingBody: "SRMIST",
                amountOrPrestige: "₹50,000 annual scholarship"
            }
        ],
        clubActivities: [
            {
                id: uuid(),
                clubName: "SRM Sports Council",
                position: "General Secretary",
                keyEventsOrganized: "Milan Sports Fest 2024, Inter-Dept League",
                impactDescription: "Managed sports budget of ₹10L, coordinated 15+ events."
            }
        ],
        departmentContributions: [
            {
                id: uuid(),
                eventName: "ECE Sports Day",
                role: "Chief Organizer",
                contributionDescription: "Organized annual ECE sports day with 400+ participants."
            }
        ],
        references: [
            {
                id: uuid(),
                facultyName: "Dr. Priya Sharma",
                contact: "priya.s@srmist.edu.in"
            }
        ],
        socialMedia: {
            linkedin: "https://linkedin.com/in/charliefern",
            instagram: "https://instagram.com/charlie.sports"
        },
        futureGoal: { description: "Scale FitPro Analytics into India's leading sports-tech platform, combining my passion for athletics with technology to make professional coaching accessible to all." },
        videoPitchUrl: "https://youtube.com/watch?v=charlie-pitch",
        masterProofFolderUrl: "https://drive.google.com/charlie-proofs",
        consentGiven: true,
        submittedAt: new Date().toISOString()
    }
];

export async function GET() {
    try {
        let count = 0;
        const skipped: string[] = [];

        for (const student of MOCK_STUDENTS) {
            // Check for duplicates before inserting
            const exists = await checkDuplicateRegNo(student.personalDetails.registerNumber);
            if (exists) {
                skipped.push(student.personalDetails.registerNumber);
                continue;
            }
            await appendStudent(student);
            count++;
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${count} students.${skipped.length > 0 ? ` Skipped ${skipped.length} duplicates: ${skipped.join(', ')}` : ''}`
        });
    } catch (error) {
        console.error("Seeding failed:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
