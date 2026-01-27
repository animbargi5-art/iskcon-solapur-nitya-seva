import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>{" | "}
      <Link to="/devotees">Devotees</Link>{" | "}
      <Link to="/">Home</Link>
    </nav>
  )
}

export default Navbar

