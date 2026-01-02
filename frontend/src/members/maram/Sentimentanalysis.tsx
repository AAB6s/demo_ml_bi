import { useState } from "react"
import { FileText, Upload, Loader2, Download, TrendingUp, MessageSquare } from "lucide-react"

const API_BASE = "http://127.0.0.1:8000"

export default function SentimentAnalysis() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null) // Clear previous results
    }
  }
    const [isDragging, setIsDragging] = useState(false)

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0]
        if (!droppedFile.name.endsWith(".csv")) {
        alert("Please upload a CSV file")
        return
        }
        setFile(droppedFile)
        setResult(null)
    }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    }

    const handleDragLeave = () => {
    setIsDragging(false)
    }

  const analyzeSentiments = async () => {
    if (!file) {
      alert("Please upload a CSV file first")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(
        `${API_BASE}/sentiment/analyze`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || "Analysis failed")
      }

      const data = await res.json()
      setResult(data)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = async () => {
    if (!result?.request_id) return

    const res = await fetch(
        `${API_BASE}/sentiment/download/${result.request_id}`
    )

    if (!res.ok) {
        alert("Failed to download CSV")
        return
    }

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "sentiment_analysis_results.csv"
    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
}


  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 70) return "bg-green-50 border-green-200"
    if (score >= 50) return "bg-yellow-50 border-yellow-200"
    return "bg-red-50 border-red-200"
  }

  return (
    <div className="space-y-6">
      <style>
        {`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
        `}
      </style>
      
      <h3 className="flex items-center gap-2 font-semibold text-lg text-gray-800">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        Employee Sentiment Analysis
      </h3>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* File Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">
              📄 Upload Employee Reviews
              <span className="text-red-500 ml-1">*</span>
            </label>
            
            {/* User-friendly instructions */}
            <div className="bg-indigo-50 border-l-4 border-indigo-300 p-4 mb-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    CSV File Requirements:
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Your CSV file must include a column with one of these names:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['review_text', 'review', 'text', 'comment', 'feedback'].map((name) => (
                      <span key={name} className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-white text-indigo-700 border border-indigo-200 shadow-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <label className="block cursor-pointer group">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer
                    ${isDragging 
                    ? 'border-blue-600 bg-blue-100 scale-[1.02]' 
                    : file 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                    }
                `}
                >

                <div className="flex flex-col items-center gap-3">
                  <div className={`p-4 rounded-full transition-all duration-300 ${
                    file 
                      ? 'bg-blue-100 scale-110' 
                      : 'bg-gray-100 group-hover:bg-blue-100 group-hover:scale-110'
                  }`}>
                    {file ? (
                      <FileText className="w-8 h-8 text-blue-600" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    )}
                  </div>
                  
                  {file ? (
                    <div className="text-center">
                      <p className="text-base font-bold text-blue-700">{file.name}</p>
                      <p className="text-sm text-blue-600 mt-1">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-xs text-blue-500 mt-2">
                        ✓ File ready • Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-base font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                        Click to browse or drag and drop your file here
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Accepted format: <span className="font-semibold text-gray-700">.csv</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={analyzeSentiments}
            disabled={loading || !file}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
            {loading ? "Analyzing..." : "Analyze Employee Sentiments"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Overall Satisfaction Score */}
          <div className={`border-2 rounded-xl p-6 ${getScoreBackground(result.satisfaction_score)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xl text-gray-800 mb-1">
                  Overall Employee Satisfaction Score
                </h4>
                <p className="text-sm text-gray-600">
                  Based on {result.total_reviews} employee reviews
                </p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor(result.satisfaction_score)}`}>
                  {result.satisfaction_score}
                </div>
                <div className="text-sm text-gray-500">out of 100</div>
              </div>
            </div>
          </div>

          {/* Sentiment Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="font-bold text-lg text-gray-800 mb-4">Sentiment Distribution</h4>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {/* Positive */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-green-700 mb-1">Positive</div>
                <div className="text-3xl font-bold text-green-600">
                  {result.sentiment_percentages.positive.toFixed(1)}%
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {result.sentiment_counts.positive || 0} reviews
                </div>
              </div>

              {/* Neutral */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-yellow-700 mb-1">Neutral</div>
                <div className="text-3xl font-bold text-yellow-600">
                  {result.sentiment_percentages.neutral.toFixed(1)}%
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  {result.sentiment_counts.neutral || 0} reviews
                </div>
              </div>

              {/* Negative */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-red-700 mb-1">Negative</div>
                <div className="text-3xl font-bold text-red-600">
                  {result.sentiment_percentages.negative.toFixed(1)}%
                </div>
                <div className="text-xs text-red-600 mt-1">
                  {result.sentiment_counts.negative || 0} reviews
                </div>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-green-700">Positive</span>
                  <span className="text-green-600">{result.sentiment_percentages.positive.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${result.sentiment_percentages.positive}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-yellow-700">Neutral</span>
                  <span className="text-yellow-600">{result.sentiment_percentages.neutral.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${result.sentiment_percentages.neutral}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-red-700">Negative</span>
                  <span className="text-red-600">{result.sentiment_percentages.negative.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${result.sentiment_percentages.negative}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visual Charts Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-lg text-gray-800 mb-6">Distribution Overview</h4>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 200 200" className="transform -rotate-90">
                    {(() => {
                      const positiveAngle = (result.sentiment_percentages.positive / 100) * 360
                      const neutralAngle = (result.sentiment_percentages.neutral / 100) * 360
                      
                      const createArc = (startAngle: number, endAngle: number, isHovered: boolean) => {
                        const start = (startAngle * Math.PI) / 180
                        const end = (endAngle * Math.PI) / 180
                        
                        // Pop-out effect: increase radius when hovered
                        const radius = isHovered ? 85 : 80
                        const centerOffset = isHovered ? 5 : 0
                        
                        // Calculate center of slice for pop-out direction
                        const midAngle = (startAngle + endAngle) / 2
                        const offsetX = Math.cos((midAngle * Math.PI) / 180) * centerOffset
                        const offsetY = Math.sin((midAngle * Math.PI) / 180) * centerOffset
                        
                        const centerX = 100 + offsetX
                        const centerY = 100 + offsetY
                        
                        const x1 = centerX + radius * Math.cos(start)
                        const y1 = centerY + radius * Math.sin(start)
                        const x2 = centerX + radius * Math.cos(end)
                        const y2 = centerY + radius * Math.sin(end)
                        const largeArc = endAngle - startAngle > 180 ? 1 : 0
                        
                        return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
                      }
                      
                      let currentAngle = 0
                      
                      return (
                        <>
                          {/* Positive slice */}
                          {result.sentiment_percentages.positive > 0 && (
                            <path
                              d={createArc(currentAngle, currentAngle + positiveAngle, hoveredSlice === 'positive')}
                              fill="#22c55e"
                              className="transition-all duration-300 cursor-pointer"
                              style={{ 
                                filter: hoveredSlice === 'positive' 
                                  ? 'drop-shadow(0 4px 12px rgba(34, 197, 94, 0.4))' 
                                  : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                opacity: hoveredSlice === null || hoveredSlice === 'positive' ? 1 : 0.6,
                              }}
                              onMouseEnter={() => setHoveredSlice('positive')}
                              onMouseLeave={() => setHoveredSlice(null)}
                            />
                          )}
                          
                          {/* Neutral slice */}
                          {result.sentiment_percentages.neutral > 0 && (
                            <path
                              d={createArc(
                                currentAngle + positiveAngle, 
                                currentAngle + positiveAngle + neutralAngle,
                                hoveredSlice === 'neutral'
                              )}
                              fill="#eab308"
                              className="transition-all duration-300 cursor-pointer"
                              style={{ 
                                filter: hoveredSlice === 'neutral'
                                  ? 'drop-shadow(0 4px 12px rgba(234, 179, 8, 0.4))' 
                                  : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                opacity: hoveredSlice === null || hoveredSlice === 'neutral' ? 1 : 0.6,
                              }}
                              onMouseEnter={() => setHoveredSlice('neutral')}
                              onMouseLeave={() => setHoveredSlice(null)}
                            />
                          )}
                          
                          {/* Negative slice */}
                          {result.sentiment_percentages.negative > 0 && (
                            <path
                              d={createArc(
                                currentAngle + positiveAngle + neutralAngle, 
                                360,
                                hoveredSlice === 'negative'
                              )}
                              fill="#ef4444"
                              className="transition-all duration-300 cursor-pointer"
                              style={{ 
                                filter: hoveredSlice === 'negative'
                                  ? 'drop-shadow(0 4px 12px rgba(239, 68, 68, 0.4))' 
                                  : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                opacity: hoveredSlice === null || hoveredSlice === 'negative' ? 1 : 0.6,
                              }}
                              onMouseEnter={() => setHoveredSlice('negative')}
                              onMouseLeave={() => setHoveredSlice(null)}
                            />
                          )}
                          
                          {/* Center white circle for donut effect */}
                          <circle cx="100" cy="100" r="50" fill="white" />
                        </>
                      )
                    })()}
                  </svg>
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className={`text-2xl font-bold transition-all duration-300 ${
                        hoveredSlice === null ? 'text-gray-800' : 
                        hoveredSlice === 'positive' ? 'text-green-600' :
                        hoveredSlice === 'neutral' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {hoveredSlice === null ? result.total_reviews :
                         hoveredSlice === 'positive' ? result.sentiment_counts.positive :
                         hoveredSlice === 'neutral' ? result.sentiment_counts.neutral :
                         result.sentiment_counts.negative}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {hoveredSlice === null ? 'Total Reviews' :
                         hoveredSlice === 'positive' ? 'Positive' :
                         hoveredSlice === 'neutral' ? 'Neutral' :
                         'Negative'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating tooltip on hover */}
                  {hoveredSlice && (
                    <div className="absolute top-0 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          hoveredSlice === 'positive' ? 'bg-green-500' :
                          hoveredSlice === 'neutral' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <span className="capitalize">{hoveredSlice}</span>
                      </div>
                      <div className="mt-1 text-lg font-bold">
                        {hoveredSlice === 'positive' ? result.sentiment_percentages.positive.toFixed(1) :
                         hoveredSlice === 'neutral' ? result.sentiment_percentages.neutral.toFixed(1) :
                         result.sentiment_percentages.negative.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-300">
                        {hoveredSlice === 'positive' ? result.sentiment_counts.positive :
                         hoveredSlice === 'neutral' ? result.sentiment_counts.neutral :
                         result.sentiment_counts.negative} reviews
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-6 space-y-2">
                <div 
                  className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                    hoveredSlice === 'positive' ? 'bg-green-100 shadow-sm scale-105' : 'hover:bg-green-50'
                  }`}
                  onMouseEnter={() => setHoveredSlice('positive')}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 bg-green-500 rounded shadow-sm transition-transform duration-200 ${
                      hoveredSlice === 'positive' ? 'scale-125' : ''
                    }`}></div>
                    <span className="text-sm text-gray-700 font-medium">Positive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">
                      {result.sentiment_percentages.positive.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">
                      ({result.sentiment_counts.positive})
                    </span>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                    hoveredSlice === 'neutral' ? 'bg-yellow-100 shadow-sm scale-105' : 'hover:bg-yellow-50'
                  }`}
                  onMouseEnter={() => setHoveredSlice('neutral')}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 bg-yellow-500 rounded shadow-sm transition-transform duration-200 ${
                      hoveredSlice === 'neutral' ? 'scale-125' : ''
                    }`}></div>
                    <span className="text-sm text-gray-700 font-medium">Neutral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">
                      {result.sentiment_percentages.neutral.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">
                      ({result.sentiment_counts.neutral})
                    </span>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                    hoveredSlice === 'negative' ? 'bg-red-100 shadow-sm scale-105' : 'hover:bg-red-50'
                  }`}
                  onMouseEnter={() => setHoveredSlice('negative')}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 bg-red-500 rounded shadow-sm transition-transform duration-200 ${
                      hoveredSlice === 'negative' ? 'scale-125' : ''
                    }`}></div>
                    <span className="text-sm text-gray-700 font-medium">Negative</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">
                      {result.sentiment_percentages.negative.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">
                      ({result.sentiment_counts.negative})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-lg text-gray-800 mb-6">Review Counts</h4>
              <div className="h-64 flex items-end justify-around gap-4 px-4">
                {/* Positive Bar */}
                <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="text-sm font-bold text-green-700 transition-all duration-300 group-hover:scale-125 group-hover:text-green-600">
                    {result.sentiment_counts.positive || 0}
                  </div>
                  <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '200px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-700 ease-out group-hover:from-green-500 group-hover:to-green-300 group-hover:shadow-lg"
                      style={{ 
                        height: `${Math.max((result.sentiment_counts.positive / result.total_reviews) * 100, 2)}%`,
                      }}
                    >
                      {/* Animated shine effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white to-transparent opacity-20" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-600 group-hover:text-green-700 transition-colors duration-200">
                    Positive
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 text-xs text-green-700 font-medium transition-opacity duration-200">
                    {result.sentiment_percentages.positive.toFixed(1)}%
                  </div>
                </div>

                {/* Neutral Bar */}
                <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="text-sm font-bold text-yellow-700 transition-all duration-300 group-hover:scale-125 group-hover:text-yellow-600">
                    {result.sentiment_counts.neutral || 0}
                  </div>
                  <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '200px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg transition-all duration-700 ease-out group-hover:from-yellow-500 group-hover:to-yellow-300 group-hover:shadow-lg"
                      style={{ 
                        height: `${Math.max((result.sentiment_counts.neutral / result.total_reviews) * 100, 2)}%`,
                      }}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white to-transparent opacity-20" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-600 group-hover:text-yellow-700 transition-colors duration-200">
                    Neutral
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 text-xs text-yellow-700 font-medium transition-opacity duration-200">
                    {result.sentiment_percentages.neutral.toFixed(1)}%
                  </div>
                </div>

                {/* Negative Bar */}
                <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="text-sm font-bold text-red-700 transition-all duration-300 group-hover:scale-125 group-hover:text-red-600">
                    {result.sentiment_counts.negative || 0}
                  </div>
                  <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '200px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg transition-all duration-700 ease-out group-hover:from-red-500 group-hover:to-red-300 group-hover:shadow-lg"
                      style={{ 
                        height: `${Math.max((result.sentiment_counts.negative / result.total_reviews) * 100, 2)}%`,
                      }}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white to-transparent opacity-20" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-600 group-hover:text-red-700 transition-colors duration-200">
                    Negative
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 text-xs text-red-700 font-medium transition-opacity duration-200">
                    {result.sentiment_percentages.negative.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Common Words Analysis */}
          {result.common_words && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-lg text-gray-800 mb-4">Most Common Words in Reviews</h4>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* Negative Words */}
                {result.common_words.negative && result.common_words.negative.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      Negative Reviews
                    </h5>
                    <div className="space-y-2">
                      {result.common_words.negative.map(([word, count]: [string, number], idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700 font-medium">{word}</span>
                          <span className="text-red-600 font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Neutral Words */}
                {result.common_words.neutral && result.common_words.neutral.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      Neutral Reviews
                    </h5>
                    <div className="space-y-2">
                      {result.common_words.neutral.map(([word, count]: [string, number], idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700 font-medium">{word}</span>
                          <span className="text-yellow-600 font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Positive Words */}
                {result.common_words.positive && result.common_words.positive.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      Positive Reviews
                    </h5>
                    <div className="space-y-2">
                      {result.common_words.positive.map(([word, count]: [string, number], idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700 font-medium">{word}</span>
                          <span className="text-green-600 font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="font-bold text-lg text-gray-800 mb-4">Additional Metrics</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-blue-700 mb-1">Average Confidence</div>
                <div className="text-2xl font-bold text-blue-600">
                  {result.average_confidence}%
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Model prediction confidence
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-purple-700 mb-1">Total Reviews Analyzed</div>
                <div className="text-2xl font-bold text-purple-600">
                  {result.total_reviews}
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  Employee feedback entries
                </div>
              </div>
            </div>
          </div>

          {/* AI-Powered Insights */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border-2 border-indigo-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h4 className="font-bold text-lg text-indigo-900">Key Insights & Recommendations</h4>
            </div>
            <p className="text-sm text-indigo-700 mb-3 italic">
                Insights are based on aggregated sentiment patterns and should be interpreted alongside qualitative HR context.
            </p>
            
            <div className="space-y-3">
              {(() => {
                const insights = []
                const negPct = result.sentiment_percentages.negative
                const neuPct = result.sentiment_percentages.neutral
                const posPct = result.sentiment_percentages.positive
                const conf = result.average_confidence

                // High negative sentiment
                if (negPct > 30) {
                  insights.push({
                    type: 'warning',
                    icon: '⚠️',
                    title: 'Elevated Dissatisfaction Detected',
                    message: `${negPct.toFixed(1)}% of reviews express negative sentiment. This suggests significant employee concerns that require immediate attention and strategic intervention.`,
                    color: 'red'
                  })
                }

                // Neutral dominance
                if (neuPct > posPct && neuPct > negPct) {
                  insights.push({
                    type: 'caution',
                    icon: '⚡',
                    title: 'Employee Disengagement Signal',
                    message: `Neutral sentiment dominates (${neuPct.toFixed(1)}%), indicating potential employee apathy or lack of strong connection. Consider initiatives to boost engagement and enthusiasm.`,
                    color: 'yellow'
                  })
                }

                // Low confidence
                if (conf < 65) {
                  insights.push({
                    type: 'info',
                    icon: '💬',
                    title: 'Review Quality Notice',
                    message: `Model confidence is ${conf}%, suggesting reviews may be brief, ambiguous, or contain mixed signals. Encourage employees to provide more detailed, specific feedback.`,
                    color: 'blue'
                  })
                }

                // Strong positive signal
                if (posPct > 60) {
                  insights.push({
                    type: 'success',
                    icon: '✅',
                    title: 'Strong Positive Momentum',
                    message: `${posPct.toFixed(1)}% positive sentiment indicates excellent employee satisfaction. Maintain current practices and identify what's working well to replicate success.`,
                    color: 'green'
                  })
                }

                // Strong negative signal
                if (negPct > 50) {
                  insights.push({
                    type: 'critical',
                    icon: '🚨',
                    title: 'Critical Action Required',
                    message: `Over half of reviews (${negPct.toFixed(1)}%) are negative. This represents a critical situation requiring immediate organizational review and corrective measures.`,
                    color: 'red'
                  })
                }

                // Balanced sentiment
                if (Math.abs(posPct - negPct) < 15 && neuPct < 40) {
                  insights.push({
                    type: 'neutral',
                    icon: '⚖️',
                    title: 'Mixed Sentiment Landscape',
                    message: 'Feedback is polarized with both positive and negative views. Investigate specific departments or roles to identify where satisfaction varies most.',
                    color: 'gray'
                  })
                }

                // High confidence
                if (conf >= 85) {
                  insights.push({
                    type: 'success',
                    icon: '🎯',
                    title: 'High-Quality Feedback',
                    message: `${conf}% model confidence indicates clear, well-articulated reviews. Your employees are providing valuable, actionable feedback.`,
                    color: 'green'
                  })
                }

                return insights.length > 0 ? insights.map((insight, idx) => {
                  const colorMap = {
                    red: 'bg-red-50 border-red-300 text-red-800',
                    yellow: 'bg-yellow-50 border-yellow-300 text-yellow-800',
                    blue: 'bg-blue-50 border-blue-300 text-blue-800',
                    green: 'bg-green-50 border-green-300 text-green-800',
                    gray: 'bg-gray-50 border-gray-300 text-gray-800'
                  }

                  return (
                    <div key={idx} className={`border-l-4 rounded-r-lg p-4 ${colorMap[insight.color as keyof typeof colorMap]}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                        <div className="flex-1">
                          <h5 className="font-bold text-sm mb-1">{insight.title}</h5>
                          <p className="text-sm leading-relaxed">{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="bg-white border-l-4 border-indigo-300 rounded-r-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">📊</span>
                      <div className="flex-1">
                        <h5 className="font-bold text-sm text-indigo-900 mb-1">Balanced Feedback Profile</h5>
                        <p className="text-sm text-indigo-800 leading-relaxed">
                          Your sentiment distribution shows a healthy balance. Continue monitoring trends and maintaining open communication with employees.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadCSV}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Results CSV
          </button>
        </div>
      )}
    </div>
  )
}

/* ===== ML CONFIG EXPORT (REQUIRED) ===== */

export const mlSentimentAnalysisConfig = {
  id: "sentiment-analysis",
  title: "Sentiment Analysis",
  description: "Analyze employee review sentiments using BERT",
  icon: MessageSquare,
  component: SentimentAnalysis,
  disabled: false,
}