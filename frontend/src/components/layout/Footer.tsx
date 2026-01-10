import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="border-t border-border bg-card"
    >
      <div className="max-w-[1920px] mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="tracking-tight">
          Job Market & Workforce Analytics
        </span>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">
            Enterprise Analytics Platform
          </span>

          <span className="flex items-center gap-1.5 text-green-600">
            <CheckCircle className="w-3.5 h-3.5" />
            System Online
          </span>

          <span>{year}</span>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer