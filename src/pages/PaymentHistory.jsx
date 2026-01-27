import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "../services/firebase"
import Navbar from "../components/Navbar"

/* ===== STYLES ===== */
const sectionStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
}

const thTdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
}

function PaymentHistory() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  /* ===== FETCH PAYMENT HISTORY ===== */
  const fetchPayments = async () => {
    setLoading(true)

    const q = query(
      collection(db, "paymentHistory"),
      orderBy("markedAt", "desc")
    )

    const snap = await getDocs(q)

    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))

    setPayments(list)
    setLoading(false)
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <Navbar />

      <div style={sectionStyle}>
        <h2>Payment History</h2>
        <p>All Nitya Seva payments (Online & Cash)</p>
      </div>

      <div style={sectionStyle}>
        <input
          type="text"
          placeholder="Search by devotee name or month (YYYY-MM)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "15px",
          }}
        />

        {loading ? (
          <p>Loading payments...</p>
        ) : payments.length === 0 ? (
          <p>No payment history found.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thTdStyle}>Date</th>
                <th style={thTdStyle}>Devotee</th>
                <th style={thTdStyle}>Amount</th>
                <th style={thTdStyle}>Mode</th>
                <th style={thTdStyle}>Month</th>
              </tr>
            </thead>

            <tbody>
              {payments
                .filter(
                  (p) =>
                    p.devoteeName
                      ?.toLowerCase()
                      .includes(search.toLowerCase()) ||
                    p.month?.includes(search)
                )
                .map((p) => (
                  <tr key={p.id}>
                    <td style={thTdStyle}>
                      {p.markedAt?.toDate
                        ? p.markedAt.toDate().toLocaleDateString()
                        : new Date(p.markedAt).toLocaleDateString()}
                    </td>
                    <td style={thTdStyle}>{p.devoteeName}</td>
                    <td style={thTdStyle}>₹{p.amount}</td>
                    <td style={thTdStyle}>
                      {p.mode === "cash" ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          CASH
                        </span>
                      ) : (
                        <span style={{ color: "#1976d2" }}>ONLINE</span>
                      )}
                    </td>
                    <td style={thTdStyle}>{p.month}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default PaymentHistory
