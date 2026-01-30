import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore"
import { db } from "./firebase"

/* ===============================
   COLLECTION REFERENCE
   (IMPORTANT: DO NOT rename `collection`)
================================ */
const devoteesRef = collection(db, "devotees")

/* ===============================
   GET ALL DEVOTEES
================================ */
export const getDevotees = async () => {
  const q = query(devoteesRef, orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data(),
  }))
}

/* ===============================
   ADD DEVOTEE
================================ */
export const addDevotee = async data => {
  await addDoc(devoteesRef, {
    ...data,
    createdAt: data.createdAt || new Date(),
  })
}

/* ===============================
   UPDATE DEVOTEE
================================ */
export const updateDevotee = async (id, data) => {
  const ref = doc(db, "devotees", id)
  await updateDoc(ref, data)
}

/* ===============================
   ACTIVATE / DEACTIVATE
================================ */
export const setDevoteeActive = async (id, active) => {
  const ref = doc(db, "devotees", id)
  await updateDoc(ref, { active })
}

/* ===============================
   ADD DEVOTEE FROM PAYMENT
================================ */
export const addDevoteeFromPayment = async payment => {
  if (!payment?.name || !payment?.phone) return

  await addDoc(devoteesRef, {
    name: payment.name,
    phone: payment.phone,
    whatsapp: payment.phone,
    sevaAmount: Number(payment.amount || 0),
    source: "payment",
    active: true,
    createdAt: new Date(),
  })
}
