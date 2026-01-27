import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
      <Link to="/dashboard" style={{ marginRight: "15px" }}>
        Dashboard
      </Link>

      <Link to="/devotees" style={{ marginRight: "15px" }}>
        Devotees
      </Link>

      <Link to="/payments">
        Payments
      </Link>
    </nav>
  )
}

export default Navbar
