import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Send,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  BadgeCheck,
} from "lucide-react"

type Workload = "less_than_30" | "30_to_40" | "more_than_40" | "Unknown"
type PaymentType = "hourly" | "fixed" | "Unknown"

interface FormData {
  Job_Title: string
  Description: string
  Category_Name: string
  Connects_Num: number
  New_Connects_Num: number
  Spent_USD: number
  Start_rate: number
  End_rate: number
  Duration: string
  Workload: Workload
  Payment_Type: PaymentType
}

const CATEGORY_OPTIONS = [
  { label: "Web Development", value: "Web Development" },
  { label: "Mobile Development", value: "Mobile Development" },
  { label: "Data Science", value: "Data Science" },
  { label: "Machine Learning", value: "Machine Learning" },
  { label: "Design", value: "Design" },
  { label: "Marketing / Content", value: "Marketing" },
]

const WORKLOAD_OPTIONS: { label: string; value: Workload }[] = [
  { label: "< 30h/sem", value: "less_than_30" },
  { label: "30–40h/sem", value: "30_to_40" },
  { label: "> 40h/sem", value: "more_than_40" },
  { label: "Unknown", value: "Unknown" },
]

const PAYMENT_OPTIONS: { label: string; value: PaymentType }[] = [
  { label: "Hourly", value: "hourly" },
  { label: "Fixed", value: "fixed" },
  { label: "Unknown", value: "Unknown" },
]

const initialForm: FormData = {
  Job_Title: "",
  Description: "",
  Category_Name: "Web Development",
  Connects_Num: 0,
  New_Connects_Num: 0,
  Spent_USD: 0,
  Start_rate: 0,
  End_rate: 0,
  Duration: "Unknown",
  Workload: "Unknown",
  Payment_Type: "Unknown",
}

type ApiResult = {
  cluster_profile: string
  summary?: string
  confidence?: "High" | "Medium" | "Low" | null
  recommendations: string[]
}

const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000"

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ")
}

function FieldLabel({
  label,
  name,
  required,
}: {
  label: string
  name: keyof FormData
  required?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between">
      <label className="text-sm font-medium">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <span className="text-xs opacity-60">name: {String(name)}</span>
    </div>
  )
}

function Badge({
  text,
  tone = "neutral",
}: {
  text: string
  tone?: "neutral" | "green" | "yellow" | "red" | "blue"
}) {
  const cls =
    tone === "green"
      ? "bg-green-50 text-green-700 ring-green-200"
      : tone === "yellow"
      ? "bg-yellow-50 text-yellow-700 ring-yellow-200"
      : tone === "red"
      ? "bg-red-50 text-red-700 ring-red-200"
      : tone === "blue"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : "bg-slate-50 text-slate-700 ring-slate-200"

  return (
    <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs ring-1", cls)}>
      {text}
    </span>
  )
}

async function parseFastApiError(res: Response): Promise<string> {
  const txt = await res.text().catch(() => "")
  if (!txt) return `HTTP ${res.status}`
  try {
    const j = JSON.parse(txt)
    const detail = j?.detail
    if (typeof detail === "string") return detail
    if (detail && typeof detail === "object") return JSON.stringify(detail, null, 2)
    return JSON.stringify(j, null, 2)
  } catch {
    return txt
  }
}

