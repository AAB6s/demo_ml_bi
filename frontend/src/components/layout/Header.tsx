import { motion } from 'framer-motion'
import { BarChart3, Brain, Columns3 } from 'lucide-react'

type ViewMode = 'bi' | 'split' | 'ml'

const Header = ({
  viewMode,
  setViewMode,
}: {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border"
    >
      <div className="max-w-[1920px] mx-auto h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="leading-tight">
            <h1 className="text-[15px] font-semibold text-foreground">
              Job Market & Workforce Analytics
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Business Intelligence & Machine Learning Decision Support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/60 border border-border">
          <FocusButton
            label="BI Focus"
            icon={<BarChart3 className="w-4 h-4" />}
            active={viewMode === 'bi'}
            onClick={() => setViewMode('bi')}
          />
          <FocusButton
            label="Split"
            icon={<Columns3 className="w-4 h-4" />}
            active={viewMode === 'split'}
            onClick={() => setViewMode('split')}
          />
          <FocusButton
            label="ML Focus"
            icon={<Brain className="w-4 h-4" />}
            active={viewMode === 'ml'}
            onClick={() => setViewMode('ml')}
          />
        </div>
      </div>
    </motion.header>
  )
}

const FocusButton = ({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium transition-all duration-200
      ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-card hover:text-foreground'
      }`}
  >
    {icon}
    <span className="whitespace-nowrap">{label}</span>
  </button>
)

export default Header