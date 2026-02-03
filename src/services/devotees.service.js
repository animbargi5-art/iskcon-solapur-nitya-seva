import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore"
import { db } from "./firebase"

/* ===============================
   COLLECTION REF
================================ */
const devoteesRef = collection(db, "devotees")

/* ===============================
   REALTIME LISTENER
================================ */
export const listenToDevotees = (setDevotees) => {
  return onSnapshot(devoteesRef, (snapshot) => {
    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }))
    setDevotees(list)
  })
}

/* ===============================
   GET ALL DEVOTEES
================================ */
export const getDevotees = async () => {
  const q = query(devoteesRef, orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }))
}

/* ===============================
   ADD DEVOTEE (MANUAL)
================================ */
export const addDevotee = async (data) => {
  await addDoc(devoteesRef, {
    ...data,
    active: data.active ?? true,
    source: data.source ?? "manual",
    createdAt: data.createdAt ?? new Date(),
  })
}

/* ===============================
   UPDATE DEVOTEE
================================ */
export const updateDevotee = async (id, data) => {
  await updateDoc(doc(db, "devotees", id), data)
}

/* ===============================
   ACTIVATE / DEACTIVATE
================================ */
export const setDevoteeActive = async (id, active) => {
  await updateDoc(doc(db, "devotees", id), { active })
}

/* =========================================
   🔥 AUTO ADD FROM PAYMENT (CRITICAL)
========================================= */
export const addDevoteeFromPayment = async (payment) => {
  const q = query(devoteesRef, where("phone", "==", payment.phone))
  const snap = await getDocs(q)

  // Already exists → do nothing
  if (!snap.empty) return

  // New devotee from payment
  await addDoc(devoteesRef, {
    name: payment.name,
    phone: payment.phone,
    whatsapp: payment.phone,
    sevaAmount: Number(payment.amount),
    active: true,
    source: "payment",
    createdAt: new Date(),
  })
}
