import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import ahmedObjectives from '@/members/ahmed/index'

const ALL_ML_OBJECTIVES = [...ahmedObjectives]

const MLContainer = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const currentObjective = ALL_ML_OBJECTIVES[selectedIndex]
  const CurrentComponent = currentObjective?.component

  const handlePrevious = useCallback(() => {
    setSelectedIndex(p => (p > 0 ? p - 1 : ALL_ML_OBJECTIVES.length - 1))
  }, [])

  const handleNext = useCallback(() => {
    setSelectedIndex(p => (p < ALL_ML_OBJECTIVES.length - 1 ? p + 1 : 0))
  }, [])

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index)
    setIsDropdownOpen(false)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full min-h-0 flex flex-col rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          ML Decision Support
        </h2>
      </div>

      <div className="px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevious}
            className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground bg-card hover:bg-secondary hover:text-primary transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <button
              onClick={() => setIsDropdownOpen(v => !v)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card flex items-center justify-between hover:border-primary/40 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                {currentObjective && (
                  <>
                    <currentObjective.icon className="w-5 h-5 text-primary shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="font-medium text-sm truncate">
                        {currentObjective.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {currentObjective.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 z-30 bg-card rounded-lg border border-border shadow-elevated overflow-hidden"
                >
                  {ALL_ML_OBJECTIVES.map((obj, index) => (
                    <button
                      key={obj.id}
                      onClick={() => handleSelect(index)}
                      disabled={obj.disabled}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition
                        ${
                          index === selectedIndex
                            ? 'bg-primary/5 text-primary'
                            : 'hover:bg-secondary'
                        }
                        ${obj.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${index !== ALL_ML_OBJECTIVES.length - 1 ? 'border-b border-border' : ''}
                      `}
                    >
                      <obj.icon className="w-5 h-5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{obj.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {obj.description}
                        </p>
                      </div>
                      {obj.disabled && (
                        <span className="ml-auto text-xs bg-secondary px-2 py-0.5 rounded">
                          Coming Soon
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground bg-card hover:bg-secondary hover:text-primary transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-5 bg-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentObjective?.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full min-h-0"
          >
            {CurrentComponent && <CurrentComponent />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default MLContainer