import React from 'react';

const ResultsDashboard = ({ results, onBack }) => {
  if (!results) {
    return <p>No results available.</p>;
  }

  const {
    skill_demand_analysis = null,
    job_recommendations = [],
    cluster_analysis = null,
    market_trends = null,
    career_forecast = null,
  } = results;

  return (
    <div className="results-dashboard">
      <button onClick={onBack} className="back-btn">← Back to Form</button>

      <h2>Your Career Analysis Results</h2>

      {/* ================= Skill Demand Analysis ================= */}
      <section className="result-section">
        <h3>📊 Your Skills Market Value</h3>
        <p className="section-description">
          See how in-demand your current skills are and discover emerging skills to stay competitive.
        </p>

        {skill_demand_analysis?.user_skills_analysis?.length > 0 ? (
          <div className="skills-grid">
            {skill_demand_analysis.user_skills_analysis.map((skill) => (
              <div key={skill.skill} className="skill-card">
                <h4>{skill.skill}</h4>
                <p>Market Demand: {skill.percentage}% of jobs</p>
                <p>Total Jobs: {skill.frequency.toLocaleString()}</p>
                {skill.is_rising && (
                  <span className="trend-badge rising">🚀 Rising</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No skill demand data available.</p>
        )}

        {/* NEW: Rising Skills Section - Key feature of Objective 4 */}
        {skill_demand_analysis?.rising_skills?.length > 0 && (
          <div className="rising-skills">
            <h4>🔥 Hottest Emerging Skills (Focus on These!):</h4>
            <p className="section-note">These skills are seeing the fastest growth in job postings</p>
            <div className="skills-grid">
              {skill_demand_analysis.rising_skills.map((skill) => (
                <div key={skill.skill} className="skill-card rising">
                  <h4>{skill.skill}</h4>
                  <p className="growth-highlight">+{skill.growth_rate}% growth</p>
                  <span className="priority-badge">High Priority</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEW: Top Demand Skills */}
        {skill_demand_analysis?.top_demand_skills?.length > 0 && (
          <div className="top-skills">
            <h4>📈 Most In-Demand Skills Across All Jobs:</h4>
            <p className="section-note">Skills that appear most frequently in job postings</p>
            <div className="skill-tags">
              {skill_demand_analysis.top_demand_skills.slice(0, 10).map((skill) => (
                <span key={skill.skill} className="skill-tag top-demand">
                  {skill.skill} ({skill.count.toLocaleString()} jobs)
                </span>
              ))}
            </div>
          </div>
        )}

        {skill_demand_analysis?.complementary_skills?.length > 0 && (
          <div className="complementary-skills">
            <h4>🔗 Skills Often Paired with Yours:</h4>
            <div className="skill-tags">
              {skill_demand_analysis.complementary_skills.map((skill) => (
                <span key={skill} className="skill-tag recommended">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ================= Job Recommendations (OBJECTIVE 5) ================= */}
      <section className="result-section">
        <h3>💼 Alternative Career Paths</h3>
        <p className="section-description">
          Based on your skills, here are other roles you might be qualified for:
        </p>

        {job_recommendations.length > 0 ? (
          <div className="jobs-list">
            {job_recommendations.slice(0, 5).map((job, index) => (
              <div key={index} className="job-card">
                <h4>{job.job_title}</h4>

                <div className="match-info">
                  <span className={`match-score ${job.match_percentage >= 70 ? 'high' : job.match_percentage >= 40 ? 'medium' : 'low'}`}>
                    {job.match_percentage}% Match
                  </span>
                  <span className="job-count">
                    {job.matched_skills_count}/{job.total_required_skills} skills matched
                  </span>
                </div>

                <p className="job-note">
                  You have {job.matched_skills_count} of the {job.total_required_skills} skills required for this role
                </p>

                {job.missing_skills?.length > 0 && (
                  <div className="missing-skills">
                    <strong>Skills to Learn:</strong>
                    <div className="skill-tags">
                      {job.missing_skills.map((skill) => (
                        <span key={skill} className="skill-tag missing">
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
          <p>No alternative career recommendations available.</p>
        )}
      </section>

      {/* ================= Skill Cluster (OBJECTIVE 3) ================= */}
      <section className="result-section">
        <h3>🎯 Skills to Learn for Your Career Path</h3>
        <p className="section-description">
          Based on your current skills and target role, here are the most important skills to learn next.
        </p>

        {cluster_analysis ? (
          <div className="cluster-info">
            <div className="cluster-header">
              <p>
                <strong>Job Family:</strong> {cluster_analysis.most_common_role}
              </p>
              {cluster_analysis.description && (
                <p className="cluster-description">{cluster_analysis.description}</p>
              )}
            </div>

            {/* MAIN FEATURE: Recommended Skills from Objective 3 */}
            {cluster_analysis.recommended_skills?.length > 0 ? (
              <div className="recommended-cluster-skills">
                <h4>📚 Top Skills to Learn for This Career Path:</h4>
                <div className="cluster-skills-grid">
                  {cluster_analysis.recommended_skills.map((skill) => (
                    <div key={skill.skill} className="cluster-skill-card">
                      <h5>{skill.skill}</h5>
                      <p className="skill-importance">
                        Required by <strong>{skill.percentage_of_cluster_jobs}%</strong> of jobs in this field
                      </p>
                      <p className="skill-jobs">
                        {skill.job_count.toLocaleString()} job postings
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="no-recommendations">
                ✅ Great! You already have most of the key skills for this career path. 
                Consider the complementary skills above to expand your opportunities.
              </p>
            )}

            {/* Show related job roles as context */}
            {cluster_analysis.typical_job_titles && Object.keys(cluster_analysis.typical_job_titles).length > 0 && (
              <div className="typical-jobs">
                <strong>Jobs in This Career Family:</strong>
                <ul>
                  {Object.entries(cluster_analysis.typical_job_titles).map(([job, count]) => (
                    <li key={job}>
                      {job} ({count.toLocaleString()} postings)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>No skill recommendations available.</p>
        )}
      </section>

      {/* ================= Market Trends ================= */}
      <section className="result-section">
        <h3>🌍 Market Trends</h3>

        {market_trends?.location_specific && (
          <div className="location-trends">
            <h4>📍 Your Location: {market_trends.location_specific.country}</h4>
            <div className="trend-box">
              <p>
                Trend:{' '}
                <strong className={`trend-${market_trends.location_specific.trend.toLowerCase()}`}>
                  {market_trends.location_specific.trend}
                </strong>
              </p>
              <p>
                Growth Rate:{' '}
                <strong>{market_trends.location_specific.growth_rate}</strong>
              </p>
              <p>
                Market Size:{' '}
                <strong>{market_trends.location_specific.market_size.toLocaleString()} jobs</strong>
              </p>
              
              {/* NEW: Show global ranking */}
              {market_trends.location_specific.global_rank && (
                <div className="global-rank-highlight">
                  <p>
                    🏆 <strong>Global Ranking:</strong> #{market_trends.location_specific.global_rank} fastest growing market
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {market_trends?.global_trends && (
          <div className="global-trends">
            {market_trends.global_trends.top_growing?.length > 0 && (
              <>
                <h4>🚀 Top 10 Fastest Growing Markets:</h4>
                <ul className="trend-list">
                  {market_trends.global_trends.top_growing.map((country, index) => (
                    <li 
                      key={index} 
                      className={`trend-item growing ${
                        market_trends.location_specific?.country.toLowerCase() === country.country.toLowerCase() 
                          ? 'user-country' 
                          : ''
                      }`}
                    >
                      <span className="rank">#{index + 1}</span>
                      <span className="country">
                        {country.country}
                        {market_trends.location_specific?.country.toLowerCase() === country.country.toLowerCase() && (
                          <span className="you-badge"> (Your Location)</span>
                        )}
                      </span>
                      <span className="growth positive">+{country.percent_change}%</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {market_trends.global_trends.top_declining?.length > 0 && (
              <>
                <h4>📉 Declining Markets:</h4>
                <ul className="trend-list">
                  {market_trends.global_trends.top_declining.map((country, index) => (
                    <li key={index} className="trend-item declining">
                      <span className="country">{country.country}</span>
                      <span className="growth negative">{country.percent_change}%</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {!market_trends?.location_specific && !market_trends?.global_trends && (
          <p>No market trend data available.</p>
        )}
      </section>

      {/* ================= Career Forecast ================= */}
      <section className="result-section">
        <h3>📈 Career Outlook</h3>

        {career_forecast && career_forecast.job_title ? (
          <div className="forecast-info">
            <h4>{career_forecast.job_title}</h4>
            <div className={`growth-indicator ${career_forecast.growth_trend > 0 ? 'positive' : 'negative'}`}>
              <p>
                <strong>Projected Growth:</strong>{' '}
                <span className="growth-value">
                  {career_forecast.growth_trend > 0 ? '+' : ''}
                  {career_forecast.growth_trend}%
                </span>
              </p>
            </div>
            <p>
              <strong>Forecast Period:</strong>{' '}
              {career_forecast.forecast_period}
            </p>
            <p>
              <strong>Confidence:</strong>{' '}
              <span className={`confidence ${career_forecast.prediction_confidence.toLowerCase()}`}>
                {career_forecast.prediction_confidence}
              </span>
            </p>

            <div className="forecast-details">
              <p>Current postings: {career_forecast.current_postings?.toLocaleString()}</p>
              <p>Predicted postings: {career_forecast.predicted_postings?.toLocaleString()}</p>
            </div>

            {career_forecast.note && (
              <p className="note"><em>{career_forecast.note}</em></p>
            )}
          </div>
        ) : (
          <p>No career forecast available.</p>
        )}
      </section>
    </div>
  );
};

export default ResultsDashboard;