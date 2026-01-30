import { db } from "./firebase"
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore"
import { addDevoteeFromPayment } from "./devotees.service"

const paymentsRef = collection(db, "payments")

export const addPayment = async (paymentData) => {
  // 1️⃣ Save payment
  await addDoc(paymentsRef, {
    ...paymentData,
    createdAt: serverTimestamp(),
  })

  // 2️⃣ Auto add devotee
  await addDevoteeFromPayment(paymentData)
}

export const getPayments = async () => {
  const q = query(collection(db, "payments"), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}
