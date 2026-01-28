import { Link, useLocation } from "react-router-dom"
import "../styles/navbar.css"

function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar">
      {/* LEFT: LOGO */}
      <div className="navbar-left">
  <div className="logo-wrap">
    <img
      src="/ISKCON.png"
      alt="ISKCON"
      className="navbar-logo"
    />
  </div>

  <div>
    <h3 className="navbar-title">ISKCON Solapur</h3>
    <small className="navbar-subtitle">Nitya Seva Portal</small>
  </div>
</div>


      {/* CENTER: LINKS */}
      <div className="navbar-links">
        <Link
          to="/dashboard"
          className={location.pathname === "/dashboard" ? "active" : ""}
        >
          Dashboard
        </Link>

        <Link
          to="/devotees"
          className={location.pathname === "/devotees" ? "active" : ""}
        >
          Devotees
        </Link>

        <Link
          to="/payments"
          className={location.pathname === "/payments" ? "active" : ""}
        >
          Payments
        </Link>
      </div>

      {/* RIGHT: QUOTE */}
      <div className="navbar-quote">
        “Seva is the highest perfection”
      </div>
    </nav>
  )
}

export default Navbar
