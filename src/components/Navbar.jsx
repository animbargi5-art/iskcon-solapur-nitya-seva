import { Link, useLocation, useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../services/firebase"
import { useState, useEffect } from "react"
import "../styles/navbar.css"

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/")
  }

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      
      {/* LEFT */}
      <div className="navbar-left" onClick={() => navigate("/dashboard")}>
        <img src="/ISKCON.png" alt="ISKCON" className="navbar-logo" />
        <div className="navbar-text">
          <h3>ISKCON Solapur</h3>
          <span>Nitya Seva Portal</span>
        </div>
      </div>

      {/* DESKTOP LINKS */}
      <div className="navbar-links desktop-only">
        <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
          Dashboard
        </Link>
        <Link to="/devotees" className={location.pathname === "/devotees" ? "active" : ""}>
          Devotees
        </Link>
        <Link to="/payments" className={location.pathname === "/payments" ? "active" : ""}>
          Payments
        </Link>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/devotees" onClick={() => setMenuOpen(false)}>Devotees</Link>
          <Link to="/payments" onClick={() => setMenuOpen(false)}>Payments</Link>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
