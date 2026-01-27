import { updateDoc, doc } from "firebase/firestore"
import { useState, useEffect } from "react"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "../services/firebase"

function Devotees() {
  // ===== FORM STATES =====

  const handleDeactivate = async (id) => {
    await updateDoc(doc(db, "devotees", id), {
      active: false,
    })
    fetchDevotees()
  }
  
  const handleActivate = async (id) => {
    await updateDoc(doc(db, "devotees", id), {
      active: true,
    })
    fetchDevotees()
  }
  
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [sevaAmount, setSevaAmount] = useState("")
  const [birthday, setBirthday] = useState("")
  const [anniversary, setAnniversary] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)


  // ===== DEVOTEE LIST STATE =====
  const [devoteeList, setDevoteeList] = useState([])

  // ===== ADD DEVOTEE =====
  const handleEdit = (devotee) => {
    setEditingId(devotee.id)
    setName(devotee.name)
    setPhone(devotee.phone)
    setWhatsapp(devotee.whatsapp)
    setSevaAmount(devotee.sevaAmount)
    setBirthday(devotee.birthday)
    setAnniversary(devotee.anniversary)
  }
  
  const handleAddDevotee = async (e) => {
    e.preventDefault()
    setLoading(true)
  
    try {
      if (editingId) {
        // UPDATE MODE
        await updateDoc(doc(db, "devotees", editingId), {
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          sevaAmount: Number(sevaAmount),
          birthday,
          anniversary,
        })
  
        alert("Devotee updated successfully ✏️")
      } else {
        // ADD MODE
        await addDoc(collection(db, "devotees"), {
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          sevaAmount: Number(sevaAmount),
          birthday,
          anniversary,
          active: true,
          createdAt: new Date(),
        })
  
        alert("Devotee added successfully 🙏")
      }
  
      // Reset form
      setEditingId(null)
      setName("")
      setPhone("")
      setWhatsapp("")
      setSevaAmount("")
      setBirthday("")
      setAnniversary("")
  
      fetchDevotees()
    } catch (error) {
      console.error(error)
      alert("Error saving devotee ❌")
    }
  
    setLoading(false)
  }
  

  // ===== FETCH DEVOTEES =====
  const fetchDevotees = async () => {
    try {
      const snapshot = await getDocs(collection(db, "devotees"))
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setDevoteeList(list.filter((d) => d.active))
    } catch (error) {
      console.error("Error fetching devotees", error)
    }
  }

  // ===== LOAD DEVOTEES ON PAGE LOAD =====
  useEffect(() => {
    fetchDevotees()
  }, [])

  return (
    <div>
      <h2>Devotee Management</h2>

      {/* ===== ADD DEVOTEE FORM ===== */}
      <form onSubmit={handleAddDevotee}>
        <div>
          <label>Name</label><br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Phone Number</label><br />
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>WhatsApp Number</label><br />
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Monthly Seva Amount (₹)</label><br />
          <input
            type="number"
            value={sevaAmount}
            onChange={(e) => setSevaAmount(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Birthday</label><br />
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Anniversary</label><br />
          <input
            type="date"
            value={anniversary}
            onChange={(e) => setAnniversary(e.target.value)}
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
  {loading
    ? "Saving..."
    : editingId
    ? "Update Devotee"
    : "Add Devotee"}
</button>

      </form>

      <hr />

      {/* ===== DEVOTEE LIST ===== */}
      <h3>Devotee List</h3>

      {devoteeList.length === 0 ? (
        <p>No devotees added yet.</p>
      ) : (
        <ul>
          {devoteeList.map((devotee) => (
  <li key={devotee.id}>
    <strong>{devotee.name}</strong> — ₹{devotee.sevaAmount}{" "}
    <button onClick={() => handleEdit(devotee)}>Edit</button>{" "}
    {devotee.active ? (
      <button onClick={() => handleDeactivate(devotee.id)}>
        Deactivate
      </button>
    ) : (
      <button onClick={() => handleActivate(devotee.id)}>
        Activate
      </button>
    )}
  </li>
))}
        </ul>
      )}
    </div>
  )
}

export default Devotees
