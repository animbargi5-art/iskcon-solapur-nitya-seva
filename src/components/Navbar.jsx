import { Link, useLocation, useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../services/firebase"
import { useState, useEffect } from "react"
import "../styles/navbar.css"

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  /* 🔥 SCROLL EFFECT */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/")
  }

  const goToIskconInfo = () => {
    window.open("https://iskconsolapur.org", "_blank")
  }

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>

      {/* LEFT */}
      <div className="navbar-left" onClick={goToIskconInfo}>
        <img src="/ISKCON.png" alt="ISKCON" className="navbar-logo" />
        <div className="navbar-text">
          <h3>ISKCON Solapur</h3>
          <span>Nitya Seva Portal</span>
        </div>
      </div>

      {/* CENTER */}
      <div className="navbar-links">
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
        <div className="nav-icon">🔔</div>

        <div className="profile-wrap" onClick={() => setOpenMenu(!openMenu)}>
          <div className="avatar">A</div>
          <span className="role">Admin</span>

          {openMenu && (
            <div className="profile-menu">
              {/*<button onClick={() => navigate("/profile")}>My Profile</button>
              <button onClick={() => navigate("/settings")}>Settings</button>*/}
              <hr />
              <button className="logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
