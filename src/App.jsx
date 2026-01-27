import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Devotees from "./pages/Devotees"
import PaymentHistory from "./pages/PaymentHistory"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/devotees" element={<Devotees />} />
      <Route path="/payments" element={<PaymentHistory />} />
    </Routes>
  )
}

export default App
