import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Network, Send, RotateCcw, Loader2, AlertCircle,
  Layers, Tag, Users, Activity, Plus, Trash2
} from 'lucide-react'

type Mode = 'guided' | 'custom'
type ExtraRow = { key: string; value: number }

interface ClusterResult {
  cluster_id: number
  name: string
  archetype: string
  cohesion: string
  size: number
  mean_silhouette: number
  interpretation: string
  top_features: string[]
}

const API_BASE = 'http://127.0.0.1:8000'

const GUIDED_FEATURES = [
  { key: 'skill_programming_lv', label: 'Programming (Skill)' },
  { key: 'skill_systems_analysis_lv', label: 'Systems Analysis (Skill)' },
  { key: 'ability_mathematical_reasoning_lv', label: 'Mathematical Reasoning (Ability)' },
  { key: 'knowledge_computers_and_electronics_im', label: 'Computers & Electronics (Knowledge)' },
  { key: 'skill_management_of_personnel_resources_lv', label: 'People Management (Skill)' },
  { key: 'skill_equipment_maintenance_lv', label: 'Equipment Maintenance (Skill)' },
]

export default function MLClustering() {
  const [mode, setMode] = useState<Mode>('guided')
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([])
  const [guided, setGuided] = useState<Record<string, number>>({})
  const [extra, setExtra] = useState<ExtraRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ClusterResult | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/clustering/features`)
      .then(r => r.json())
      .then((cols: string[]) => {
        setAvailableFeatures(cols)
        const g: Record<string, number> = {}
        GUIDED_FEATURES.forEach(f => {
          if (cols.includes(f.key)) g[f.key] = 3
        })
        setGuided(g)
        if (cols.length) setExtra([{ key: cols[0], value: 3 }])
      })
      .catch(() => setError('Failed to load feature list'))
  }, [])

  const buildPayload = () => {
    const features: Record<string, number> = {}
    if (mode === 'guided') {
      Object.entries(guided).forEach(([k, v]) => (features[k] = v))
    }
    extra.forEach(r => {
      if (availableFeatures.includes(r.key)) {
        features[r.key] = r.value
      }
    })
    return { features }
  }

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API_BASE}/clustering/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || 'Backend error')
      }
      setResult(await res.json())
    } catch (e: any) {
      setError(e.message || 'Backend error')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMode('guided')
    const g: Record<string, number> = {}
    GUIDED_FEATURES.forEach(f => {
      if (availableFeatures.includes(f.key)) g[f.key] = 3
    })
    setGuided(g)
    setExtra(availableFeatures.length ? [{ key: availableFeatures[0], value: 3 }] : [])
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button className={`btn-secondary ${mode === 'guided' && 'border-primary'}`} onClick={() => setMode('guided')}>Guided</button>
        <button className={`btn-secondary ${mode === 'custom' && 'border-primary'}`} onClick={() => setMode('custom')}>Custom</button>
      </div>

      {mode === 'guided' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {GUIDED_FEATURES.filter(f => f.key in guided).map(f => (
            <div key={f.key} className="space-y-1">
              <label className="text-sm font-medium">{f.label}</label>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={guided[f.key]}
                onChange={e => setGuided(p => ({ ...p, [f.key]: +e.target.value }))}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">{guided[f.key].toFixed(1)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Additional Features</label>
          <button
            className="btn-secondary"
            onClick={() => setExtra(p => [...p, { key: availableFeatures[0], value: 3 }])}
            disabled={!availableFeatures.length}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {extra.map((r, i) => (
          <div key={i} className="grid grid-cols-6 gap-2 items-center">
            <select
              className="input-field col-span-3"
              value={r.key}
              onChange={e => setExtra(p => p.map((x, j) => j === i ? { ...x, key: e.target.value } : x))}
            >
              {availableFeatures.map(f => <option key={f}>{f}</option>)}
            </select>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={r.value}
              onChange={e => setExtra(p => p.map((x, j) => j === i ? { ...x, value: +e.target.value } : x))}
              className="col-span-2"
            />
            <button
              className="btn-secondary"
              onClick={() => setExtra(p => p.filter((_, j) => j !== i))}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <motion.div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded">
          <AlertCircle className="w-4 h-4" /> {error}
        </motion.div>
      )}

      <div className="flex gap-3">
        <button onClick={submit} disabled={loading} className="btn-primary flex gap-2">
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
          Run Analysis
        </button>
        <button onClick={reset} className="btn-secondary flex gap-2">
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="card-result">
            <h4 className="font-semibold flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" /> Cluster Assignment
            </h4>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div><Layers className="inline w-4 h-4" /> ID: {result.cluster_id}</div>
              <div><Tag className="inline w-4 h-4" /> {result.name}</div>
              <div><Users className="inline w-4 h-4" /> Size: {result.size}</div>
              <div><Activity className="inline w-4 h-4" /> Silhouette: {result.mean_silhouette.toFixed(3)}</div>
              <div><Tag className="inline w-4 h-4" /> Archetype: {result.archetype}</div>
              <div><Activity className="inline w-4 h-4" /> Cohesion: {result.cohesion}</div>
            </div>
            <p className="mt-2 text-sm">{result.interpretation}</p>
          </div>

          <div className="card-result">
            <h4 className="font-semibold mb-2">Top Features</h4>
            <ul className="text-sm space-y-1">
              {result.top_features.slice(0, 10).map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export const mlClusteringConfig = {
  id: 'clustering',
  title: 'Workforce Clustering',
  description: 'O*NET-based occupational archetype assignment',
  icon: Network,
  component: MLClustering,
  disabled: false,
}