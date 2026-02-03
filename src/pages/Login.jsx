import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { useNavigate } from "react-router-dom"
import "../styles/login.css"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1️⃣ AUTHENTICATE
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      const uid = userCred.user.uid

      // 2️⃣ FETCH ROLE FROM FIRESTORE
      const userRef = doc(db, "users", uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        alert("User role not found. Contact admin.")
        setLoading(false)
        return
      }

      const { role } = userSnap.data()

      // 3️⃣ ROUTE BASED ON ROLE
      if (role === "admin" || role === "sevak") {
        navigate("/dashboard")
      } else {
        navigate("/dashboard") // later: /devotee-dashboard
      }

    } catch (err) {
      alert(err.message)
    }

    setLoading(false)
  }

  return (
    <div className="login-page">

      {/* BACKGROUND */}
      <div className="login-scroll-bg" />
      <div className="login-overlay" />

      {/* FIXED CENTER CARD */}
      <div className="login-fixed-center">
        <form className="login-card" onSubmit={handleLogin}>

          <img src="/ISKCON.png" alt="ISKCON" className="login-logo" />

          <h2 className="login-title">ISKCON Solapur</h2>
          <p className="login-subtitle">Nitya Seva Portal</p>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Enter Seva Portal"}
          </button>

          <span className="login-quote">
            “Seva is the perfection of life” — Srila Prabhupada
          </span>

        </form>
      </div>

    </div>
  )
}

export default Login
