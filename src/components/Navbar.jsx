import { Link, useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../services/firebase"

function Navbar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/")
  }

  return (
    <nav
      style={{
        padding: "12px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #ddd",
        background: "#fff",
      }}
    >
      <div>
        <Link to="/dashboard" style={{ marginRight: "15px" }}>
          Dashboard
        </Link>

        <Link to="/devotees" style={{ marginRight: "15px" }}>
          Devotees
        </Link>

        <Link to="/payments">
          Payments
        </Link>
      </div>

      <button onClick={handleLogout}>
        Logout
      </button>
    </nav>
  )
}

export default Navbar
