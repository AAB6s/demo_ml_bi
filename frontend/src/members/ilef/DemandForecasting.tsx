import React, { useState } from 'react';

const DemandForecasting = () => {
    const [skills, setSkills] = useState({ python: false, sql: false, r: false });
    const [result, setResult] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePredict = async () => {
        setLoading(true);
        setError(null);
        try {
            // L'URL est maintenant corrigée avec /job-insights/
            const response = await fetch("http://127.0.0.1:8000/job-insights/forecast-demand", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(skills),
            });

            if (!response.ok) throw new Error("Server connection failed");

            const data = await response.json();
            setResult(data.estimated_job_openings);
        } catch (err) {
            console.error(err);
            setError("Could not connect to the analysis server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-xl shadow-sm bg-white mt-4">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Market Demand Forecast</h2>
            
            <p className="text-sm text-gray-600 mb-3">Select the core skills for the role:</p>
            
            <div className="flex space-x-4 mb-4">
                {Object.keys(skills).map((skill) => (
                    <label key={skill} className="flex items-center space-x-2 border p-2 rounded cursor-pointer hover:bg-gray-50">
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600"
                            checked={skills[skill as keyof typeof skills]} 
                            onChange={(e) => setSkills({...skills, [skill]: e.target.checked})} 
                        />
                        <span className="capitalize font-medium text-gray-700">{skill}</span>
                    </label>
                ))}
            </div>

            <button 
                onClick={handlePredict} 
                disabled={loading}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
                {loading ? "Calculating..." : "Estimate Job Openings"}
            </button>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-center">
                    {error}
                </div>
            )}

            {result !== null && !loading && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-center text-blue-800">
                    Estimated job openings: <span className="text-2xl font-bold ml-1">{result}</span>
                </div>
            )}
        </div>
    );
};

export default DemandForecasting;