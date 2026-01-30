import { useState } from "react"
import { addPayment } from "../services/payments.service"
import { addDevoteeFromPayment } from "../services/devotees.service"
import Navbar from "../components/Navbar"
import { paymentMessage } from "../utils/whatsappTemplates"

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
    
    window.open(
      `https://wa.me/91${phone}?text=${paymentThankYouMessage(name, amount)}`,
      "_blank"
    )
    
    await addPayment({
      name,
      phone,
      amount,
    })
    await addDevoteeFromPayment({
      name,
      phone,
      amount,
    })

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <Navbar />
      <h2>Add Payment</h2>

      <form onSubmit={handlePayment}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
        <input type="number" placeholder="Amount ₹" value={amount} onChange={e => setAmount(e.target.value)} required />
        
        <a
          href={`https://wa.me/91${p.phone}?text=${paymentMessage(p.name, p.amount)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          Send Receipt 💰
        </a>

        <button type="submit" disabled={loading}>
          Record Payment
        </button>
      </form>
    </div>
  )
}

}
export default Payments
