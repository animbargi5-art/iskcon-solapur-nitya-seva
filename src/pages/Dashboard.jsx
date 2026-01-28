import "../styles/dashboard.css"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
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
} from "chart.js"

import { auth, db } from "../services/firebase"
import Navbar from "../components/Navbar"

/* ===== REGISTER CHARTS ===== */
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
)

/* ===== HELPERS ===== */
const getCurrentMonthKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

const getLastMonths = (count = 6) => {
  const months = []
  const date = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  return months
}

function Dashboard() {
  const navigate = useNavigate()

  /* ===== STATE ===== */
  const [userRole, setUserRole] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey())

  const [paidList, setPaidList] = useState([])
  const [unpaidList, setUnpaidList] = useState([])

  const [totalExpected, setTotalExpected] = useState(0)
  const [totalCollected, setTotalCollected] = useState(0)
  const [totalPending, setTotalPending] = useState(0)

  const [monthlyStats, setMonthlyStats] = useState([])
  const [paymentSplit, setPaymentSplit] = useState({ online: 0, cash: 0 })
  const [topDevotees, setTopDevotees] = useState([])

  const [paidFilter, setPaidFilter] = useState("all")
  const [paidSearch, setPaidSearch] = useState("")
  const [devoteeSearch, setDevoteeSearch] = useState("")
  const [minAmount, setMinAmount] = useState("")

  /* ===== AUTH ===== */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return navigate("/")
      const snap = await getDoc(doc(db, "users", user.uid))
      setUserRole(snap.exists() ? snap.data().role : "member")
    })
    return () => unsub()
  }, [navigate])

  /* ===== LOAD DASHBOARD ===== */
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
        paid.push({ ...d, paymentMode: payments[d.id].mode })
      } else {
        unpaid.push(d)
      }
    })

    setPaidList(paid)
    setUnpaidList(unpaid)

    const expected = devotees.reduce((s, d) => s + Number(d.sevaAmount || 0), 0)
    const collected = paid.reduce((s, d) => s + Number(d.sevaAmount || 0), 0)

    setTotalExpected(expected)
    setTotalCollected(collected)
    setTotalPending(expected - collected)

    setTopDevotees([...paid].sort((a, b) => b.sevaAmount - a.sevaAmount).slice(0, 5))

    if (!recordSnap.exists()) {
      await setDoc(recordRef, { payments: {} })
    }
  }

  /* ===== ANALYTICS ===== */
  const loadAnalytics = async () => {
    const months = getLastMonths(6)
    const stats = []
    let online = 0
    let cash = 0

    for (const month of months) {
      const snap = await getDoc(doc(db, "sevaRecords", month))
      const payments = snap.exists() ? snap.data().payments || {} : {}
      let total = 0

      Object.values(payments).forEach(p => {
        if (p.status === "paid") {
          total++
          if (p.mode === "online") online++
          if (p.mode === "cash") cash++
        }
      })

      stats.push({ month, total })
    }

    setMonthlyStats(stats)
    setPaymentSplit({ online, cash })
  }

  useEffect(() => {
    if (userRole) {
      loadDashboard()
      loadAnalytics()
    }
  }, [userRole, selectedMonth])

  /* ===== ACTIONS ===== */
  const markPaid = async (id, mode) => {
    const ref = doc(db, "sevaRecords", selectedMonth)
    const snap = await getDoc(ref)
    const payments = snap.exists() ? snap.data().payments || {} : {}

    payments[id] = { status: "paid", mode, markedAt: new Date().toISOString() }
    await setDoc(ref, { payments })

    await addDoc(collection(db, "paymentHistory"), {
      devoteeId: id,
      devoteeName: unpaidList.find(d => d.id === id)?.name,
      amount: unpaidList.find(d => d.id === id)?.sevaAmount,
      mode,
      month: selectedMonth,
      markedAt: new Date(),
    })

    loadDashboard()
    loadAnalytics()
  }

  const markUnpaid = async (id) => {
    const ref = doc(db, "sevaRecords", selectedMonth)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const payments = snap.data().payments || {}
    delete payments[id]
    await setDoc(ref, { payments })
    loadDashboard()
    loadAnalytics()
  }

  /* ===== EXPORT ===== */
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

  /* ===== CHART DATA ===== */
  const pieData = {
    labels: ["Collected", "Pending"],
    datasets: [{ data: [totalCollected, totalPending], backgroundColor: ["#4caf50", "#f44336"] }],
  }

  const lineData = {
    labels: monthlyStats.map(m => m.month),
    datasets: [{
      label: "Paid Devotees",
      data: monthlyStats.map(m => m.total),
      borderColor: "#bf360c",
      backgroundColor: "rgba(191,54,12,0.15)",
      fill: true,
      tension: 0.4,
    }],
  }

  return (
    <div className="dashboard-bg">
      <Navbar />

      <div className="section header">
        <h1>Hare Krishna 🙏</h1>
        <p>Nitya Seva Dashboard • {selectedMonth}</p>
        <small>“Everything belongs to Krishna” — Srila Prabhupada</small>
      </div>

      <div className="section"><Pie data={pieData} /></div>
      <div className="section"><Line data={lineData} /></div>

      {/* SUMMARY */}
      <div className="cards">
        <div className="card expected">₹{totalExpected}<br />Expected</div>
        <div className="card collected">₹{totalCollected}<br />Collected</div>
        <div className="card pending">₹{totalPending}<br />Pending</div>
      </div>

      {/* PAID TABLE */}
      <div className="table-wrap">
        <h3>✅ Paid Devotees</h3>
        <button className="btn" onClick={exportPaidToExcel}>Export Excel</button>

        <table className="table">
          <thead>
            <tr><th>Name</th><th>Amount</th><th>Mode</th><th>Action</th></tr>
          </thead>
          <tbody>
            {paidList.map(d => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>₹{d.sevaAmount}</td>
                <td><span className={`badge ${d.paymentMode}`}>{d.paymentMode}</span></td>
                <td><button className="btn undo" onClick={() => markUnpaid(d.id)}>Undo</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Dashboard
