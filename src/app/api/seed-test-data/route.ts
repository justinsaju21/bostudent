import { NextRequest, NextResponse } from 'next/server';
import { clearAllStudents, addStudentsBatch } from '@/lib/googleSheets';
import { StudentApplication } from '@/lib/types';

// Simple UUID generator
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const DEPARTMENTS = ["Electronics & Communication Engineering"];
const SECTIONS = ["A", "B", "C", "D", "E", "F"];
const ADVISORS = ["Dr. Ramesh Kumar", "Dr. Priya Sharma", "Prof. Lakshmi Narayanan", "Dr. A. Smith", "Prof. R. Johnson", "Dr. K. Lee", "Dr. S. Nair"];
const SPECIALIZATIONS = ["VLSI Design", "Embedded Systems", "Communication Systems", "Signal Processing", "Robotics & Automation", "Internet of Things"];

const COMPANIES = ["Texas Instruments", "Intel", "Qualcomm", "NVIDIA", "Analog Devices", "Samsung", "Google", "Microsoft", "TCS", "Infosys", "Wipro", "Amazon", "Tesla", "Apple"];

// --- REAL LOOKING DATA POOLS ---

const INTERNSHIP_POOL = [
    { company: "Texas Instruments", role: "Analog Design Intern", desc: "Simulation and verification of low-dropout (LDO) regulators using Cadence Virtuoso. Optimized power consumption by 15%." },
    { company: "Intel", role: "Silicon Validation Intern", desc: "Automated post-silicon validation tests using Python and Perl for 13th Gen processors." },
    { company: "Qualcomm", role: "Modem Software Intern", desc: "Implemented L1 layer features for 5G NR modem firmware. Debugged latency issues in high-speed data paths." },
    { company: "NVIDIA", role: "Hardware Engineering Intern", desc: "Assisted in the design of high-speed memory interfaces for next-gen GPU architectures." },
    { company: "Robert Bosch", role: "Automotive Electronics Intern", desc: "Developed firmware for body control modules and conducted HIL (Hardware-in-the-Loop) testing." },
    { company: "Analog Devices", role: "System Applications Intern", desc: "Designed PCB layouts for high-precision sensor evaluation boards." },
    { company: "Samsung Semiconductors", role: "Memory Design Intern", desc: "Contributed to the design of high-speed SRAM blocks for mobile SOCs." },
    { company: "TCS Research", role: "Computer Vision Intern", desc: "Developed deep learning models for anomaly detection in industrial manufacturing lines." },
    { company: "ISRO", role: "Payload Electronics Intern", desc: "Designed telemetry circuits for small satellite payloads under the guidance of senior scientists." },
    { company: "DRDO", role: "Signal Processing Intern", desc: "Implemented RADAR signal processing algorithms on FPGA using Xilinx Vivado." }
];

const PROJECT_POOL = [
    { title: "Autonomous Indoor Navigation Bot", stack: "ROS, Raspberry Pi, LiDAR, Python", desc: "Built a robot capable of SLAM (Simultaneous Localization and Mapping) in unknown indoor environments." },
    { title: "Smart Energy Meter using LoRaWAN", stack: "ESP32, LoRa, Node.js, Grafana", desc: "A long-range wireless energy monitoring system for rural areas with real-time billing dashboard." },
    { title: "Wearable Health Monitor for Elderly", stack: "Arduino, BLE, Flutter, Firebase", desc: "Detects falls and monitors heart rate/oxygen levels, sending instant alerts to caregivers." },
    { title: "FPGA based Image Processor", stack: "Verilog, Zybo Z7, MATLAB", desc: "Real-time edge detection and noise filtering of VGA video feed using custom hardware accelerators." },
    { title: "LoRa based Wildlife Tracker", stack: "LoRa, GPS, Solar Harvesting", desc: "Low-power tracker designed to last 2 years on field for monitoring elephant movement patterns." },
    { title: "ASIC Design of 16-bit RISC-V Core", stack: "Verilog, Synopsys Design Compiler", desc: "Completed the full RTL-to-GDSII flow for a custom RISC-V base integer instruction set." },
    { title: "Smart Traffic Management via AI", stack: "Python, OpenCV, Jetson Nano", desc: "Identifies traffic density and dynamically controls signal timing to reduce congestion." },
    { title: "Underwater Wireless Communication", stack: "Ultrasonic Sensors, OFDM, MATLAB", desc: "Research project implementing acoustic communication for underwater sensor networks." }
];

