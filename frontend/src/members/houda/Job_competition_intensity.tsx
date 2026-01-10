import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, RotateCcw, Loader2, AlertCircle, CheckCircle, Trophy } from 'lucide-react'

interface FormData {
  Job_Title: string
  Description: string
  Search_Keyword: string
  Category_Name: string
  Spent_USD: number
}

const CATEGORY_OPTIONS = [
  { label: 'Web Development', value: 'web' },
  { label: 'Mobile Development', value: 'mobile' },
  { label: 'Data Science', value: 'data' },
  { label: 'Machine Learning', value: 'ml' },
  { label: 'Design', value: 'design' },
]

const initialFormData: FormData = {
  Job_Title: '',
  Description: '',
  Search_Keyword: '',
  Category_Name: 'web',
  Spent_USD: 0,
}

export default function MLCompetition() {
  const [f, setF] = useState<FormData>(initialFormData)
  const [l, setL] = useState(false)
  const [r, setR] = useState<string | null>(null)
  const [e, setE] = useState<string | null>(null)

  const update = (k: keyof FormData, v: any) => {
    setF(p => ({ ...p, [k]: v }))
    setE(null)
  }

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, Number.isFinite(v) ? v : 0))

  const submit = async () => {
    if (!f.Job_Title || !f.Description) {
      setE('Missing required fields')
      return
    }

    setL(true)
    setR(null)
    setE(null)

    try {
      const res = await fetch('http://127.0.0.1:8000/competition/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      })

      if (!res.ok) throw 0
      const d = await res.json()
      setR(d.label)
    } catch {
      setE('Backend error')
    }

    setL(false)
  }

  const color =
    r === 'élevé'
      ? 'text-destructive'
      : r === 'moyen'
      ? 'text-yellow-500'
      : 'text-emerald-500'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Title</label>
          <input
            maxLength={100}
            className="input-field w-full"
            value={f.Job_Title}
            onChange={e => update('Job_Title', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            maxLength={1000}
            rows={4}
            className="input-field w-full"
            value={f.Description}
            onChange={e => update('Description', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Keyword</label>
            <input
              maxLength={50}
              className="input-field w-full"
              value={f.Search_Keyword}
              onChange={e => update('Search_Keyword', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select
              className="input-field w-full"
              value={f.Category_Name}
              onChange={e => update('Category_Name', e.target.value)}
            >
              {CATEGORY_OPTIONS.map(c => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Budget (USD)</label>
          <input
            type="number"
            min={0}
            max={1000000}
            className="input-field w-full"
            value={f.Spent_USD}
            onChange={e =>
              update('Spent_USD', clamp(+e.target.value, 0, 1_000_000))
            }
          />
        </div>
      </div>

      {e && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          {e}
        </motion.div>
      )}

      <div className="flex gap-3">
        <button onClick={submit} disabled={l} className="btn-primary flex items-center gap-2">
          {l ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {l ? 'Analyzing...' : 'Run Analysis'}
        </button>

        <button
          onClick={() => {
            setF(initialFormData)
            setR(null)
            setE(null)
          }}
          className="btn-secondary flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="min-h-[140px]">
        {l && <div className="card-result h-24 shimmer" />}
        {r && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-result"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle />
              <h4 className="font-semibold">Competition Level</h4>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{r}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export const mlCompetitionConfig = {
  id: 'houda-competition',
  title: 'Job Competition Level',
  description: 'Predict applicant competition intensity',
  icon: Trophy,
  component: MLCompetition,
  disabled: false,
}