export default function JobClusterSegmentation() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: value }))
    setError(null)
  }

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, Number.isFinite(v) ? v : 0))

  const validation = useMemo(() => {
    if (!form.Job_Title.trim()) return "Job title is required"
    if (!form.Description.trim()) return "Description is required"
    if (form.Start_rate < 0) return "Start rate must be >= 0"
    if (form.End_rate < 0) return "End rate must be >= 0"
    if (form.Spent_USD < 0) return "Spent USD must be >= 0"
    if (form.Connects_Num < 0) return "Connects_Num must be >= 0"
    if (form.New_Connects_Num < 0) return "New_Connects_Num must be >= 0"
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
      const res = await fetch(`${API_BASE}/houda/cluster/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const msg = await parseFastApiError(res)
        throw new Error(msg || "Request failed")
      }

      const data = (await res.json()) as ApiResult
      setResult(data)
    } catch (e: any) {
      setError(e?.message ? `Server error:\n${e.message}` : "Server error, please try again")
    } finally {
      setLoading(false)
    }
  }

  const confidenceTone = useMemo(() => {
    const c = result?.confidence
    if (c === "High") return { tone: "green" as const, label: "High confidence" }
    if (c === "Medium") return { tone: "yellow" as const, label: "Medium confidence" }
    if (c === "Low") return { tone: "red" as const, label: "Low confidence" }
    return null
  }, [result])

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Job Segmentation
        </h3>
        <Badge text="ML Decision Support" tone="blue" />
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-5">
        <div className="grid gap-4">
          <div className="grid gap-1">
            <FieldLabel label="Job title" name="Job_Title" required />
            <input
              name="Job_Title"
              className="input-field"
              placeholder="Ex: Build a React landing page"
              value={form.Job_Title}
              onChange={(e) => update("Job_Title", e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <FieldLabel label="Job description" name="Description" required />
            <textarea
              name="Description"
              rows={4}
              className="input-field"
              placeholder="Describe scope, deliverables, deadline..."
              value={form.Description}
              onChange={(e) => update("Description", e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <FieldLabel label="Category" name="Category_Name" />
            <select
              name="Category_Name"
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <FieldLabel label="Spent (USD)" name="Spent_USD" />
              <input
                name="Spent_USD"
                type="number"
                className="input-field"
                value={form.Spent_USD}
                onChange={(e) => update("Spent_USD", clamp(+e.target.value, 0, 1_000_000_000))}
              />
            </div>

            <div className="grid gap-1">
              <FieldLabel label="Connects num" name="Connects_Num" />
              <input
                name="Connects_Num"
                type="number"
                className="input-field"
                value={form.Connects_Num}
                onChange={(e) => update("Connects_Num", clamp(+e.target.value, 0, 100_000))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <FieldLabel label="New connects" name="New_Connects_Num" />
              <input
                name="New_Connects_Num"
                type="number"
                className="input-field"
                value={form.New_Connects_Num}
                onChange={(e) => update("New_Connects_Num", clamp(+e.target.value, 0, 100_000))}
              />
            </div>

            <div className="grid gap-1">
              <FieldLabel label="Duration (raw label)" name="Duration" />
              <input
                name="Duration"
                className="input-field"
                value={form.Duration}
                onChange={(e) => update("Duration", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <FieldLabel label="Start rate" name="Start_rate" />
              <input
                name="Start_rate"
                type="number"
                className="input-field"
                value={form.Start_rate}
                onChange={(e) => update("Start_rate", clamp(+e.target.value, 0, 1_000_000))}
              />
            </div>

            <div className="grid gap-1">
              <FieldLabel label="End rate" name="End_rate" />
              <input
                name="End_rate"
                type="number"
                className="input-field"
                value={form.End_rate}
                onChange={(e) => update("End_rate", clamp(+e.target.value, 0, 1_000_000))}
              />
            </div>
          </div>

          <div className="grid gap-1">
            <FieldLabel label="Workload" name="Workload" />
            <select
              name="Workload"
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
          </div>

          <div className="grid gap-1">
            <FieldLabel label="Payment type" name="Payment_Type" />
            <select
              name="Payment_Type"
              className="input-field"
              value={form.Payment_Type}
              onChange={(e) => update("Payment_Type", e.target.value as PaymentType)}
            >
              {PAYMENT_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-600 flex items-start gap-2 whitespace-pre-wrap"
          >
            <AlertCircle className="w-4 h-4 mt-0.5" />
            {error}
          </motion.div>
        )}

        <div className="flex gap-3">
          <button onClick={submit} disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Segment job"}
          </button>

          <button
            onClick={() => {
              setForm(initialForm)
              setResult(null)
              setError(null)
            }}
            className="btn-secondary"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-white p-5 shadow-sm space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-base font-semibold">Segmentation Result</div>
                <div className="text-sm opacity-70">Insight generated for this job</div>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <Badge text={result.cluster_profile} tone="blue" />
              {confidenceTone && <Badge text={confidenceTone.label} tone={confidenceTone.tone} />}
            </div>
          </div>

          {result.summary && (
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <div className="font-medium flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4" />
                Summary
              </div>
              <div className="opacity-80">{result.summary}</div>
            </div>
          )}

          <div className="space-y-2">
            <div className="font-medium flex items-center gap-2">
              <BadgeCheck className="w-4 h-4" />
              Recommendations
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {result.recommendations?.length ? (
                result.recommendations.map((r, idx) => (
                  <div key={idx} className="rounded-xl border p-4 bg-slate-50">
                    <div className="text-sm font-semibold">Action {idx + 1}</div>
                    <div className="text-sm mt-2 opacity-80">{r}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm opacity-70">No recommendations available.</div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export const jobSegmentationConfig = {
  id: "houda-job-segmentation",
  title: "Job Segmentation",
  description: "Cluster and segment job opportunities",
  icon: "Sparkles",
  component: JobClusterSegmentation,
  disabled: false,
}