# The Scoring Algorithm

> [!NOTE]
> All scoring weights and criteria are now transparently displayed to students via **ℹ️ Info Tooltips** next to each section header in the application form.

This guide provides a transparent breakdown of the 100-point math...austive documentation of how the "Best Outgoing" rank is calculated in `src/lib/ranking.ts`.

## Total Points: 100

| Category | Points | Calculation Rule |
| :--- | :---: | :--- |
| **Academia (CGPA)** | 18 | `(CGPA / 10) * 18`. Penalized by 15% if any arrears. |
| **Research** | 12 | Tier-based scoring (SCI, Scopus, UGC) + Pub/Patent status. |
| **Internships** | 10 | 2.0 pts per item (Max 5). |
| **Projects** | 10 | 2.0 pts per item (Max 5). |
| **Hackathons** | 8 | 1.6 pts per item (Max 5). |
| **Entrepreneurship** | 8 | 2.67 pts per item (Max 3). |
| **Certifications** | 5 | 1.0 pt per item (Max 5). |
| **Competitive Exams** | 5 | 1.67 pts per item (Max 3). |
| **Sports & Cultural** | 5 | Scored based on Level (International to Zone). |
| **Volunteering** | 5 | 1.0 pt per item (Max 5). |
| **Scholarships** | 4 | 1.33 pts per item (Max 3). |
| **Club Activities** | 4 | 0.8 pts per item (Max 5). |
| **Dept Contributions**| 2 | 0.4 pts per item (Max 5). |
| **Prof Memberships** | 2 | 0.4 pts per item (Max 5). |
| **Faculty Reference** | 2 | 0.67 pts per item (Max 3). |

---

## 1. The Research Formula (12 pts)
Each of the top 5 research items is scored using this logic:
- **Base Score**: 0.5
- **Indexing Bonus**:
    - SCI: +0.4
    - Scopus: +0.3
    - UGC Care: +0.2
- **Status Bonus**:
    - Patent Granted: +0.3
    - Published: +0.2
- **Cap**: max 1.0 per item.

**Final Score** = `(Sum of Item Scores / 5) * 12`

---

## 2. The Sports & Cultural Formula (5 pts)
Each of the top 5 items is mapped to a multiplier:
- **International**: 1.0
- **National**: 0.9
- **State**: 0.75
- **District**: 0.6
- **Zone**: 0.4
- **Other**: 0.3

**Final Score** = `(Sum of Multipliers / 5) * 5`

---

## 3. The Arrears Penalty
If `historyOfArrears` is true, the **CGPA score** (out of 18) is multiplied by **0.85**. 
*Example: A 10.0 CGPA student with a past arrear gets 15.3 points instead of 18.*

---

## 4. The Discard Logic
If a faculty member marks an item (e.g., a specific project with `ID: 123`) as **Discarded**, that item is filtered out of the list *before* any of the calculations above occur. 

This ensures the leaderboard reflects only **verified** achievements.

---

## ⚖️ Philosophy & Fairness
This mathematical approach is designed to eliminate human favoritism. To learn more about how we maintain consistency and mitigate bias, read the [**Ranking Fairness & Consistency**](./RANKING_FAIRNESS.md) documentation.
