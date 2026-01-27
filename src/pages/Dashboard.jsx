import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
} from "firebase/firestore"

import { Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"

import { auth, db } from "../services/firebase"
import Navbar from "../components/Navbar"

ChartJS.register(ArcElement, Tooltip, Legend)

/* ===== HELPERS ===== */
const getCurrentMonthKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

/* ===== STYLES ===== */
const cardStyle = {
  flex: 1,
  minWidth: "240px",
  padding: "20px",
  borderRadius: "10px",
  background: "#f5f7fa",
  textAlign: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
}

const sectionStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "25px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
}

const thTdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
}

const buttonStyle = {
  padding: "8px 14px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  background: "#1976d2",
  color: "#fff",
}

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  /* ===== STATE ===== */
  const [userRole, setUserRole] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey())
  const [paidList, setPaidList] = useState([])
  const [unpaidList, setUnpaidList] = useState([])
  const [totalExpected, setTotalExpected] = useState(0)
  const [totalCollected, setTotalCollected] = useState(0)
  const [totalPending, setTotalPending] = useState(0)

  /* ===== AUTH + ROLE ===== */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/")
        return
      }

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

    const payments = recordSnap.exists()
      ? recordSnap.data().payments || {}
      : {}

    const paid = []
    const unpaid = []

    devotees.forEach(d => {
      if (payments[d.id]?.status === "paid") {
        paid.push({
          ...d,
          paymentMode: payments[d.id].mode || "online",
        })
      } else {
        unpaid.push(d)
      }
    })

    setPaidList(paid)
    setUnpaidList(unpaid)

    const expected = devotees.reduce(
      (s, d) => s + Number(d.sevaAmount || 0),
      0
    )
    const collected = paid.reduce(
      (s, d) => s + Number(d.sevaAmount || 0),
      0
    )

    setTotalExpected(expected)
    setTotalCollected(collected)
    setTotalPending(expected - collected)

    if (!recordSnap.exists()) {
      await setDoc(recordRef, { payments: {} })
    }
  }

  useEffect(() => {
    if (userRole) {
      loadDashboard()
    }
  }, [userRole, selectedMonth])

  /* ===== ACTIONS ===== */
  const handleMarkPaid = async (id, mode) => {
    const ref = doc(db, "sevaRecords", selectedMonth)
    const snap = await getDoc(ref)
    const payments = snap.exists() ? snap.data().payments || {} : {}

    payments[id] = {
      status: "paid",
      mode,
      markedBy: auth.currentUser.uid,
      markedAt: new Date().toISOString(),
    }

    await setDoc(ref, { payments })

    await addDoc(collection(db, "paymentHistory"), {
      devoteeId: id,
      devoteeName:
        unpaidList.find(d => d.id === id)?.name ||
        paidList.find(d => d.id === id)?.name ||
        "",
      amount:
        unpaidList.find(d => d.id === id)?.sevaAmount ||
        paidList.find(d => d.id === id)?.sevaAmount ||
        0,
      mode,
      month: selectedMonth,
      markedBy: auth.currentUser.uid,
      markedAt: new Date(),
    })

    loadDashboard()
  }

  const handleMarkUnpaid = async (id) => {
    const ref = doc(db, "sevaRecords", selectedMonth)
    const snap = await getDoc(ref)
    if (!snap.exists()) return

    const payments = snap.data().payments || {}
    delete payments[id]

    await setDoc(ref, { payments })
    loadDashboard()
  }

  const chartData = {
    labels: ["Collected", "Pending"],
    datasets: [
      {
        data: [totalCollected, totalPending],
        backgroundColor: ["#4caf50", "#f44336"],
      },
    ],
  }

  if (!userRole) {
    return <p style={{ padding: 20 }}>Loading dashboard…</p>
  }

  /* ===== UI ===== */
  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "auto" }}>
      <Navbar />

      {/* HEADER */}
      <div style={sectionStyle}>
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        />
        <h2>Seva Dashboard</h2>
        <p>Monthly Nitya Seva • {selectedMonth}</p>
      </div>

      {/* CHART */}
      <div style={sectionStyle}>
        <h3>Seva Collection Overview</h3>
        {(totalCollected > 0 || totalPending > 0) ? (
          <div style={{ maxWidth: 400, margin: "auto" }}>
            <Pie data={chartData} />
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#666" }}>
            No data available for this month
          </p>
        )}
      </div>

      {/* SUMMARY */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={cardStyle}>₹{totalExpected}<br />Expected</div>
          <div style={cardStyle}>₹{totalCollected}<br />Collected</div>
          <div style={cardStyle}>₹{totalPending}<br />Pending</div>
        </div>
      </div>

      {/* PENDING */}
      <div style={sectionStyle}>
        <h3>Pending Devotees</h3>

        {unpaidList.length === 0 ? (
          <p>All devotees have paid 🙏</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thTdStyle}>Name</th>
                <th style={thTdStyle}>Amount</th>
                <th style={thTdStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {unpaidList.map(d => (
                <tr key={d.id}>
                  <td style={thTdStyle}>{d.name}</td>
                  <td style={thTdStyle}>₹{d.sevaAmount}</td>
                  <td style={thTdStyle}>
                    <button
                      style={buttonStyle}
                      onClick={() => handleMarkPaid(d.id, "online")}
                    >
                      Paid (Online)
                    </button>

                    {userRole === "admin" && (
                      <button
                        style={{ ...buttonStyle, background: "#2e7d32", marginLeft: 8 }}
                        onClick={() => handleMarkPaid(d.id, "cash")}
                      >
                        Paid (Cash)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAID */}
      <div style={sectionStyle}>
        <h3>Paid Devotees</h3>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Name</th>
              <th style={thTdStyle}>Amount</th>
              <th style={thTdStyle}>Mode</th>
              <th style={thTdStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paidList.map(d => (
              <tr key={d.id}>
                <td style={thTdStyle}>{d.name}</td>
                <td style={thTdStyle}>₹{d.sevaAmount}</td>
                <td style={thTdStyle}>{d.paymentMode.toUpperCase()}</td>
                <td style={thTdStyle}>
                  <button
                    style={buttonStyle}
                    onClick={() => handleMarkUnpaid(d.id)}
                  >
                    Unpaid
                  </button>
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
