import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard } from 'lucide-react'
import { biPages } from '@/bi/pages'

const BIContainer = () => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const currentPage = biPages[currentPageIndex]

  const handlePageChange = useCallback((index: number) => {
    if (index < 0 || index >= biPages.length) return
    setIsLoading(true)
    setCurrentPageIndex(index)
    setTimeout(() => setIsLoading(false), 300)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold">Business Intelligence</h2>
      </div>

      <div className="px-5 py-3 border-b border-border">
        <div className="grid grid-cols-3 gap-2">
          {biPages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => handlePageChange(index)}
              className={`h-10 rounded-md text-sm font-medium transition ${
                index === currentPageIndex
                  ? 'bg-primary/10 text-primary'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary'
              }`}
            >
              {page.title}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-card"
            >
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        <iframe
          key={currentPageIndex}
          src={currentPage.embedUrl}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </motion.div>
  )
}

export default BIContainer