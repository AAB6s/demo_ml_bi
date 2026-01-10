import React, { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Send,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trophy,
} from "lucide-react"

type Workload = "less_than_30" | "30_to_40" | "more_than_40"
type ExLevel = "entry" | "intermediate" | "expert"
type PaymentType = "hourly" | "fixed"

interface FormData {
  Job_Title: string
  Description: string
  Search_Keyword: string
  Category_Name: string

  Start_rate: number
  Connects_Num: number

  Applicants_Num_min: number
  Applicants_Num_max: number

  Duration_min: number
  Duration_max: number

  Workload: Workload
  EX_level_demand: ExLevel

  CountryName: string
  Payment_Type: PaymentType
}

const CATEGORY_OPTIONS = [
  { label: "Web Development", value: "web" },
  { label: "Mobile Development", value: "mobile" },
  { label: "Data Science", value: "data" },
  { label: "Machine Learning", value: "ml" },
  { label: "Design", value: "design" },
]

const WORKLOAD_OPTIONS: { label: string; value: Workload }[] = [
  { label: "< 30h/sem", value: "less_than_30" },
  { label: "30–40h/sem", value: "30_to_40" },
  { label: "> 40h/sem", value: "more_than_40" },
]

const EX_LEVEL_OPTIONS: { label: string; value: ExLevel }[] = [
  { label: "Entry", value: "entry" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Expert", value: "expert" },
]

const PAYMENT_OPTIONS: { label: string; value: PaymentType }[] = [
  { label: "Hourly", value: "hourly" },
  { label: "Fixed", value: "fixed" },
]

const initialFormData: FormData = {
  Job_Title: "",
  Description: "",
  Search_Keyword: "",
  Category_Name: "web",

  Start_rate: 0,
  Connects_Num: 1,

  Applicants_Num_min: 0,
  Applicants_Num_max: 0,

  Duration_min: 0,
  Duration_max: 0,

  Workload: "less_than_30",
  EX_level_demand: "entry",

  CountryName: "",
  Payment_Type: "hourly",
}

type ApiResult = {
  predicted_ratio?: number
  predicted_spent_usd?: number
  predicted_revenue_per_hour?: number
  label?: "faible" | "moyen" | "élevé"
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-foreground">{label}</div>
      {children}
    </div>
  )
}

export default function JobFinancialPredictor() {
  const [form, setForm] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, Number.isFinite(v) ? v : 0))

  const validation = useMemo(() => {
    if (!form.Job_Title.trim()) return "Job title is required"
    if (!form.Description.trim()) return "Description is required"
    if (form.Start_rate <= 0) return "Start rate must be > 0"
    if (form.Connects_Num <= 0) return "Connects number must be > 0"
    if (form.Applicants_Num_min < 0 || form.Applicants_Num_max < 0)
      return "Applicants must be >= 0"
    if (form.Applicants_Num_max < form.Applicants_Num_min)
      return "Applicants max must be >= min"
    if (form.Duration_min < 0 || form.Duration_max < 0)
      return "Duration must be >= 0"
    if (form.Duration_max < form.Duration_min)
      return "Duration max must be >= min"
    return null
  }, [form])

  const submit = async () => {
    if (validation) {
      setError(validation)
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch("http://127.0.0.1:8000/financial/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const msg = await res.text().catch(() => "")
        throw new Error(msg || "Request failed")
      }

      const data = (await res.json()) as ApiResult
      setResult(data)
    } catch (e: any) {
      setError(e?.message ? `Server error: ${e.message}` : "Server error, please try again")
    }

    setLoading(false)
  }

  const computedLabel = useMemo(() => {
    const r = result?.predicted_ratio
    if (typeof r !== "number") return null
    if (r >= 3) return "élevé"
    if (r >= 1.5) return "moyen"
    return "faible"
  }, [result])

  const label = result?.label ?? computedLabel

  const color =
    label === "élevé"
      ? "text-green-600"
      : label === "moyen"
      ? "text-yellow-600"
      : label === "faible"
      ? "text-red-600"
      : "text-foreground"

  return (
    <div className="space-y-6 max-w-xl">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        Financial Prediction
      </h3>

      <div className="grid gap-4">
        <Field label="Job title *">
          <input
            placeholder="e.g. Frontend Developer"
            className="input-field"
            value={form.Job_Title}
            onChange={(e) => update("Job_Title", e.target.value)}
          />
        </Field>

        <Field label="Job description *">
          <textarea
            placeholder="Describe the job..."
            rows={4}
            className="input-field"
            value={form.Description}
            onChange={(e) => update("Description", e.target.value)}
          />
        </Field>

        <Field label="Search keyword">
          <input
            placeholder="e.g. react"
            className="input-field"
            value={form.Search_Keyword}
            onChange={(e) => update("Search_Keyword", e.target.value)}
          />
        </Field>

        <Field label="Category">
          <select
            className="input-field"
            value={form.Category_Name}
            onChange={(e) => update("Category_Name", e.target.value)}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start rate ($/h) *">
            <input
              type="number"
              className="input-field"
              value={form.Start_rate}
              min={0}
              onChange={(e) =>
                update("Start_rate", clamp(+e.target.value, 0, 1_000_000))
              }
            />
          </Field>

          <Field label="Connects number *">
            <input
              type="number"
              className="input-field"
              value={form.Connects_Num}
              min={1}
              onChange={(e) =>
                update("Connects_Num", clamp(+e.target.value, 1, 10_000))
              }
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Applicants min">
            <input
              type="number"
              className="input-field"
              value={form.Applicants_Num_min}
              min={0}
              onChange={(e) => {
                const v = clamp(+e.target.value, 0, 1_000_000)
                update("Applicants_Num_min", v)
                if (form.Applicants_Num_max < v) update("Applicants_Num_max", v)
              }}
            />
          </Field>

          <Field label="Applicants max">
            <input
              type="number"
              className="input-field"
              value={form.Applicants_Num_max}
              min={form.Applicants_Num_min}
              onChange={(e) =>
                update("Applicants_Num_max", clamp(+e.target.value, 0, 1_000_000))
              }
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration min (days)">
            <input
              type="number"
              className="input-field"
              value={form.Duration_min}
              min={0}
              onChange={(e) => {
                const v = clamp(+e.target.value, 0, 3650)
                update("Duration_min", v)
                if (form.Duration_max < v) update("Duration_max", v)
              }}
            />
          </Field>

          <Field label="Duration max (days)">
            <input
              type="number"
              className="input-field"
              value={form.Duration_max}
              min={form.Duration_min}
              onChange={(e) =>
                update("Duration_max", clamp(+e.target.value, 0, 3650))
              }
            />
          </Field>
        </div>

        <Field label="Workload">
          <select
            className="input-field"
            value={form.Workload}
            onChange={(e) => update("Workload", e.target.value as Workload)}
          >
            {WORKLOAD_OPTIONS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Experience level demand">
          <select
            className="input-field"
            value={form.EX_level_demand}
            onChange={(e) =>
              update("EX_level_demand", e.target.value as ExLevel)
            }
          >
            {EX_LEVEL_OPTIONS.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Country">
            <input
              placeholder="e.g. Tunisia"
              className="input-field"
              value={form.CountryName}
              onChange={(e) => update("CountryName", e.target.value)}
            />
          </Field>

          <Field label="Payment type">
            <select
              className="input-field"
              value={form.Payment_Type}
              onChange={(e) =>
                update("Payment_Type", e.target.value as PaymentType)
              }
            >
              {PAYMENT_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-600 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      <div className="flex gap-3">
        <button onClick={submit} disabled={loading} className="btn-primary">
          {loading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? "Analyzing..." : "Predict"}
        </button>

        <button
          onClick={() => {
            setForm(initialFormData)
            setResult(null)
            setError(null)
          }}
          className="btn-secondary"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-muted space-y-2"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className={`text-lg font-bold ${color}`}>
              Prediction: {label ?? "—"}
            </span>
          </div>

          {typeof result.predicted_ratio === "number" && (
            <div className="text-sm">
              <span className="font-medium">Predicted ratio:</span>{" "}
              {result.predicted_ratio.toFixed(3)}
            </div>
          )}

          {typeof result.predicted_spent_usd === "number" && (
            <div className="text-sm">
              <span className="font-medium">Predicted spent (USD):</span>{" "}
              {result.predicted_spent_usd.toFixed(2)}
            </div>
          )}

          {typeof result.predicted_revenue_per_hour === "number" && (
            <div className="text-sm">
              <span className="font-medium">Predicted revenue/hour:</span>{" "}
              {result.predicted_revenue_per_hour.toFixed(2)}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export const jobPredictionIntensityConfig = {
  id: "houda-job-prediction-intensity",
  title: "Financial Prediction",
  description: "Predict the likely financial success of a job",
  icon: Trophy,
  component: JobFinancialPredictor,
  disabled: false,
}