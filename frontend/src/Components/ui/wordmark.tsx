import { cn } from '@/lib/utils'
import {motion, type Variants} from "motion/react"


const Wordmark = ({ className, variants }: { className?: string, variants:Variants }) => {
  return (
    <motion.h1
        className={cn('text-6xl sm:text-8xl text-accent font-extrabold',className)}
        variants={variants}
    >
        FlowTask
    </motion.h1>
  )
}

export default Wordmark