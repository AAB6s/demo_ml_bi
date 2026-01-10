import { useState } from "react"
import { Network, Send, Loader2, Lightbulb, Target, TrendingUp, Users } from "lucide-react"

const API_BASE = "http://127.0.0.1:8000"

/* Pastel colors per cluster */
const CLUSTER_STYLES: Record<number, string> = {
  0: "bg-blue-50 border-blue-200 text-blue-900",
  1: "bg-green-50 border-green-200 text-green-900",
  2: "bg-purple-50 border-purple-200 text-purple-900",
  3: "bg-orange-50 border-orange-200 text-orange-900",
  4: "bg-pink-50 border-pink-200 text-pink-900",
}

/* HR Tips per cluster */
const CLUSTER_TIPS: Record<number, {
  icon: string
  title: string
  tips: Array<{ icon: any, text: string }>
  actionableAdvice: string
}> = {
  0: {
    icon: "💡",
    title: "Engaging Innovation-Driven Talent",
    tips: [
      { icon: Target, text: "Provide challenging projects with creative freedom" },
      { icon: TrendingUp, text: "Offer exposure to emerging technologies and methodologies" },
      { icon: Users, text: "Create cross-functional innovation teams" }
    ],
    actionableAdvice: "These employees thrive in dynamic environments. Consider pilot programs, hackathons, or innovation labs."
  },
  1: {
    icon: "🎯",
    title: "Supporting Career Progression",
    tips: [
      { icon: Target, text: "Clearly define advancement pathways and milestones" },
      { icon: TrendingUp, text: "Provide mentorship and professional development" },
      { icon: Users, text: "Assign stretch assignments to build new skills" }
    ],
    actionableAdvice: "Focus on career mapping sessions and quarterly growth reviews to maintain momentum."
  },
  2: {
    icon: "⚙️",
    title: "Retaining Core Workforce",
    tips: [
      { icon: Target, text: "Recognize consistent performance and reliability" },
      { icon: TrendingUp, text: "Offer stability with opportunities for mastery" },
      { icon: Users, text: "Involve in knowledge transfer and mentoring" }
    ],
    actionableAdvice: "These employees value stability. Focus on recognition programs and work-life balance initiatives."
  },
  3: {
    icon: "🌱",
    title: "Developing Early-Career Talent",
    tips: [
      { icon: Target, text: "Implement structured onboarding and training programs" },
      { icon: TrendingUp, text: "Assign mentors for guidance and support" },
      { icon: Users, text: "Provide regular feedback and learning opportunities" }
    ],
    actionableAdvice: "Invest in foundational skills training and create a supportive, learning-focused culture."
  },
  4: {
    icon: "👑",
    title: "Empowering Future Leaders",
    tips: [
      { icon: Target, text: "Delegate high-impact, strategic responsibilities" },
      { icon: TrendingUp, text: "Provide leadership training and executive coaching" },
      { icon: Users, text: "Include in decision-making and strategic planning" }
    ],
    actionableAdvice: "Develop succession plans and give visibility to senior leadership. Consider executive education programs."
  }
}

