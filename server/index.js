// server/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Load GROQ_API_KEY

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const app = express();

app.use(cors());
app.use(express.json());

if (!GROQ_API_KEY) {
  console.error("❌ Missing GROQ_API_KEY in .env");
}

// --- In-memory sessions store ---
const sessions = {};

// --- Helpers ---
function now() {
  return new Date().toISOString();
}
function createSession() {
  return "s_" + Date.now() + "_" + Math.floor(Math.random() * 99999);
}
function normalize(text = "") {
  return String(text).toLowerCase().replace(/’/g, "'").trim();
}
function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Groq LLM call ---
async function callGroq(messages) {
  if (!GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY in environment.");
  }
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error("Groq API error: " + text);
  }

  const json = await response.json();
  const choice = json.choices && json.choices[0] && json.choices[0].message;
  if (!choice || !choice.content) {
    throw new Error("Malformed Groq response");
  }
  return choice.content;
}

// --- System prompt generator ---
function systemPrompt(role, mode) {
  return {
    role: "system",
    content: `
You are a helpful, expert Interview Coach for job candidates. The user selected:
- ROLE: ${role}
- MODE: ${mode}

Follow these rules:
1) NEVER ask the user to confirm the mode; assume the provided mode is correct.
2) If MODE == "training": be friendly + structured (step-by-step).
3) If MODE == "mock": act like an interviewer; ask questions, wait for answers, then follow up.
4) Always be empathetic and provide actionable feedback when requested.
5) Use simple language for suggestions and clear scoring when asked to evaluate.
`
  };
}

// --- Training lessons (Software Engineer) ---
const trainingLessons = [
  {
    title: "Understand the Role",
    content:
      "A Software Engineer builds, tests, and maintains software. Key skills: problem solving, data structures & algorithms, system design basics, communication, and collaboration.",
    example:
      "Example summary: 'I build backend services using Java/Spring and focus on reliable APIs and good tests. I recently improved latency by 30% by optimizing queries.'",
    practicePrompt: "In one short sentence, tell me what you would bring to this role."
  },
  {
    title: "Common Interview Questions",
    content:
      "Common questions include: 'Tell me about yourself', 'Why us?', 'Describe a challenging bug you fixed', 'Explain a system you designed'.",
    example:
      "For 'Why us?': 'I like your focus on scalable systems and the opportunity to work on distributed services; my experience in XYZ aligns.'",
    practicePrompt: "Answer: 'Why are you interested in this company?' (30-45 seconds)"
  },
  {
    title: "STAR Method & Structuring Answers",
    content:
      "Use STAR: Situation → Task → Action → Result. Keep answers concise and focused on impact.",
    example:
      "Example STAR: 'Situation: Slow API. Task: Reduce latency. Action: Added indexing and caching. Result: 40% faster responses.'",
    practicePrompt: "Describe a recent challenge using the STAR format (one short paragraph)."
  },
  {
    title: "Technical Preparation (DSA & Systems)",
    content:
      "Be ready for algorithmic questions (arrays, trees, graphs), and explain time/space complexity. For systems design, discuss trade-offs and scalability.",
    example:
      "For DSA: 'I used two-pointer technique to reduce complexity from O(n^2) to O(n).' For design: 'I would use sharding, caching and load balancers for scale.'",
    practicePrompt: "Explain how you'd find the middle of a linked list (brief)."
  },
  {
    title: "Behavioral & Culture Fit",
    content:
      "Interviewers assess teamwork, communication, and how you learn from mistakes. Be honest, show growth, and give measurable outcomes.",
    example:
      "Example: 'I led a small team to adopt CI/CD which reduced rollback time by 60%.'",
    practicePrompt: "Share one thing you learned from a mistake and how you fixed it."
  },
  {
    title: "Mistakes to Avoid & Final Tips",
    content:
      "Avoid rambling, over-technical detail without context, or not answering the question directly. Summarize your point and relate it to the role.",
    example:
      "Wrap up answers: 'In summary: I improved X and delivered Y results.'",
    practicePrompt: "Give a 30-second summary of your most relevant project."
  }
];

// --- Mock questions (Software Engineer) ---
const mockQuestions = [
  "Tell me about yourself.",
  "Why are you interested in this role?",
  "Describe a time you faced a technical challenge and how you resolved it.",
  "How do you approach debugging a production issue?",
  "Design a scalable URL shortening service (high level)."
];

// --- Suggestion helpers ---
function baseSuggestionsForTraining(step) {
  const base = ["next", "give me an example", "practice", "explain more", "start mock"];
  return base.slice(0, 4);
}
function baseSuggestionsForMock(step) {
  return ["stop", "continue", "evaluate"];
}

// --- EVALUATION: heuristic scoring + LLM polish ---
function simpleHeuristicScores(userAnswers) {
  const joined = userAnswers.join(" ").toLowerCase();

  const avgLen = userAnswers.length ? userAnswers.reduce((s, a) => s + a.length, 0) / userAnswers.length : 0;
  const lengthScore = Math.max(20, Math.min(90, Math.round((avgLen / 200) * 100)));

  const techKeywords = ["java","python","c++","c#","javascript","node","react","spring","sql","database","algorithm","complexity","big o","docker","kubernetes","aws","gcp","azure"];
  let techHits = 0;
  for (const k of techKeywords) if (joined.includes(k)) techHits++;
  const techScore = Math.min(100, Math.round((techHits / 5) * 60) + 30);

  const starWords = ["situation","task","action","result","resulted","led","improved","reduced","increased"];
  let starHits = 0;
  for (const w of starWords) if (joined.includes(w)) starHits++;
  const starScore = Math.min(100, Math.round((starHits / 4) * 70) + 20);

  const sentenceCount = (joined.match(/[.?!]/g) || []).length || 1;
  const avgSentenceLen = sentenceCount ? joined.length / sentenceCount : joined.length;
  let commScore = 60;
  if (avgSentenceLen < 40) commScore = 80;
  else if (avgSentenceLen < 80) commScore = 70;
  else commScore = 55;

  const lowConf = ["maybe","i guess","sort of","perhaps","might","not sure","little experience"];
  let confPenalty = 0;
  for (const w of lowConf) if (joined.includes(w)) confPenalty += 12;
  let confScore = Math.max(40, 80 - confPenalty);

  const teamWords = ["team","led","collaborated","we","together","mentored","stakeholders"];
  let teamHits = 0;
  for (const w of teamWords) if (joined.includes(w)) teamHits++;
  const behaviorScore = Math.min(100, 40 + teamHits * 15);

  const problemWords = ["debug","investigate","root cause","diagnose","reproduce","analysis","optimi"];
  let problemHits = 0;
  for (const w of problemWords) if (joined.includes(w)) problemHits++;
  const problemScore = Math.min(100, 50 + problemHits * 15);

  return {
    communication: commScore,
    technical: techScore,
    structure: starScore,
    confidence: confScore,
    behavioral: behaviorScore,
    problemSolving: problemScore,
    lengthScore
  };
}

async function evaluateSession(session) {
  const history = session.history || [];
  const userMessages = history.filter(h => h.role === "user").map(h => h.content);
  const recentAnswers = userMessages.slice(-6);

  const heur = simpleHeuristicScores(recentAnswers);

  const overall = Math.round(
    (heur.communication * 0.20) +
    (heur.technical * 0.25) +
    (heur.problemSolving * 0.20) +
    (heur.structure * 0.15) +
    (heur.confidence * 0.10) +
    (heur.behavioral * 0.10)
  );

  const improvements = [];
  if (heur.technical < 60) improvements.push("Add specific technical details: mention languages, frameworks, or projects.");
  if (heur.structure < 60) improvements.push("Structure answers using STAR (Situation, Task, Action, Result).");
  if (heur.communication < 65) improvements.push("Work on concise sentences and clear summaries.");
  if (heur.confidence < 65) improvements.push("Sound more decisive: avoid 'maybe' or 'I guess'.");
  if (heur.problemSolving < 65) improvements.push("When answering technical questions, explain your step-by-step reasoning.");
  if (heur.behavioral < 60) improvements.push("Add teamwork examples and measurable impact.");

  let llmFeedback = null;
  try {
    const prompt = [
      { role: "system", content: "You are a friendly, professional interview coach. Produce a brief evaluation summary and 3-4 actionable improvement tips based on the provided numeric sub-scores and short candidate answers." },
      { role: "user", content: `Sub-scores:\nCommunication: ${heur.communication}\nTechnical: ${heur.technical}\nProblemSolving: ${heur.problemSolving}\nStructure: ${heur.structure}\nConfidence: ${heur.confidence}\nBehavioral: ${heur.behavioral}\nOverall: ${overall}\n\nRecent candidate answers:\n${recentAnswers.join("\n---\n")}\n\nProvide: 1) Short summary paragraph (2-3 sentences). 2) 3 action-oriented improvement steps tailored to a Software Engineer candidate.` }
    ];
    const llmResp = await callGroq(prompt);
    llmFeedback = String(llmResp).trim();
  } catch (e) {
    console.warn("LLM polish failed for evaluation:", e.message || e);
    llmFeedback = `Summary: Your overall score is ${overall}/100.\nFocus: ${improvements.slice(0,4).join(" ; ")}`;
  }

  return {
    overall,
    breakdown: {
      communication: heur.communication,
      technical: heur.technical,
      problemSolving: heur.problemSolving,
      structure: heur.structure,
      confidence: heur.confidence,
      behavioral: heur.behavioral
    },
    improvements: improvements.slice(0, 4),
    llmFeedback
  };
}

