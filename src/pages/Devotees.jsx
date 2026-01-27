import { useState, useEffect } from "react"
import { auth, db } from "../services/firebase"
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore"
import Navbar from "../components/Navbar"

/* ===== STYLES ===== */
const sectionStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
}

const cardStyle = {
  flex: 1,
  padding: "15px",
  borderRadius: "10px",
  background: "#f5f7fa",
  textAlign: "center",
}

/* ===== COMPONENT ===== */
function Devotees() {
  /* ===== FORM STATE ===== */
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [sevaAmount, setSevaAmount] = useState("")
  const [birthday, setBirthday] = useState("")
  const [anniversary, setAnniversary] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  /* ===== USER ROLE ===== */
  const [userRole, setUserRole] = useState(null)

  /* ===== LIST ===== */
  const [devoteeList, setDevoteeList] = useState([])

  /* ===== LOAD ROLE ===== */
  useEffect(() => {
    const loadRole = async () => {
      if (!auth.currentUser) return
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid))
      setUserRole(snap.exists() ? snap.data().role : "member")
    }
    loadRole()
  }, [])

  /* ===== FETCH DEVOTEES ===== */
  const fetchDevotees = async () => {
    const snap = await getDocs(collection(db, "devotees"))
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
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
        await updateDoc(doc(db, "devotees", editingId), {
          name,
          phone,
          whatsapp,
          sevaAmount: Number(sevaAmount),
          birthday,
          anniversary,
        })
      } else {
        await addDoc(collection(db, "devotees"), {
          name,
          phone,
          whatsapp,
          sevaAmount: Number(sevaAmount),
          birthday,
          anniversary,
          active: true,
          createdAt: new Date(),
        })
      }

      setEditingId(null)
      setName("")
      setPhone("")
      setWhatsapp("")
      setSevaAmount("")
      setBirthday("")
      setAnniversary("")
      fetchDevotees()
    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }

  /* ===== EDIT ===== */
  const handleEdit = (d) => {
    setEditingId(d.id)
    setName(d.name)
    setPhone(d.phone)
    setWhatsapp(d.whatsapp)
    setSevaAmount(d.sevaAmount)
    setBirthday(d.birthday || "")
    setAnniversary(d.anniversary || "")
  }

  /* ===== ACTIVATE / DEACTIVATE ===== */
  const setActiveStatus = async (id, active) => {
    await updateDoc(doc(db, "devotees", id), { active })
    fetchDevotees()
  }

  /* ===== FILTER ===== */
  const filteredList = devoteeList.filter(
    d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search)
  )

  if (!userRole) {
    return <p style={{ padding: 20 }}>Loading Devotees…</p>
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "auto", padding: "20px" }}>
      <Navbar />

      <h2>Devotee Management</h2>

      {/* ===== SUMMARY CARDS ===== */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <div style={cardStyle}>
          <h4>Total Devotees</h4>
          <strong>{devoteeList.length}</strong>
        </div>

        <div style={cardStyle}>
          <h4>Active</h4>
          <strong>{devoteeList.filter(d => d.active).length}</strong>
        </div>
      </div>

      {/* ===== FORM ===== */}
      <div style={sectionStyle}>
        <h3>{editingId ? "Edit Devotee" : "Add Devotee"}</h3>

        <form onSubmit={handleSubmit}>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required /><br /><br />
          <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required /><br /><br />
          <input placeholder="WhatsApp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} /><br /><br />
          <input type="number" placeholder="Seva Amount" value={sevaAmount} onChange={e => setSevaAmount(e.target.value)} required /><br /><br />
          <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} /><br /><br />
          <input type="date" value={anniversary} onChange={e => setAnniversary(e.target.value)} /><br /><br />

          <button type="submit" disabled={loading}>
            {editingId ? "Update Devotee" : "Add Devotee"}
          </button>

          {editingId && (
            <button type="button" onClick={() => setEditingId(null)} style={{ marginLeft: "10px" }}>
              Clear
            </button>
          )}
        </form>
      </div>

      {/* ===== SEARCH ===== */}
      <input
        type="text"
        placeholder="Search by name or phone"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      {/* ===== TABLE ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Seva ₹</th>
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
              <td style={{ color: d.active ? "green" : "red" }}>
                {d.active ? "Active" : "Inactive"}
              </td>
              <td>
                {userRole === "admin" && (
                  <button onClick={() => handleEdit(d)}>Edit</button>
                )}{" "}
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

      {/* ===== BIRTHDAYS ===== */}
      <div style={sectionStyle}>
        <h3>🎉 Upcoming Birthdays</h3>
        {devoteeList.filter(d => d.birthday).map(d => (
          <p key={d.id}>
            🎂 {d.name} – {new Date(d.birthday).toLocaleDateString()}
          </p>
        ))}
      </div>
    </div>
  )
}

export default Devotees
