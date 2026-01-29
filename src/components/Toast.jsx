import { motion } from "framer-motion"
import "../styles/toast.css"

function Toast({ message, type = "info", onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`toast toast-${type}`}
    >
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </motion.div>
  )
}

export default Toast
