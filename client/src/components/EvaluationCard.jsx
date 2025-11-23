import { useEffect, useState } from "react";
import jsPDF from "jspdf"; // <-- install: npm install jspdf

export default function EvaluationCard({ evaluation, onClose }) {
  const [animOverall, setAnimOverall] = useState(0);

  useEffect(() => {
    const target = evaluation?.overall ?? 0;
    let cur = 0;
    const step = Math.max(1, Math.round(target / 30));
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) {
        setAnimOverall(target);
        clearInterval(id);
      } else setAnimOverall(cur);
    }, 20);
    return () => clearInterval(id);
  }, [evaluation]);

  const BARS = [
    { key: "communication", label: "Communication" },
    { key: "technical", label: "Technical Clarity" },
    { key: "problemSolving", label: "Problem Solving" },
    { key: "structure", label: "STAR Structure" },
    { key: "confidence", label: "Confidence" },
    { key: "behavioral", label: "Behavioral / Team" },
  ];

  // PDF Download
  const downloadPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");

    doc.setFontSize(20);
    doc.text("Interview Evaluation Report", 40, 40);

    doc.setFontSize(12);
    doc.text(`Overall Score: ${evaluation.overall}/100`, 40, 70);

    let y = 100;
    doc.setFontSize(12);

    BARS.forEach((b) => {
      const val = evaluation.breakdown[b.key];
      doc.text(`${b.label}: ${val}/100`, 40, y);
      y += 20;
    });

    y += 20;
    doc.setFontSize(14);
    doc.text("Focus Areas:", 40, y);
    y += 16;

    evaluation.improvements.forEach((improve) => {
      doc.setFontSize(11);
      doc.text(`• ${improve}`, 50, y);
      y += 16;
    });

    y += 20;
    doc.setFontSize(14);
    doc.text("Polished Feedback:", 40, y);
    y += 16;

    const splitFeedback = doc.splitTextToSize(evaluation.llmFeedback, 520);
    doc.setFontSize(11);
    splitFeedback.forEach((line) => {
      doc.text(line, 50, y);
      y += 14;
    });

    doc.save("Interview_Evaluation_Report.pdf");
  };

  return (
    <div className="fixed inset-x-4 md:inset-x-40 bottom-6 z-50 animate-fadeIn">
      <div className="mx-auto max-w-4xl bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.002]">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div>
            <div className="text-lg font-semibold">📊 Interview Evaluation</div>
            <div className="text-sm opacity-90">Software Engineer — Final Report</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-4xl font-bold">{animOverall}</div>
              <div className="text-xs opacity-80">Overall Score</div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
              title="Close evaluation"
            >
              ✕
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* SCORE BARS */}
          <div className="col-span-2 space-y-4">
            {BARS.map((b) => {
              const val = evaluation.breakdown[b.key] ?? 0;
              return (
                <div key={b.key}>
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium text-gray-700">{b.label}</div>
                    <div className="text-sm font-semibold text-gray-800">{val}/100</div>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
                      style={{ width: `${val}%`, minWidth: "3%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Focus Areas */}
          <div className="col-span-1 bg-gray-50 p-4 rounded-xl">
            <div className="text-sm font-semibold mb-2">Focus Areas</div>
            <ul className="list-disc pl-5 mb-3 text-sm text-gray-700">
              {evaluation.improvements.map((it, idx) => (
                <li key={idx}>{it}</li>
              ))}
            </ul>

            <div className="text-sm font-semibold mb-2">Action Plan</div>
            <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1 mb-3">
              <li>Use STAR for behavioral answers.</li>
              <li>Mention 1–2 technical projects in each answer.</li>
              <li>Explain step-by-step reasoning for technical cases.</li>
            </ol>
          </div>
        </div>

        {/* FULL-WIDTH POLISHED FEEDBACK */}
        <div className="px-6 py-4 border-t bg-white">
          <div className="text-md font-semibold mb-2">Polished Feedback</div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto p-3 border rounded-lg bg-gray-50 shadow-inner">
            {evaluation.llmFeedback}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-white flex items-center justify-between border-t">
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleString()}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition"
            >
              Print
            </button>

            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 transition"
            >
              Download PDF
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
