import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BIContainer from '@/components/bi/BIContainer'
import MLContainer from '@/components/ml/MLContainer'

type ViewMode = 'bi' | 'split' | 'ml'

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  useEffect(() => {
    const v = localStorage.getItem('viewMode')
    if (v === 'bi' || v === 'split' || v === 'ml') setViewMode(v)
  }, [])

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode)
  }, [viewMode])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {/*
      if (e.key === '1') setViewMode('bi')
      if (e.key === '2') setViewMode('split')
      if (e.key === '3') setViewMode('ml')*/
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      <Header viewMode={viewMode} setViewMode={setViewMode} />

      <main className="flex-1 min-h-0 pt-20 px-4 lg:px-6">
        <div className="max-w-[1920px] mx-auto h-full min-h-0">
          <div
            className={`grid h-full min-h-0 gap-4 lg:gap-6 ${
              viewMode === 'split'
                ? 'grid-cols-1 lg:grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            <AnimatePresence initial={false}>
              {(viewMode === 'bi' || viewMode === 'split') && (
                <motion.div
                  key="bi"
                  className="h-full min-h-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <BIContainer />
                </motion.div>
              )}

              {(viewMode === 'ml' || viewMode === 'split') && (
                <motion.div
                  key="ml"
                  className="h-full min-h-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MLContainer />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Index