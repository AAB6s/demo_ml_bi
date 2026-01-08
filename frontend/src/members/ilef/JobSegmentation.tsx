import React, { useState } from 'react';

const JobSegmentation = () => {
    const [inputs, setInputs] = useState({ num_jobs: 0, skill_richness: 0 });
    const [result, setResult] = useState<{cluster_id: number, market_segment: string} | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        try {
            // URL mise à jour avec le bon préfixe : job-insights
            const response = await fetch("http://127.0.0.1:8000/job-insights/segment-roles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(inputs),
            });

            if (!response.ok) throw new Error("Connection failed");

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError("Analysis failed. Please check your backend connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-xl shadow-sm bg-white mt-4">
            <h2 className="text-xl font-bold text-purple-700 mb-4">Strategic Segmentation (Clustering)</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Job Volume</label>
                    <input 
                        type="number" 
                        placeholder="Ex: 500" 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                        onChange={(e) => setInputs({...inputs, num_jobs: +e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Skill Richness</label>
                    <input 
                        type="number" 
                        step="0.1"
                        placeholder="Ex: 0.8" 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                        onChange={(e) => setInputs({...inputs, skill_richness: +e.target.value})}
                    />
                </div>
            </div>

            <button 
                onClick={handleAnalyze} 
                disabled={loading}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
            >
                {loading ? "Analyzing..." : "Determine Market Segment"}
            </button>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-center">
                    {error}
                </div>
            )}

            {result && !loading && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded text-center">
                    <p className="text-sm text-purple-800 uppercase font-semibold">Market Segment Identified:</p>
                    <span className="text-xl font-bold text-purple-900">{result.market_segment}</span>
                </div>
            )}
        </div>
    );
};

export default JobSegmentation;