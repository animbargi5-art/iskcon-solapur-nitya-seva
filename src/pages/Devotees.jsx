import { useState, useEffect } from "react"
import { auth } from "../services/firebase"
import "../styles/devotees.css"
import {
  getDevotees,
  addDevotee,
  updateDevotee,
  setDevoteeActive,
} from "../services/devotees.service"
import Navbar from "../components/Navbar"

/* ===============================
   BASIC STYLES (INLINE FOR NOW)
================================ */
const containerStyle = {
  maxWidth: "1200px",
  margin: "auto",
  padding: "20px",
}

const sectionStyle = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "14px",
  marginBottom: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
}

const cardStyle = {
  flex: 1,
  padding: "16px",
  borderRadius: "12px",
  background: "#f7f8fb",
  textAlign: "center",
}

/* ===============================
   COMPONENT
================================ */
function Devotees() {
  /* ===== FORM STATE ===== */
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [sevaAmount, setSevaAmount] = useState("")
  const [birthday, setBirthday] = useState("")
  const [anniversary, setAnniversary] = useState("")
  const [notes, setNotes] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  /* ===== ROLE ===== */
  const [userRole, setUserRole] = useState("member")

  /* ===== LIST ===== */
  const [devoteeList, setDevoteeList] = useState([])

  /* ===== LOAD ROLE ===== */
  useEffect(() => {
    if (auth.currentUser) {
      setUserRole("admin")
    }
  }, [])

  /* ===== FETCH DEVOTEES ===== */
  const fetchDevotees = async () => {
    const list = await getDevotees()
    setDevoteeList(list)
  }

  useEffect(() => {
    fetchDevotees()
  }, [])

  /* ===== ADD / UPDATE ===== */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingId) {
        await updateDevotee(editingId, {
          name,
          phone,
          whatsapp,
          sevaAmount: Number(sevaAmount),
          birthday,
          anniversary,
          notes,
        })
      } else {
        const duplicate = devoteeList.find(d => d.phone === phone)
        if (duplicate) {
          alert("Devotee with this phone already exists")
          setLoading(false)
          return
        }

        await addDevotee({
          name,
          phone,
          whatsapp,
          sevaAmount: Number(sevaAmount),
          birthday,
          anniversary,
          notes,
          active: true,
          source: "manual",
          createdAt: new Date(),
        })

        await addDevotee({
          name: payment.name,
          phone: payment.phone,
          sevaAmount: payment.amount,
          source: "payment",
          active: true,
        })
        
      }

      setEditingId(null)
      setName("")
      setPhone("")
      setWhatsapp("")
      setSevaAmount("")
      setBirthday("")
      setAnniversary("")
      setNotes("")
      fetchDevotees()
    } catch (err) {
      console.error(err)
      alert("Error saving devotee")
    }

    setLoading(false)
  }

  /* ===== EDIT ===== */
  const handleEdit = (d) => {
    setEditingId(d.id)
    setName(d.name)
    setPhone(d.phone)
    setWhatsapp(d.whatsapp || "")
    setSevaAmount(d.sevaAmount)
    setBirthday(d.birthday || "")
    setAnniversary(d.anniversary || "")
    setNotes(d.notes || "")
  }

  /* ===== ACTIVATE / DEACTIVATE ===== */
  const setActiveStatus = async (id, active) => {
    await setDevoteeActive(id, active)
    fetchDevotees()
  }

  /* ===== FILTER ===== */
  const filteredList = devoteeList.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search)
  )

  /* ===== UPCOMING BIRTHDAYS (7 DAYS) ===== */
  const today = new Date()
  const upcomingBirthdays = devoteeList.filter(d => {
    if (!d.birthday) return false
    const b = new Date(d.birthday)
    b.setFullYear(today.getFullYear())
    const diff = (b - today) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  })

  return (
    <div style={containerStyle}>
      <Navbar />

      <h2>Devotee Management</h2>

      {/* ===== SUMMARY ===== */}
      <div className="summary-row">
  <div className="summary-card">
    <h4>Total Devotees</h4>
    <strong>{devoteeList.length}</strong>
  </div>

  <div className="summary-card">
    <h4>Active</h4>
    <strong>{devoteeList.filter(d => d.active).length}</strong>
  </div>

  <div className="summary-card">
    <h4>Auto Added</h4>
    <strong>{devoteeList.filter(d => d.source === "payment").length}</strong>
  </div>
</div>


      {/* ===== FORM ===== */}
      <div className="section">
  <h3>{editingId ? "Edit Devotee" : "Add New Devotee"}</h3>

  <form onSubmit={handleSubmit}>
    <h4>Personal Details</h4>
    <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
    <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
    <input placeholder="WhatsApp (optional)" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />

    <h4>Seva Details</h4>
    <input
      type="number"
      placeholder="Seva Amount ₹"
      value={sevaAmount}
      onChange={e => setSevaAmount(e.target.value)}
      required
    />

    <h4>Important Dates</h4>
    <label>🎂 Birthday</label>
    <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />

    <label>💍 Anniversary</label>
    <input type="date" value={anniversary} onChange={e => setAnniversary(e.target.value)} />

    <h4>Notes</h4>
    <textarea
      placeholder="Notes (Life member, Festival donor, etc.)"
      value={notes}
      onChange={e => setNotes(e.target.value)}
      rows={3}
    />

    <button type="submit" disabled={loading}>
      {editingId ? "Update Devotee" : "Add Devotee"}
    </button>

    {editingId && (
      <button type="button" className="secondary" onClick={() => setEditingId(null)}>
        Clear
      </button>
    )}
  </form>
</div>


      {/* ===== UPCOMING BIRTHDAYS ===== */}
      <div className="section">
  <h3>🎉 Upcoming Birthdays (Next 7 Days)</h3>

  {upcomingBirthdays.length === 0 && (
    <p>No upcoming birthdays</p>
  )}

  {upcomingBirthdays.map(d => (
    <div key={d.id} className="event-item">
      🎂 {d.name} – {new Date(d.birthday).toLocaleDateString()}
    </div>
  ))}
</div>


      {/* ===== SEARCH ===== */}
      <div className="search-bar">
  <input
    type="text"
    placeholder="Search by name or phone"
    value={search}
    onChange={e => setSearch(e.target.value)}
  />
</div>


      {/* ===== TABLE ===== */}
      <table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Phone</th>
      <th>Seva ₹</th>
      <th>Source</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
    {filteredList.map(d => (
      <tr key={d.id}>
        <td>{d.name}</td>
        <td>{d.phone}</td>
        <td>₹{d.sevaAmount}</td>
        <td>{d.source || "manual"}</td>

        <td className={d.active ? "status-active" : "status-inactive"}>
          {d.active ? "Active" : "Inactive"}
        </td>

        <td>
          {userRole === "admin" && (
            <button onClick={() => handleEdit(d)}>Edit</button>
          )}
          {d.active ? (
            <button onClick={() => setActiveStatus(d.id, false)}>Deactivate</button>
          ) : (
            <button onClick={() => setActiveStatus(d.id, true)}>Activate</button>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
  )
}

export default Devotees
