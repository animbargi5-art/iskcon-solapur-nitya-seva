import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../services/firebase"
import { useNavigate } from "react-router-dom"
import "../styles/login.css"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("admin")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/dashboard")
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="login-page">

      {/* BACKGROUND IMAGE (SCROLLS) */}
      <div className="login-scroll-bg" />

      {/* SOFT OVERLAY */}
      <div className="login-overlay" />

      {/* LEFT VRINDAVAN STRIP */}
      <div className="vrindavan-strip left">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={`lotus-left-${i}`}
            className="lotus"
            style={{
              left: `${15 + i * 10}px`,
              top: `${110 + i * 20}%`,
              animationDelay: `${i * 4}s`
            }}
          >
            {Array.from({ length: 8 }).map((_, j) => (
              <span key={j}></span>
            ))}
          </div>
        ))}
      </div>

      {/* RIGHT VRINDAVAN STRIP */}
      <div className="vrindavan-strip right">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={`lotus-right-${i}`}
            className="lotus"
            style={{
              left: `${15 + i * 10}px`,
              top: `${115 + i * 18}%`,
              animationDelay: `${i * 5}s`
            }}
          >
            {Array.from({ length: 8 }).map((_, j) => (
              <span key={j}></span>
            ))}
          </div>
        ))}
      </div>

      {/* FIXED CENTER CARD */}
      <div className="login-fixed-center">
        <form className="login-card" onSubmit={handleLogin}>

          <img
            src="/ISKCON.png"
            alt="ISKCON"
            className="login-logo"
          />

          <h2 className="login-title">ISKCON Solapur</h2>
          <p className="login-subtitle">Nitya Seva Portal</p>

          {/* ROLE SWITCH */}
          <div className="role-switch">
            {["admin", "sevak", "devotee"].map(r => (
              <button
                type="button"
                key={r}
                className={role === r ? "active" : ""}
                onClick={() => setRole(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* EMAIL */}
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

          {/* PASSWORD */}
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

          <button type="submit" className="login-btn">
            Enter Seva Portal
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
