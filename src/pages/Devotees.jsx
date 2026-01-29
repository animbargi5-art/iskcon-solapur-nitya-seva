import { useState, useEffect } from "react"
import { auth } from "../services/firebase"
import {
  getDevotees,
  addDevotee,
  updateDevotee,
  setDevoteeActive,
} from "../services/devotees.service"

import { isBirthdayToday } from "../utils/birthday.utils"
import { birthdayMessage } from "../utils/whatsappMessage"

import Navbar from "../components/Navbar"
import ToastContainer from "../components/ToastContainer"
import "../styles/devotees.css"

function Devotees() {
  /* ===============================
     STATE
  =============================== */
  const [devoteeList, setDevoteeList] = useState([])
  const [userRole, setUserRole] = useState("member")

  // Form
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [sevaAmount, setSevaAmount] = useState("")
  const [birthday, setBirthday] = useState("")
  const [anniversary, setAnniversary] = useState("")
  const [notes, setNotes] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  // UI
  const [search, setSearch] = useState("")
  const [toasts, setToasts] = useState([])

  /* ===============================
     TOAST HANDLER
  =============================== */
  const addToast = (message, type = "info") => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  /* ===============================
     LOAD USER ROLE
  =============================== */
  useEffect(() => {
    if (auth.currentUser) {
      setUserRole("admin") // later: fetch from Firestore
    }
  }, [])

  /* ===============================
     FETCH DEVOTEES
  =============================== */
  const fetchDevotees = async () => {
    const list = await getDevotees()
    setDevoteeList(list)
  }

  useEffect(() => {
    fetchDevotees()
  }, [])

  /* ===============================
     TODAY BIRTHDAY TOAST
  =============================== */
  useEffect(() => {
    devoteeList.forEach(d => {
      if (isBirthdayToday(d.birthday)) {
        addToast(`🎂 Today is ${d.name}'s Birthday`, "success")
      }
    })
  }, [devoteeList])

  /* ===============================
     ADD / UPDATE DEVOTEE
  =============================== */
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
        addToast("Devotee updated successfully", "success")
      } else {
        const exists = devoteeList.find(d => d.phone === phone)
        if (exists) {
          addToast("Devotee with this phone already exists", "error")
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

        addToast("Devotee added successfully", "success")
      }

      // Reset
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
      addToast("Error saving devotee", "error")
    }

    setLoading(false)
  }

  /* ===============================
     EDIT
  =============================== */
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

  /* ===============================
     ACTIVATE / DEACTIVATE
  =============================== */
  const toggleStatus = async (id, active) => {
    await setDevoteeActive(id, active)
    fetchDevotees()
  }

  /* ===============================
     FILTERS
  =============================== */
  const filteredList = devoteeList.filter(
    d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search)
  )

  const today = new Date()
  const upcomingBirthdays = devoteeList.filter(d => {
    if (!d.birthday) return false
    const b = new Date(d.birthday)
    b.setFullYear(today.getFullYear())
    const diff = (b - today) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  })

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="devotees-container">
      <Navbar />

      <ToastContainer
        toasts={toasts}
        removeToast={id =>
          setToasts(prev => prev.filter(t => t.id !== id))
        }
      />

      <h2 className="page-title">Devotee Management</h2>

      {/* SUMMARY */}
      <div className="summary-row">
        <div className="summary-card">
          <h4>Total</h4>
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

      {/* FORM */}
      <div className="section">
        <h3>{editingId ? "Edit Devotee" : "Add New Devotee"}</h3>

        <form onSubmit={handleSubmit} className="devotee-form">
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
          <input placeholder="WhatsApp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />

          <input type="number" placeholder="Seva Amount ₹" value={sevaAmount} onChange={e => setSevaAmount(e.target.value)} required />

          <label>🎂 Birthday</label>
          <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />

          <label>💍 Anniversary</label>
          <input type="date" value={anniversary} onChange={e => setAnniversary(e.target.value)} />

          <textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />

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

      {/* UPCOMING BIRTHDAYS */}
      <div className="section">
        <h3>🎉 Upcoming Birthdays (7 Days)</h3>
        {upcomingBirthdays.length === 0 && <p>No upcoming birthdays</p>}
        {upcomingBirthdays.map(d => (
          <div key={d.id} className="event-item">
            🎂 {d.name} – {new Date(d.birthday).toLocaleDateString()}
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <input
        className="search-input"
        placeholder="Search by name or phone"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <table className="devotee-table">
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
                <button onClick={() => toggleStatus(d.id, !d.active)}>
                  {d.active ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Devotees
