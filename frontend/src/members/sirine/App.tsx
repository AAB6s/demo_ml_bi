import React, { useState } from "react";
import SkillAnalysisForm from "./components/SkillAnalysisForm";
import ResultsDashboard from "./components/ResultsDashboard";
import PowerBIDashboard from "./components/PowerBIDashboard";
import "@/App.css";

type AnalysisResults = any;
type FormData = Record<string, any>;

const SirineApp: React.FC = () => {
  const [view, setView] = useState<"form" | "results" | "analytics">("form");
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAnalysis = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/analyze-skills/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setView("results");
      } else {
        alert("Analysis failed.");
      }
    } catch {
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const goToHome = () => {
    setResults(null);
    setView("form");
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Career Skill Analyzer</h1>
        <p>Get personalized career insights based on your skills</p>

        <nav className="nav-tabs">
          <button
            className={view === "form" || view === "results" ? "active" : ""}
            onClick={() => setView(results ? "results" : "form")}
          >
            Skill Analyzer
          </button>

          <button
            className={view === "analytics" ? "active" : ""}
            onClick={() => setView("analytics")}
          >
            Global Market Insights
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === "form" && (
          <SkillAnalysisForm onSubmit={handleAnalysis} loading={loading} />
        )}

        {view === "results" && results && (
          <ResultsDashboard results={results} onBack={goToHome} />
        )}

        {view === "analytics" && <PowerBIDashboard />}
      </main>
    </div>
  );
};

export default SirineApp;