// --- API handler ---
app.post("/api/message", async (req, res) => {
  try {
    let { sessionId, message = "", role = "Software Engineer", mode = "training" } = req.body;
    message = String(message || "");
    const cleaned = normalize(message);

    if (!sessionId) {
      sessionId = createSession();
    }
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        role,
        mode,
        history: [ systemPrompt(role, mode) ],
        trainingStep: 0,
        mockStep: 0,
        createdAt: now()
      };
    }

    const session = sessions[sessionId];
    session.role = role;
    session.mode = mode;

    // EVALUATION ON DEMAND
    if (cleaned === "evaluate" || cleaned === "evaluation") {
      const evaluation = await evaluateSession(session);
      const shortReply = `📊 Evaluation complete — Overall: ${evaluation.overall}/100. Tap the card for details.`;
      return res.json({
        sessionId,
        reply: shortReply,
        evaluation,
        suggestions: ["start mock", "next"]
      });
    }

    // TRAINING MODE
    if (mode === "training") {
      if (cleaned === "next") {
        const step = session.trainingStep;
        const lesson = trainingLessons[step] || trainingLessons[trainingLessons.length - 1];
        const reply = `Lesson ${step + 1}: ${lesson.title}\n\n${lesson.content}\n\nExample:\n${lesson.example}\n\nTry this: ${lesson.practicePrompt}`;
        if (session.trainingStep < trainingLessons.length - 1) session.trainingStep++;
        session.history.push({ role: "user", content: message });
        session.history.push({ role: "assistant", content: reply });
        return res.json({
          sessionId,
          reply,
          suggestions: baseSuggestionsForTraining(session.trainingStep)
        });
      }

      if (cleaned === "give me an example" || cleaned === "example") {
        const step = Math.max(0, session.trainingStep - 1);
        const lesson = trainingLessons[step] || trainingLessons[0];
        const reply = `Example for "${lesson.title}":\n\n${lesson.example}\n\nWould you like to try the practice prompt? (type 'practice')`;
        session.history.push({ role: "user", content: message });
        session.history.push({ role: "assistant", content: reply });
        return res.json({
          sessionId,
          reply,
          suggestions: ["practice", "next", "explain more"]
        });
      }

      if (cleaned === "practice") {
        const step = Math.max(0, session.trainingStep - 1);
        const lesson = trainingLessons[step] || trainingLessons[0];
        const reply = `Practice prompt:\n${lesson.practicePrompt}\n\nType your answer and I will give feedback.`;
        session.history.push({ role: "user", content: message });
        session.history.push({ role: "assistant", content: reply });
        return res.json({
          sessionId,
          reply,
          suggestions: ["give me an example", "next"]
        });
      }

      if (cleaned === "explain more" || cleaned.startsWith("explain")) {
        const step = Math.max(0, session.trainingStep - 1);
        const lesson = trainingLessons[step] || trainingLessons[0];
        const reply = `Let me expand on that:\n\n${lesson.content}\n\nIf you'd like, I can walk through an example step-by-step. Try 'give me an example'.`;
        session.history.push({ role: "user", content: message });
        session.history.push({ role: "assistant", content: reply });
        return res.json({
          sessionId,
          reply,
          suggestions: ["give me an example", "practice", "next"]
        });
      }

      if (cleaned === "start mock" || cleaned === "start interview" || cleaned === "start") {
        session.mode = "mock";
        session.mockStep = 0;
        session.history.push({ role: "system", content: `Switch to MOCK mode for ${session.role}` });
        session.history.push({ role: "user", content: message });
        const q = mockQuestions[0];
        session.history.push({ role: "assistant", content: q });
        return res.json({
          sessionId,
          reply: `Starting mock interview. First question: ${q}`,
          suggestions: baseSuggestionsForMock(0)
        });
      }

      // freeform training question -> LLM assisted
      session.history.push({ role: "user", content: message });
      const recent = session.history.slice(-6);
      const modeInstruction = {
        role: "system",
        content: `You are in TRAINING mode for ${session.role}. Answer concisely, friendly, and provide one concrete tip.`
      };
      const messages = [ systemPrompt(session.role, "training"), modeInstruction, ...recent ];
      const llmReply = await callGroq(messages);
      session.history.push({ role: "assistant", content: llmReply });

      return res.json({
        sessionId,
        reply: llmReply,
        suggestions: baseSuggestionsForTraining(session.trainingStep)
      });
    } // end training

    // MOCK MODE
    if (mode === "mock") {
      if (cleaned === "stop" || cleaned === "pause") {
        session.history.push({ role: "user", content: message });
        const reply = "Interview paused. Type 'continue' to resume or 'evaluate' for feedback.";
        session.history.push({ role: "assistant", content: reply });
        return res.json({
          sessionId,
          reply,
          suggestions: ["continue", "evaluate"]
        });
      }

      if (cleaned === "continue") {
        const q = mockQuestions[session.mockStep] || mockQuestions[mockQuestions.length - 1];
        session.history.push({ role: "user", content: message });
        session.history.push({ role: "assistant", content: q });
        return res.json({
          sessionId,
          reply: q,
          suggestions: ["stop", "evaluate"]
        });
      }

      // normal mock answer handling
      session.history.push({ role: "user", content: message });

      // short answer -> ask to elaborate
      if (message.trim().length < 40) {
        const follow = "Could you elaborate a bit more on that? Give one specific example.";
        session.history.push({ role: "assistant", content: follow });
        session.mockStep = Math.min(session.mockStep + 1, mockQuestions.length);
        return res.json({
          sessionId,
          reply: follow,
          suggestions: ["continue", "stop", "evaluate"]
        });
      }

      // call LLM for a natural follow-up or feedback
      const recentMock = session.history.slice(-8);
      const modeInstruction = {
        role: "system",
        content: `You are conducting a MOCK interview for ${session.role}. Provide a natural follow-up question or short constructive feedback focused on clarity, structure, and technical depth. Keep it concise.`
      };
      const messages = [ systemPrompt(session.role, "mock"), modeInstruction, ...recentMock ];
      const llmReply = await callGroq(messages);

      session.history.push({ role: "assistant", content: llmReply });
      session.mockStep = Math.min(session.mockStep + 1, mockQuestions.length);

      // If we've just reached the end, run evaluation and return short summary + evaluation object
      if (session.mockStep >= mockQuestions.length) {
        const evaluation = await evaluateSession(session);
        const shortReply = `📊 Mock complete — Overall: ${evaluation.overall}/100. Tap the card for details.`;
        session.history.push({ role: "assistant", content: shortReply });
        return res.json({
          sessionId,
          reply: shortReply,
          evaluation,
          suggestions: ["start mock", "next"]
        });
      }

      return res.json({
        sessionId,
        reply: llmReply,
        suggestions: baseSuggestionsForMock(session.mockStep)
      });
    }

    // fallback to LLM
    session.history.push({ role: "user", content: message });
    const messages = [ systemPrompt(session.role, session.mode), ...session.history.slice(-8) ];
    const llmReply = await callGroq(messages);
    session.history.push({ role: "assistant", content: llmReply });

    return res.json({
      sessionId,
      reply: llmReply,
      suggestions: session.mode === "training" ? baseSuggestionsForTraining(session.trainingStep) : baseSuggestionsForMock(session.mockStep)
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ reply: "⚠️ Server error: " + String(error.message) });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "groq-interview-backend" });
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 Groq AI Interview Server running on http://localhost:${port}`));
