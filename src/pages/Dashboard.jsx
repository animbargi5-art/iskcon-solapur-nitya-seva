import "../styles/dashboard.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
} from "firebase/firestore"

import { Pie, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js"

import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

import { auth, db } from "../services/firebase"
import Navbar from "../components/Navbar"

/* ===============================
   CHART REGISTRATION
================================ */
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
)


/* ===============================
   HELPERS
================================ */
const getMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

const getLastMonths = (count = 6) => {
  const arr = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    arr.push(getMonthKey(d))
  }
  return arr
}

/* ===============================
   COMPONENT
================================ */
function Dashboard() {
  const navigate = useNavigate()

  /* ===== STATE ===== */
  const [userRole, setUserRole] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey())

  const [paidList, setPaidList] = useState([])
  const [unpaidList, setUnpaidList] = useState([])

  const [totalExpected, setTotalExpected] = useState(0)
  const [totalCollected, setTotalCollected] = useState(0)
  const [totalPending, setTotalPending] = useState(0)

  const [monthlyStats, setMonthlyStats] = useState([])
  const [paymentSplit, setPaymentSplit] = useState({ cash: 0, online: 0 })
  const [topDevotees, setTopDevotees] = useState([])

  /* ===============================
     AUTH CHECK
  =============================== */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) return navigate("/")
      const snap = await getDoc(doc(db, "users", user.uid))
      setUserRole(snap.exists() ? snap.data().role : "member")
    })
    return () => unsub()
  }, [navigate])

  /* ===============================
     LOAD DASHBOARD DATA
  =============================== */
  const loadDashboard = async () => {
    const devoteesSnap = await getDocs(collection(db, "devotees"))
    const devotees = devoteesSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(d => d.active)
  
    const recordRef = doc(db, "sevaRecords", selectedMonth)
    const recordSnap = await getDoc(recordRef)
    const payments = recordSnap.exists() ? recordSnap.data().payments || {} : {}
  
    const paid = []
    const unpaid = []
  
    devotees.forEach(d => {
      if (payments[d.id]?.status === "paid") {
        paid.push({
          ...d,
          paymentMode: payments[d.id].mode,
        })
      } else {
        unpaid.push(d)
      }
    })
  
    setPaidList(paid)
    setUnpaidList(unpaid)
  
    const expected = devotees.reduce(
      (sum, d) => sum + Number(d.sevaAmount || 0),
      0
    )
  
    const collected = paid.reduce(
      (sum, d) => sum + Number(d.sevaAmount || 0),
      0
    )
  
    setTotalExpected(expected)
    setTotalCollected(collected)
    setTotalPending(expected - collected)
  
    setTopDevotees(
      [...paid].sort((a, b) => b.sevaAmount - a.sevaAmount).slice(0, 5)
    )
  
    if (!recordSnap.exists()) {
      await setDoc(recordRef, { payments: {} })
    }
  }  

  /* ===============================
     ANALYTICS
  =============================== */
  const loadAnalytics = async () => {
    const months = getLastMonths(6)
    const stats = []
    let cash = 0
    let online = 0

    for (const m of months) {
      const snap = await getDoc(doc(db, "sevaRecords", m))
      const payments = snap.exists() ? snap.data().payments || {} : {}

      let total = 0
      Object.values(payments).forEach(p => {
        if (p.status === "paid") {
          total++
          if (p.mode === "cash") cash++
          if (p.mode === "online") online++
        }
      })

      stats.push({ month: m, total })
    }

    setMonthlyStats(stats)
    setPaymentSplit({ cash, online })
  }

  useEffect(() => {
    if (userRole) {
      loadDashboard()
      loadAnalytics()
    }
  }, [userRole, selectedMonth])

  /* ===============================
     ACTIONS
  =============================== */
  const markPaid = async (devoteeId, mode) => {
    try {
      const recordRef = doc(db, "sevaRecords", selectedMonth)
      const recordSnap = await getDoc(recordRef)
  
      let payments = {}
  
      if (recordSnap.exists()) {
        payments = recordSnap.data().payments || {}
      }
  
      payments[devoteeId] = {
        status: "paid",
        mode,
        markedAt: new Date().toISOString(),
      }
  
      // ✅ Save payment record
      await setDoc(recordRef, { payments }, { merge: true })
  
      // ✅ Find devotee details
      const devotee = unpaidList.find(d => d.id === devoteeId)
      if (!devotee) return
  
      // ✅ Save payment history
      await addDoc(collection(db, "paymentHistory"), {
        devoteeId,
        devoteeName: devotee.name,
        amount: Number(devotee.sevaAmount),
        mode,
        month: selectedMonth,
        createdAt: new Date(),
      })
  
      // ✅ Refresh dashboard instantly
      await loadDashboard()
      await loadAnalytics()
    } catch (error) {
      console.error("Payment error:", error)
      alert("Failed to mark payment")
    }
  }
  
  const markUnpaid = async (devoteeId) => {
    try {
      const ref = doc(db, "sevaRecords", selectedMonth)
      const snap = await getDoc(ref)
  
      if (!snap.exists()) return
  
      const payments = { ...(snap.data().payments || {}) }
      delete payments[devoteeId]
  
      await setDoc(ref, { payments }, { merge: true })
  
      await loadDashboard()
      await loadAnalytics()
    } catch (err) {
      console.error("Undo failed", err)
      alert("Failed to undo payment")
    }
  }  

  /* ===============================
     EXPORT
  =============================== */
  const exportPaidToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      paidList.map(d => ({
        Name: d.name,
        Amount: d.sevaAmount,
        Mode: d.paymentMode,
        Month: selectedMonth,
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Paid Devotees")
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([buffer]), `Paid_${selectedMonth}.xlsx`)
  }

  if (!userRole) return <p>Loading…</p>

  /* ===============================
     CHART DATA
  =============================== */
  const pieData = {
    labels: ["Collected", "Pending"],
    datasets: [
      {
        data: [totalCollected, totalPending],
        backgroundColor: ["#4caf50", "#f44336"],
      },
    ],
  }

  const lineData = {
    labels: monthlyStats.map(m => m.month),
    datasets: [
      {
        label: "Paid Devotees",
        data: monthlyStats.map(m => m.total),
        borderColor: "#bf360c",
        backgroundColor: "rgba(191,54,12,0.15)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="dashboard-bg">
      <Navbar />

      <div className="section header">
        <h1>Hare Krishna 🙏</h1>
        <p>Nitya Seva Dashboard • {selectedMonth}</p>
      </div>
      
      <div className="month-selector">
  <label>Select Month:</label>
  <select
    value={selectedMonth}
    onChange={e => setSelectedMonth(e.target.value)}
  >
    {getLastMonths(12).map(m => (
      <option key={m} value={m}>{m}</option>
    ))}
  </select>
</div>

      <div className="section charts">
        <Pie data={pieData} />
        <Line data={lineData} />
      </div>

      <div className="cards">
        <div className="card expected">₹{totalExpected}<br />Expected</div>
        <div className="card collected">₹{totalCollected}<br />Collected</div>
        <div className="card pending">₹{totalPending}<br />Pending</div>
      </div>

      {/* 🔴 PENDING DEVOTEES */}
      <div className="table-wrap">
        <h3>⏳ Pending Devotees – {selectedMonth}</h3>

        {unpaidList.length === 0 && <p>All devotees have paid 🙏</p>}

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Seva ₹</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {unpaidList.map(d => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>₹{d.sevaAmount}</td>
                <td>
                  <button className="btn" onClick={() => markPaid(d.id, "cash")}>
                    Cash
                  </button>
                  <button className="btn online" onClick={() => markPaid(d.id, "online")}>
                    Online
                  </button>
                  <button className="btn undo" onClick={() => markUnpaid(d.id)}>
                    Undo
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ PAID DEVOTEES */}
      <div className="table-wrap">
        <h3>✅ Paid Devotees</h3>
        <button className="btn" onClick={exportPaidToExcel}>
          Export Excel
        </button>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Mode</th>
            </tr>
          </thead>
          <tbody>
            {paidList.map(d => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>₹{d.sevaAmount}</td>
                <td className={`badge ${d.paymentMode}`}>
                  {d.paymentMode}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard
