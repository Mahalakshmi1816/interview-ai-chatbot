
# 🌟 **Interview Prep AI — Role-Based Conversational Interview Coach**

A full-stack AI-powered interview training system that simulates **real-world interviews**, offers **guided training**, and performs **automatic evaluation** using a hybrid scoring engine (heuristics + LLM feedback).
The system adapts dynamically based on:

✔ Selected **Job Role**
✔ User’s interactions
✔ Mode (**Training** or **Mock Interview**)

Built with a clean and modern UI, this project provides an interactive, human-like interview preparation experience.

---

# 📑 **Table of Contents**

1. [Overview](#overview)
2. [Role-Based System](#role-based-system)
3. [Key Features](#key-features)
4. [Architecture](#architecture)
5. [System Design](#system-design)
6. [Implementation Details](#implementation-details)
7. [Agent Behavior Logic](#agent-behavior-logic)
8. [Evaluation Engine](#evaluation-engine)
9. [Project Structure](#project-structure)
10. [Installation & Setup](#installation--setup)
11. [API Contract](#api-contract)
12. [Scalability & Future Enhancements](#scalability--future-enhancements)
13. [Author Notes](#author-notes)

---

# 🔍 **Overview**

**Interview Prep AI** is designed to feel like a real interview trainer.
It can:

* Explain concepts
* Ask follow-up questions
* Analyze responses
* Evaluate the candidate
* Provide improvement suggestions
* Adapt to ANY job role

This makes the tool flexible for students, job seekers, and professionals.

---

# 🎭 **Role-Based System**

The interview experience changes based on the selected role.

### The role influences:

* System prompts
* Training curriculum
* Mock interview questions
* Tone and difficulty
* Evaluation style
* Examples & explanations

### Supported roles include:

* Software Engineer
* Sales Associate
* Retail Associate
* Customer Support
* Data Analyst
* **Any custom role entered by the user**

---

# ⭐ **Key Features**

### 🧠 AI-Powered Conversations

* Natural language understanding (semantic, not keyword-based)
* Human-like tone and flow

### 🎓 Training Mode

* Structured lessons
* Guided examples
* Practice prompts
* “Next”, “Explain more”, “Give example” suggestions

### 🧑‍💼 Mock Interview Mode

* Real interviewer behavior
* Role-specific questions
* Follow-up questions
* Short-answer detection
* Pause/Continue/Evaluate options

### 📊 Advanced Evaluation System

* 6 category subscores
* Weighted overall score
* Improvement areas
* LLM-refined feedback paragraph
* Animated evaluation card UI
* Print & Save options

### ✨ UI Enhancements

* Smooth auto-scroll
* Quick suggestion buttons
* Chat bubbles
* Gradient theme
* Responsive layout

---

# 🧠 **Architecture**

```
                          ┌───────────────────────────┐
                          │         Frontend           │
                          │ React + Vite + Tailwind    │
                          └───────────────┬───────────┘
                                          │
                                          ▼
                          ┌───────────────────────────┐
                          │          Backend           │
                          │ Node.js + Express          │
                          │ Session + Scoring Engine   │
                          └───────────────┬───────────┘
                                          │
                                          ▼
                          ┌───────────────────────────┐
                          │       LLM Provider         │
                          │ Groq LLaMA 3.1 (8B) API    │
                          └───────────────────────────┘
```

---

# 🏗 **System Design**

### ✔ Page Flow

```
Role Selection → Mode Selection → Chat Interface → Evaluation Card
```

### ✔ Backend Handles

* Session history
* Tracking training & mock steps
* Generating LLM message chains
* Computing evaluation
* Returning suggestions

### ✔ Frontend Handles

* UI pages
* Chat management
* Typing state
* Evaluation card animation
* Navigation

---

# 🔧 **Implementation Details**

### **Session Object Example**

```js
{
  role: "Software Engineer",
  mode: "mock",
  history: [...],
  trainingStep: 0,
  mockStep: 0,
  createdAt: "2025-11-22T10:00Z"
}
```

---

# 🤖 **Agent Behavior Logic**

### ✔ Semantic understanding

The bot understands meaning, not fixed commands.

### ✔ Emotional intelligence

Supportive responses during confusion or stress.

### ✔ Follow-up logic

Short answers trigger a deeper question request.

### ✔ Strict role-based behavior

Training mode = teacher
Mock mode = interviewer
Evaluation mode = scoring only

---

# 📊 **Evaluation Engine**

### **Subscores**

* Communication
* Technical clarity
* Problem solving
* STAR structure
* Confidence
* Behavioral/teamwork

Each is scored 0–100.

### **Weighted Overall Score**

```
Overall =
20% Communication +
25% Technical +
20% Problem Solving +
15% Structure +
10% Confidence +
10% Behavioral
```

### **Hybrid Model**

* Heuristics for stability
* LLM for polished feedback

### **Evaluation Card Includes**

* Animated overall score
* Bar charts
* Focus areas
* Action plan
* Polished feedback
* Print & Save

---

# 🗂 **Project Structure**

```
interview-ai-chatbot/
│
├── client/
│   ├── public/
│   ├── screenshots/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
│
├── server/
│   ├── index.js
│   ├── package.json
│   └── scoring logic
│
├── .gitignore
├── README.md
└── package.json
```

---

# 🛠 **Installation & Setup**

### Backend

```
cd server
npm install
npm run dev
```

Create `.env`:

```
GROQ_API_KEY=your_groq_key_here
```

### Frontend

```
cd client
npm install
npm run dev
```

---

# 🔁 **API Contract**

### POST `/api/message`

#### Request

```json
{
  "sessionId": "s_123",
  "message": "Tell me about yourself",
  "role": "Software Engineer",
  "mode": "mock"
}
```

#### Response

```json
{
  "sessionId": "s_123",
  "reply": "Sure, let's begin...",
  "suggestions": ["continue", "evaluate"],
  "evaluation": { ...optional }
}
```

---


# 🚀 **Scalability & Future Enhancements**

### 1️⃣ Multi-role interview datasets

More domain-specific question libraries.

### 2️⃣ Adaptive difficulty engine

Dynamic question toughness.

### 3️⃣ User accounts + progress tracking

Store analytics, history, charts.

### 4️⃣ Cloud-based session storage

Firebase / Redis / DynamoDB.

### 5️⃣ Voice-based interviews

Speech-to-text & text-to-speech.

### 6️⃣ Analytics dashboard

Graphs for strengths & weaknesses.

### 7️⃣ Custom role templates

Company-specific interview frameworks.

---

# ❤️ **Author Notes**

This project emphasizes:

### ✔ Human-like, natural conversation

### ✔ Emotional intelligence

### ✔ Clear teaching structure

### ✔ Realistic interviewer behavior

### ✔ Accurate performance evaluation

### ✔ Flexibility for any job role
**The goal was to create a supportive, intelligent, and practical interview assistant that not only evaluates you — but helps you grow, improve, and gain confidence.**
