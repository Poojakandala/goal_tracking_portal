# 🚀 Goal Tracking Portal

> Streamlining accountability through role-based goal tracking and real-time performance analytics.

---

## 📌 Project Overview
**GoalSync** is a robust, full-stack performance management portal designed to bridge the communication gap between employees and management. Built during a high-intensity hackathon, this platform focuses on **security, scalability, and a seamless user experience.**

* ⚡ **Real-Time Tracking:** Instant updates on goal progress using Firestore listeners.
* 🔐 **Secure RBAC:** Granular access control ensuring sensitive data is only visible to authorized stakeholders.
* ☁️ **Cloud Integration:** Fully integrated with Firebase for global availability and high performance.

---

## 🛠️ Technical Stack
* **Backend:** Python / FastAPI
* **Database & Auth:** Google Firestore & Firebase Authentication
* **Environment & Deployment:** Replit & GitHub

---

## 🔑 System Architecture & Security
The system leverages **Firebase Security Rules** to enforce data integrity at the database level. Even if a client-side request is intercepted, the backend prevents unauthorized data access based on the user's assigned role.

### Role-Based Access Control (RBAC)
* **Employee:** Can create, update, and track their own personal goals. Access to team metrics is strictly restricted.
* **Manager:** Comprehensive dashboard view to monitor all subordinates, provide feedback, and approve goal completions.

---

## 🧪 Manager Access for Verification
To facilitate thorough testing by the judging panel, we have provided a pre-configured **Manager Account** to showcase the administrative dashboard, team metrics, and cross-user data visibility.

> ### 🔐 Judging Credentials
> * **Email:** `manager.test@goalsync.app`
> * **Password:** `Hackathon2026!Password`

### 🎯 Key Areas to Verify:
1. **Team Overview Dashboard:** View the aggregated progress of all employees under this manager.
2. **Goal Approval Workflow:** Approve or request changes on employee goals in real-time.
3. **Performance Analytics:** Review dynamically generated progress charts.

*Note: For security and continuous judging availability, please do not alter the account password.*

---

## 📦 Installation & Setup

Get the project running locally in under two minutes:

```bash
# 1. Clone the repository
git clone [https://github.com/your-username/goalsync-portal.git](https://github.com/your-username/goalsync-portal.git)
cd goalsync-portal

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the development server
uvicorn main:app --reload


***link: https://c80d505f-caf2-4f86-bc9e-efff911ad369-00-350ydupvggy6n.sisko.replit.dev/***
