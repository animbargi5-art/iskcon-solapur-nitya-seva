import { AnimatePresence } from "framer-motion"
import Toast from "./Toast"

function ToastContainer({ toasts, removeToast }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
      }}
    >
      <AnimatePresence>
        {toasts.map(t => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
