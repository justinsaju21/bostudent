# Ranking Fairness: Consistency & Bias Mitigation

This document explains the "Philosophy of Fairness" behind the **BO-Student** ranking system. It outlines how the algorithm ensures that every student is evaluated according to the same standards, without human bias or inconsistency.

---

## 1. Algorithmic Consistency
In a manual evaluation, different faculty members might weigh a paper or a project differently depending on the day or the student. The **BO-Student** system eliminates this through **Deterministic Scoring**:

- **Fixed Weights**: The importance of CGPA (18%), Internships (10%), etc., is hard-coded. It never changes during a ranking session.
- **Predictable Outcomes**: If two students have the exact same profile, they will *always* receive the exact same score.
- **Mathematical Averaging**: By averaging items (e.g., dividing total research points by 5), the system prevents "quantity spamming" and rewards consistent quality.

---

## 2. Mitigation of Subjective Bias
The system shifts the focus from "Who do we like?" to "What has been achieved?" using objective, verifiable metrics.

### A. Objective Tiering
Instead of asking faculty to judge if a event was "prestigeous," the system uses pre-defined categories:
- **Research**: Uses external, objective indices (**SCI, Scopus, UGC Care**).
- **Sports/Cultural**: Uses official competition levels (**International, National, State**).
These tiers are globally recognized and leave no room for subjective favoritism.

### B. Holistic Assessment (Category Balance)
The system prevents bias toward a specific *type* of student (e.g., only rewarding high CGPA).
- A student with a lower CGPA but exceptional research and entrepreneurship can still rank higher than a student who only focuses on exams.
- By distributing points across **15 different categories**, the system captures a "360-degree" view of the student's journey.

### C. The Arrears Policy
Bias in academic evaluation is often uncontrolled. Our system applies a consistent, transparent **15% penalty** to the CGPA score for any history of arrears. This is a clear, mathematical rule applied equally to everyone, removing any "mercy-based" inconsistency.

---

## 3. Human Audit vs. Human Bias
While the ranking is algorithmic, faculty members still perform an audit role. We mitigate bias in this step through:

### A. The Discard System (Fact-Checking only)
Admins cannot "lower" a student's score because of an opinion. They can only **Discard** an item if the **Proof Link** is invalid or the data is false. This forces the faculty to act as *verifiers* of truth rather than *judges* of character.

### B. Transparent Recalculation
Whenever an admin discards an item, the system recalculates the score using the same hard-coded algorithm. The faculty cannot decide *how much* to deduct; the math is handled by the `ranking.ts` logic.

### C. Side-by-Side Comparison
The `ComparisonModal.tsx` allows faculty to view two students' data points horizontally. This forces a direct data-driven comparison, making it difficult to favor one student without seeing the objective data of their competitor right next to them.

---

## 4. Technical Safeguards
- **JSON Snapshot**: Every application is saved as a complete, unchangeable "Blob" at the moment of submission. This prevents anyone from silently modifying a student's data after the fact.
- **Validation (Zod)**: Strict input rules (e.g., must be an `@srmist.edu.in` email) ensure that no "exceptions" are made for specific students during the registration process.
