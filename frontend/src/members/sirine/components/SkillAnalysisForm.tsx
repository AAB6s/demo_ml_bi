import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Results Dashboard Component
const ResultsDashboard = ({ results, onBack }) => {
  if (!results) return <p>No results available.</p>;

  const {
    skill_demand_analysis = null,
    job_recommendations = [],
    cluster_analysis = null,
    market_trends = null,
    career_forecast = null,
  } = results;

  return (
    <div className="space-y-8 mt-8 p-6 border border-border rounded-xl bg-card shadow-lg">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="text-3xl font-bold text-foreground">Your Career Analysis Results</h2>
        <button 
          onClick={onBack} 
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition text-secondary-foreground"
        >
          ← Back to Form
        </button>
      </div>

      {/* Skill Demand Analysis */}
      <section className="space-y-4">
        <div>
          <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            📊 Your Skills Market Value
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            See how in-demand your current skills are and discover emerging skills.
          </p>
        </div>

        {skill_demand_analysis?.user_skills_analysis?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skill_demand_analysis.user_skills_analysis.map((skill) => (
              <div key={skill.skill} className="p-4 border border-border rounded-lg bg-card/50">
                <h4 className="font-semibold text-lg text-foreground">{skill.skill}</h4>
                <p className="text-sm text-muted-foreground">Demand: {skill.percentage}% of jobs</p>
                <p className="text-sm text-muted-foreground">Jobs: {skill.frequency?.toLocaleString()}</p>
                {skill.is_rising && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                    🚀 Rising ({skill.growth_rate}%)
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No skill demand data available.</p>
        )}

        {/* Rising Skills */}
        {skill_demand_analysis?.rising_skills?.length > 0 && (
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-semibold text-foreground mb-3">🔥 Hottest Emerging Skills:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {skill_demand_analysis.rising_skills.map((skill) => (
                <div key={skill.skill} className="px-3 py-2 bg-background border border-border rounded-md text-center">
                  <p className="text-sm font-medium text-foreground">{skill.skill}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+{skill.growth_rate}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Demand Skills */}
        {skill_demand_analysis?.top_demand_skills?.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-foreground mb-2">📈 Most In-Demand Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {skill_demand_analysis.top_demand_skills.map((skill) => (
                <span key={skill.skill} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                  {skill.skill} ({skill.count?.toLocaleString()})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Complementary Skills */}
        {skill_demand_analysis?.complementary_skills?.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-foreground mb-2">🔗 Skills Often Paired with Yours:</h4>
            <div className="flex flex-wrap gap-2">
              {skill_demand_analysis.complementary_skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Job Recommendations */}
      <section className="space-y-4">
        <div>
          <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            💼 Job Recommendations
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Based on your skills, here are roles you might be qualified for.
          </p>
        </div>

        {job_recommendations?.length > 0 ? (
          <div className="space-y-4">
            {job_recommendations.slice(0, 5).map((job, index) => (
              <div key={index} className="p-5 border border-border rounded-lg bg-card/50 hover:shadow-md transition">
                <h4 className="text-xl font-semibold text-foreground">{job.job_title}</h4>

                <div className="flex gap-4 mt-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    job.match_percentage >= 70 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : job.match_percentage >= 40 
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {job.match_percentage}% Match
                  </span>
                  {job.matched_skills_count && job.total_required_skills && (
                    <span className="text-sm text-muted-foreground">
                      {job.matched_skills_count}/{job.total_required_skills} skills matched
                    </span>
                  )}
                </div>

                {job.missing_skills?.length > 0 && (
                  <div className="mt-3">
                    <strong className="text-sm text-foreground">Skills to Learn:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {job.missing_skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No job recommendations available.</p>
        )}
      </section>

      {/* Cluster Analysis */}
      <section className="space-y-4">
        <div>
          <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            🎯 Skills to Learn for Your Career Path
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Based on professionals with similar skills, here are recommended skills to learn.
          </p>
        </div>

        {cluster_analysis ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-foreground">
                <strong>Career Family:</strong> {cluster_analysis.cluster_name}
              </p>
            </div>

            {cluster_analysis.recommended_skills?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cluster_analysis.recommended_skills.map((skill) => (
                  <div key={skill.skill} className="p-3 border border-border rounded-lg bg-card/50">
                    <h5 className="font-medium text-foreground">{skill.skill}</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Required by {skill.percentage_of_cluster_jobs}% of jobs in this field
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No cluster analysis available.</p>
        )}
      </section>

      {/* Market Trends */}
      <section className="space-y-4">
        <h3 className="text-2xl font-semibold text-foreground">🌍 Market Trends</h3>

        {market_trends?.location_specific && (
          <div className="p-4 border border-border rounded-lg bg-card/50">
            <h4 className="font-semibold text-foreground">📍 Your Location: {market_trends.location_specific.country}</h4>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                Growth Rate: <strong className="text-foreground">{market_trends.location_specific.growth_rate}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Market Size: <strong className="text-foreground">{market_trends.location_specific.market_size?.toLocaleString()} jobs</strong>
              </p>
              {market_trends.location_specific.global_rank && (
                <p className="text-sm text-primary font-medium">
                  🏆 Rank #{market_trends.location_specific.global_rank} globally
                </p>
              )}
            </div>
          </div>
        )}

        {market_trends?.global_trends?.top_growing?.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-2">🚀 Top 10 Fastest Growing Markets:</h4>
            <ul className="space-y-2">
              {market_trends.global_trends.top_growing.map((country, index) => (
                <li 
                  key={index} 
                  className="flex justify-between items-center p-2 border border-border rounded bg-card/30"
                >
                  <span className="text-sm">
                    <strong>#{index + 1}</strong> {country.country}
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    +{country.percent_change}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Career Forecast */}
      <section className="space-y-4">
        <h3 className="text-2xl font-semibold text-foreground">📈 Career Outlook</h3>

        {career_forecast?.job_title ? (
          <div className="p-5 border border-border rounded-lg bg-card/50">
            <h4 className="text-xl font-semibold text-foreground">{career_forecast.job_title}</h4>
            <div className="mt-3 space-y-2">
              <p className={`text-lg font-bold ${career_forecast.growth_trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {career_forecast.growth_trend > 0 ? '+' : ''}{career_forecast.growth_trend}% Growth
              </p>
              <p className="text-sm text-muted-foreground">Forecast: {career_forecast.forecast_period}</p>
              {career_forecast.current_postings && (
                <p className="text-sm text-muted-foreground">
                  Current: {career_forecast.current_postings.toLocaleString()} → Predicted: {career_forecast.predicted_postings?.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No career forecast available. Try entering a desired role.</p>
        )}
      </section>
    </div>
  );
};

// Main Form Component
const SkillAnalysisForm = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skills: [],
    currentSkill: '',
    location: '',
    desired_role: ''
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);

  // Fetch available skills and job titles
  useEffect(() => {
    const API_BASE = 'http://localhost:8000';
    
    fetch(`${API_BASE}/api/available-skills/`)
      .then(res => res.json())
      .then(data => setAvailableSkills(data))
      .catch(err => console.error("Failed to fetch skills:", err));

    fetch(`${API_BASE}/api/job-titles/`)
      .then(res => res.json())
      .then(data => setJobTitles(data))
      .catch(err => console.error("Failed to fetch job titles:", err));
  }, []);

  const handleAddSkill = () => {
    if (formData.currentSkill && !formData.skills.includes(formData.currentSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.currentSkill],
        currentSkill: ''
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.skills.length === 0) {
      alert('Please add at least one skill');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/analyze-skills/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: formData.skills,
          location: formData.location,
          desired_role: formData.desired_role,
          name: formData.name,
          email: formData.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);

    } catch (error) {
      console.error("Analysis failed:", error);
      setError(error.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = availableSkills.filter((skill) =>
    skill.toLowerCase().includes(formData.currentSkill.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Career Skill Analysis</h2>
        <p className="text-muted-foreground">Analyze your skills and discover career opportunities</p>
      </div>

      <div className="space-y-4 p-6 border border-border rounded-xl bg-card/50 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground outline-none transition focus:border-primary"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground outline-none transition focus:border-primary"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Your Skills</label>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground outline-none focus:border-primary"
              type="text"
              value={formData.currentSkill}
              onChange={(e) => setFormData(prev => ({ ...prev, currentSkill: e.target.value }))}
              placeholder="Type a skill..."
              list="skills-list"
            />
            <button 
              type="button" 
              onClick={handleAddSkill}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition"
            >
              Add
            </button>
            <datalist id="skills-list">
              {filteredSkills.slice(0, 20).map((skill) => (
                <option key={skill} value={skill} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                {skill}
                <button 
                  type="button" 
                  onClick={() => handleRemoveSkill(skill)} 
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Location (Optional)</label>
            <input
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground outline-none focus:border-primary"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., USA, Germany, Tunisia"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Target Role (Optional)</label>
            <input
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground outline-none focus:border-primary"
              type="text"
              value={formData.desired_role}
              onChange={(e) => setFormData(prev => ({ ...prev, desired_role: e.target.value }))}
              placeholder="e.g., Data Scientist"
              list="job-titles-list"
            />
            <datalist id="job-titles-list">
              {jobTitles.slice(0, 20).map((title) => (
                <option key={title} value={title} />
              ))}
            </datalist>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={loading} 
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Analyze My Skills'}
        </button>
      </div>

      {/* Results Dashboard */}
      <div id="results-section">
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResultsDashboard 
                results={result} 
                onBack={() => setResult(null)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SkillAnalysisForm;