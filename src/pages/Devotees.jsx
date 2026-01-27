import { useState, useEffect } from "react"
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore"
import { db } from "../services/firebase"

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

  /* ===== LIST STATE ===== */
  const [devoteeList, setDevoteeList] = useState([])

  /* ===== FETCH DEVOTEES ===== */
  const fetchDevotees = async () => {
    const snap = await getDocs(collection(db, "devotees"))
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
    setDevoteeList(list)
  }

  useEffect(() => {
    fetchDevotees()
  }, [])

  /* ===== ADD / UPDATE DEVOTEE ===== */
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
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search)
  )

  return (
    <div style={{ padding: "20px" }}>
      <h2>Devotee Management</h2>

      {/* ===== FORM ===== */}
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <br /><br />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <br /><br />
        <input placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        <br /><br />
        <input type="number" placeholder="Seva Amount" value={sevaAmount} onChange={(e) => setSevaAmount(e.target.value)} required />
        <br /><br />
        <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
        <br /><br />
        <input type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
        <br /><br />

        <button type="submit" disabled={loading}>
          {editingId ? "Update Devotee" : "Add Devotee"}
        </button>
      </form>

      <hr />

      {/* ===== SEARCH ===== */}
      <input
        type="text"
        placeholder="Search by name or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      {/* ===== TABLE ===== */}
      <table border="1" width="100%" cellPadding="10">
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
          {filteredList.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td>{d.phone}</td>
              <td>₹{d.sevaAmount}</td>
              <td>{d.active ? "Active" : "Inactive"}</td>
              <td>
                <button onClick={() => handleEdit(d)}>Edit</button>{" "}
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
