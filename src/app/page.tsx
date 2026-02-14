'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  GraduationCap,
  Award,
  Users,
  ArrowRight,
  Briefcase,
  Code,
  BookOpen,
  Trophy,
  Heart,
  Star,
} from 'lucide-react';

const features = [
  { icon: Briefcase, title: 'Internships', desc: 'Track all your work experience' },
  { icon: Code, title: 'Projects', desc: 'Showcase technical projects' },
  { icon: BookOpen, title: 'Research', desc: 'Papers, patents & publications' },
  { icon: Trophy, title: 'Hackathons', desc: 'Competitions & wins' },
  { icon: Heart, title: 'Volunteering', desc: 'Social service & impact' },
  { icon: Star, title: 'Leadership', desc: 'Clubs, events & department' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '64px', background: 'var(--bg-primary)' }}>
        {/* Hero Section */}
        <section className="hero-section">
          {/* Radial glow behind hero */}
          <div
            style={{
              position: 'absolute',
              width: '800px',
              height: '800px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(3,77,161,0.06) 0%, transparent 60%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              maxWidth: '100vw', // Prevent overflow
            }}
          />

          <div style={{ maxWidth: '900px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {/* SRM Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(3, 77, 161, 0.06)',
                border: '1px solid rgba(3, 77, 161, 0.15)',
                borderRadius: '24px',
                padding: '8px 20px',
                marginBottom: '32px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--srm-blue)',
              }}
            >
              <GraduationCap size={16} />
              SRM Institute of Science and Technology
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '24px',
                color: 'var(--text-primary)',
              }}
            >
              Best Outgoing
              <br />
              <span className="gradient-text">Student Award</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                fontSize: 'clamp(1rem, 4vw, 18px)',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto 40px auto',
                lineHeight: 1.7,
              }}
            >
              Showcase your journey at SRM — every internship, project, research paper, and
              leadership role. Let your achievements speak for you.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hero-buttons"
            >
              <Link href="/apply" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px', minWidth: '200px', justifyContent: 'center' }}>
                  Apply Now
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/admin" style={{ textDecoration: 'none' }}>
                <button className="btn-secondary" style={{ fontSize: '16px', padding: '14px 32px', minWidth: '200px', justifyContent: 'center' }}>
                  <Users size={18} />
                  Faculty Dashboard
                </button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="hero-stats"
            >
              {[
                { value: '15+', label: 'Categories Evaluated' },
                { value: '100%', label: 'Transparent Scoring' },
                { value: '360°', label: 'Profile Assessment' },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '2rem',
                      fontWeight: 700,
                    }}
                    className="gradient-text"
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--srm-blue)',
                marginBottom: '12px',
              }}
            >
              <Award size={16} />
              WHAT WE EVALUATE
            </div>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '2.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              A Complete <span className="gradient-text">360° Assessment</span>
            </h2>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                style={{ padding: '28px' }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <feature.icon size={22} color="white" />
                </div>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: '80px 24px', maxWidth: '900px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '2.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              How It <span className="gradient-text">Works</span>
            </h2>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              {
                step: '01',
                title: 'Fill Your Application',
                desc: 'Provide your personal info, academic records, achievements, and more through our multi-step form.',
              },
              {
                step: '02',
                title: 'Submit Your Video Pitch',
                desc: 'Record a compelling video explaining why you deserve the Best Outgoing Student award.',
              },
              {
                step: '03',
                title: 'Get Ranked Automatically',
                desc: 'Our algorithm scores your profile across 15+ categories. Faculty can view your portfolio and evaluate.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="glass-card"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                style={{
                  padding: '28px 32px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '24px',
                }}
              >
                <div
                  className="gradient-text"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: '40px 24px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            marginTop: '40px',
            background: 'var(--bg-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <GraduationCap size={20} color="var(--srm-blue)" />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '15px',
                color: 'var(--text-primary)',
              }}
            >
              Best Outgoing Student Portal
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            SRM Institute of Science and Technology, Kattankulathur
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
