import { useState } from "react"
import { addPayment } from "../services/payments.service"
import { addDevoteeFromPayment } from "../services/devotees.service"
import Navbar from "../components/Navbar"

function Payments() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePayment = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payment = {
      name,
      phone,
      amount: Number(amount),
      status: "paid",
      method: "manual",
    }

    await addPayment(payment)
    await addDevoteeFromPayment(payment)

    setName("")
    setPhone("")
    setAmount("")
    setLoading(false)

    alert("Payment recorded & devotee auto-added 🙏")
  }

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <Navbar />
      <h2>Add Payment</h2>

      <form onSubmit={handlePayment}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
        <input type="number" placeholder="Amount ₹" value={amount} onChange={e => setAmount(e.target.value)} required />

        <button type="submit" disabled={loading}>
          Record Payment
        </button>
      </form>
    </div>
  )
}

export default Payments