export default function EmployeeClustering() {
  const [form, setForm] = useState({
    monthlyIncome: "",
    age: "",
    yearsAtCompany: "",
    dependents: "",
    distance: "",
    workLifeBalance: "",
    jobSatisfaction: "",
    employeeRecognition: "",
    overtime: "",
    leadership: "",
    innovation: "",
    remoteWork: "",
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleChange = (key: string, value: any) => {
    setForm(p => ({ ...p, [key]: value }))
  }

  const submit = async () => {
    const required = [
      "monthlyIncome",
      "age",
      "yearsAtCompany",
      "workLifeBalance",
      "jobSatisfaction",
      "employeeRecognition",
      "overtime",
      "leadership",
      "innovation",
      "remoteWork",
    ]

    for (const r of required) {
      if (!form[r as keyof typeof form]) {
        alert("Please fill all required fields (*)")
        return
      }
    }

    setLoading(true)
    setResult(null)

    const age = Number(form.age)
    const years = Number(form.yearsAtCompany)

    const payload = {
      features: {
        "Monthly Income": Number(form.monthlyIncome),
        "Work-Life Balance": Number(form.workLifeBalance),
        "Job Satisfaction": Number(form.jobSatisfaction),
        "Employee Recognition": Number(form.employeeRecognition),
        "Overtime_Yes": Number(form.overtime),
        "Leadership Opportunities_Yes": Number(form.leadership),
        "Innovation Opportunities_Yes": Number(form.innovation),
        "Remote Work_Yes": Number(form.remoteWork),
        "Number of Dependents": Number(form.dependents || 0),
        "Distance from Home": Number(form.distance || 0),

        // engineered (hidden)
        "Years_w": years * 2,
        "Career_Age_Ratio": years / age,
        "Is_Junior": age < 25 && years < 4 ? 1 : 0,
        "Experience_Level": years,
        "Leadership_Index":
          (Number(form.leadership) + Number(form.innovation)) / 2,
      },
    }

    const res = await fetch(
      `${API_BASE}/employee-clustering/clustering/predict`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )

    setResult(await res.json())
    setLoading(false)
  }

  const yesNo = (key: string) => (
    <select
      className="input-field"
      value={form[key as keyof typeof form]}
      onChange={e => handleChange(key, e.target.value)}
    >
      <option value="">Select…</option>
      <option value="1">Yes</option>
      <option value="0">No</option>
    </select>
  )

  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 font-semibold text-lg text-gray-800">
        <Network className="w-5 h-5 text-blue-600" />
        Employee Segmentation (Clustering)
      </h3>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid sm:grid-cols-2 gap-5">

        {/* Monthly Income */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Monthly Income (USD)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <p className="text-xs text-gray-500">
            Enter gross monthly salary
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              min={0}
              step={100}
              className="input-field pl-7"
              value={form.monthlyIncome}
              onChange={e => handleChange("monthlyIncome", e.target.value)}
            />
          </div>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Age
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            min={16}
            max={70}
            className="input-field"
            value={form.age}
            onChange={e => handleChange("age", e.target.value)}
          />
        </div>

        {/* Years at Company */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Years at Company
            <span className="text-red-500 ml-1">*</span>
          </label>
          <p className="text-xs text-gray-500">
            Total tenure in the current company
          </p>
          <input
            type="number"
            min={0}
            max={50}
            className="input-field"
            value={form.yearsAtCompany}
            onChange={e => handleChange("yearsAtCompany", e.target.value)}
          />
        </div>

        {/* Dependents */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Number of Dependents</label>
          <input
            type="number"
            min={0}
            className="input-field"
            value={form.dependents}
            onChange={e => handleChange("dependents", e.target.value)}
          />
        </div>

        {/* Distance */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Distance from Home (km)</label>
          <input
            type="number"
            min={0}
            className="input-field"
            value={form.distance}
            onChange={e => handleChange("distance", e.target.value)}
          />
        </div>

        {/* Ratings */}
        {[
          ["workLifeBalance", "Work-Life Balance"],
          ["jobSatisfaction", "Job Satisfaction"],
          ["employeeRecognition", "Employee Recognition"],
        ].map(([k, label]) => (
          <div key={k} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {label}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-xs text-gray-500">
              0 = Very Low · 3 = Very High
            </p>
            <input
              type="number"
              min={0}
              max={3}
              step={1}
              className="input-field"
              value={form[k as keyof typeof form]}
              onChange={e => handleChange(k, e.target.value)}
            />
          </div>
        ))}

        {/* Yes / No */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Overtime
            <span className="text-red-500 ml-1">*</span>
          </label>
          {yesNo("overtime")}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Leadership Opportunities
            <span className="text-red-500 ml-1">*</span>
          </label>
          {yesNo("leadership")}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Innovation Opportunities
            <span className="text-red-500 ml-1">*</span>
          </label>
          {yesNo("innovation")}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Remote Work
            <span className="text-red-500 ml-1">*</span>
          </label>
          {yesNo("remoteWork")}
        </div>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
        Run Clustering
      </button>

      {result && (
        <div className="space-y-4">
          {/* Cluster Result */}
          <div
            className={`border-2 rounded-2xl p-8 transition-all duration-300 shadow-md ${CLUSTER_STYLES[result.cluster_id]}`}
          >
            <div className="flex items-start gap-4">
              <Network className="w-7 h-7 mt-1 flex-shrink-0 opacity-80" />
              <div className="flex-1">
                <h4 className="font-bold text-2xl mb-4">
                  {result.name}
                </h4>
                <p className="text-base leading-relaxed">
                  {result.interpretation}
                </p>
              </div>
            </div>
          </div>

          {/* HR Quick Tips */}
          {CLUSTER_TIPS[result.cluster_id] && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CLUSTER_TIPS[result.cluster_id].icon}</span>
                    <h5 className="font-bold text-lg text-amber-900">
                      {CLUSTER_TIPS[result.cluster_id].title}
                    </h5>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="space-y-3 mb-4">
                {CLUSTER_TIPS[result.cluster_id].tips.map((tip, idx) => {
                  const IconComponent = tip.icon
                  return (
                    <div key={idx} className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-amber-100">
                      <IconComponent className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {tip.text}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Actionable Advice */}
              <div className="bg-amber-100/50 rounded-lg p-4 border-l-4 border-amber-500">
                <p className="text-sm font-medium text-amber-900 leading-relaxed">
                  <span className="font-bold">💼 Action Point:</span> {CLUSTER_TIPS[result.cluster_id].actionableAdvice}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ===== ML CONFIG EXPORT (REQUIRED) ===== */

export const mlEmployeeClusteringConfig = {
  id: "employee-clustering",
  title: "Employee Clustering",
  description: "HR-based employee profile segmentation",
  icon: Network,
  component: EmployeeClustering,
  disabled: false,
}