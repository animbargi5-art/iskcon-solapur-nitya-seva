import { motion } from "framer-motion"

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -12,
  },
}

const pageTransition = {
  duration: 0.35,
  ease: "easeInOut",
}

function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ height: "100%" }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