const RESEARCH_POOL = [
    { title: "Novel Energy Harvesting for Body Area Networks", journal: "IEEE Sensors Letters", index: "sci", status: "published" },
    { title: "Comparative Analysis of FinFET at 7nm node", journal: "Journal of Nanoelectronics", index: "scopus", status: "published" },
    { title: "Deep Learning for SAR Image Denoising", journal: "IEEE Geoscience and Remote Sensing", index: "sci", status: "under_review" },
    { title: "IoT Security: A Blockchain Based Approach", journal: "ICCC 2024 Conference", index: "scopus", status: "published" },
    { title: "Low Power VLSI Architecture for FFT", journal: "IEEE Access", index: "sci", status: "published" },
    { title: "Design of Reconfigurable Antenna for 5G", journal: "EuCAP 2025", index: "scopus", status: "granted" }
];

const HACKATHON_POOL = [
    { name: "Smart India Hackathon (SIH)", project: "AI for Water Management", pos: "Winner (Grand Finale)" },
    { name: "IEEE Xtreme 18.0", project: "Competitive Programming", pos: "Global Rank 42" },
    { name: "HackMIT", project: "Accessibility Tech for Blind", pos: "Top 10 Finalist" },
    { name: "Intel AI Global Impact Festival", project: "Edge AI for Healthcare", pos: "Regional Winner" },
    { name: "Microsoft Imagine Cup", project: "Sustainable Agriculture Tech", pos: "National Finalist" },
    { name: "NASA Apps Challenge", project: "Satellite Data Visualization", pos: "Global Nominee" }
];

const MEMBERSHIP_ORGS = [
    { name: "IEEE", roles: ["Student Chair", "Secretary", "Technical Lead", "Student Member"] },
    { name: "ACM", roles: ["Ambassador", "Vice Chair", "Core Member"] },
    { name: "IETE", roles: ["Student Coordinator", "Member"] },
    { name: "Optica", roles: ["Chapter President", "Outreach Head"] },
    { name: "CSI", roles: ["Executive Member", "Web Master"] }
];

const NAMES = [
    "Aarav", "Ananya", "Ishaan", "Diya", "Arjun", "Kavya", "Rohan", "Sanya", "Vikram", "Anjali",
    "Kabir", "Ishita", "Aditya", "Meera", "Siddharth", "Pooja", "Varun", "Riya", "Akash", "Tara"
];
const SURNAMES = [
    "Sharma", "Verma", "Iyer", "Nair", "Gupta", "Malhotra", "Reddy", "Patel", "Singh", "Das",
    "Joshi", "Kulkarni", "Chopra", "Bose", "Menon", "Kapoor", "Khan", "Deshmukh", "Pillai", "Aggarwal"
];

// --- HELPER FUNCTIONS ---

function getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getMultipleRandom<T>(arr: T[], max: number): T[] {
    const count = Math.floor(Math.random() * max) + 1;
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateRealisticStudent(index: number): StudentApplication {
    const firstName = NAMES[index % NAMES.length];
    const lastName = SURNAMES[index % SURNAMES.length];
    const name = `${firstName} ${lastName}`;
    const regNo = `RA2211053010${(index + 100).toString()}`;
    const cgpa = 7.0 + (Math.random() * 2.9); // 7.0 to 9.9

    // Complex student profile
    const student: StudentApplication = {
        personalDetails: {
            name,
            registerNumber: regNo,
            department: DEPARTMENTS[0],
            specialization: SPECIALIZATIONS[index % SPECIALIZATIONS.length],
            personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            srmEmail: `${firstName[0].toLowerCase()}${lastName.toLowerCase()}${index}@srmist.edu.in`,
            mobileNumber: `9840${Math.floor(100000 + Math.random() * 899999)}`,
            facultyAdvisor: ADVISORS[index % ADVISORS.length],
            section: SECTIONS[index % SECTIONS.length],
            profilePhotoUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff&size=128`
        },
        academicRecord: {
            cgpa: parseFloat(cgpa.toFixed(2)),
            tenthPercentage: 85 + Math.floor(Math.random() * 14),
            twelfthPercentage: 80 + Math.floor(Math.random() * 18),
            historyOfArrears: Math.random() > 0.9,
            numberOfArrears: Math.random() > 0.9 ? 1 : 0
        },
        postCollegeStatus: {
            status: Math.random() > 0.3 ? "placed" : "higher_studies",
            placedCompany: Math.random() > 0.3 ? getRandom(COMPANIES) : undefined,
            universityName: Math.random() > 0.7 ? "Carnegie Mellon" : (Math.random() > 0.5 ? "SRM University" : undefined)
        },
        internships: getMultipleRandom(INTERNSHIP_POOL, 3).map(i => ({
            id: uuid(),
            company: i.company,
            role: i.role,
            startDate: "2024-05-01",
            endDate: "2024-07-31",
            certificateLink: "https://drive.google.com/proof-internship",
            description: i.desc
        })),
        projects: getMultipleRandom(PROJECT_POOL, 4).map(p => ({
            id: uuid(),
            title: p.title,
            techStack: p.stack,
            description: p.desc,
            githubLink: "https://github.com/example/student-project"
        })),
        hackathons: Math.random() > 0.3 ? getMultipleRandom(HACKATHON_POOL, 2).map(h => ({
            id: uuid(),
            name: h.name,
            projectBuilt: h.project,
            teamSize: Math.floor(Math.random() * 4) + 2,
            position: h.pos,
            proofLink: "https://drive.google.com/proof-hackathon"
        })) : [],
        research: Math.random() > 0.5 ? getMultipleRandom(RESEARCH_POOL, 2).map(r => ({
            id: uuid(),
            title: r.title,
            journalOrConference: r.journal,
            indexStatus: r.index as any,
            publicationStatus: r.status as any,
            link: "https://doi.org/example-paper"
        })) : [],
        entrepreneurship: index === 5 ? [{
            id: uuid(),
            startupName: "TechNova Solutions",
            description: "An AI consultancy startup helping small businesses adopt automation.",
            revenueOrFundingStatus: "Seed funded - 2 Lakhs"
        }] : [],
        certifications: getMultipleRandom(["AWS Solutions Architect", "TensorFlow Developer", "Certified VLSI Engineer", "NPTEL Embedded Systems"], 2).map(c => ({
            id: uuid(),
            provider: "Industry Recognized",
            certificateName: c,
            proofLink: "https://verify.com/cert"
        })),
        competitiveExams: index % 7 === 0 ? [{ id: uuid(), examName: "GATE", scoreOrRank: "98.5 Percentile" }] : [],
        sportsOrCultural: index % 6 === 0 ? [{
            id: uuid(),
            eventName: "Inter-College Cricket",
            level: "state",
            positionWon: "Runners Up"
        }] : [],
        volunteering: index % 4 === 0 ? [{
            id: uuid(),
            organization: "Nivedham NGO",
            role: "Volunteer Teacher",
            hoursServed: 50,
            impact: "Taught basic science to underprivileged children."
        }] : [],
        scholarships: index === 0 ? [{
            id: uuid(),
            name: "Performance Excellence",
            awardingBody: "SRMIST",
            amountOrPrestige: "Full Tuition Waiver"
        }] : [],
        clubActivities: [{
            id: uuid(),
            clubName: "SRM Tech Society",
            position: "Core Member",
            impactDescription: "Organized 3 workshops on IoT and Web Development."
        }],
        departmentContributions: index % 5 === 0 ? [{
            id: uuid(),
            eventName: " Milan 2024",
            role: "Technical Coordinator",
            contributionDescription: "Managed audio-visual systems for the entire department."
        }] : [],
        professionalMemberships: getMultipleRandom(MEMBERSHIP_ORGS, 2).map(m => ({
            id: uuid(),
            organization: m.name,
            role: getRandom(m.roles),
            membershipId: `ID-${Math.floor(Math.random() * 10000)}`
        })),
        references: [{
            id: uuid(),
            facultyName: getRandom(ADVISORS),
            contact: "faculty@srmist.edu.in"
        }],
        socialMedia: {
            linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
            github: `https://github.com/${firstName.toLowerCase()}${index}`
        },
        futureGoal: { description: "To work at the intersection of Hardware and AI to build smarter, sustainable robots." },
        videoPitchUrl: "https://youtube.com/watch?v=pitch",
        consentGiven: true,
        submittedAt: new Date().toISOString()
    };

    return student;
}

export async function GET(req: NextRequest) {
    // Block in production to prevent accidental data wipe
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'This endpoint is disabled in production' },
            { status: 403 }
        );
    }

    const { searchParams } = new URL(req.url);
    const clear = searchParams.get('clear') === 'true';

    try {
        if (clear) {
            console.log('Clearing existing students...');
            await clearAllStudents();
        }

        console.log('Generating 20 highly realistic students...');
        const students: StudentApplication[] = [];
        for (let i = 0; i < 20; i++) {
            students.push(generateRealisticStudent(i));
        }

        console.log('Batch inserting students...');
        await addStudentsBatch(students);

        return NextResponse.json({
            success: true,
            message: `Successfully ${clear ? 'cleared and ' : ''}seeded 20 highly realistic multi-achievement students.`
        });
    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to seed data',
            details: error?.message || String(error)
        }, { status: 500 });
    }
}
