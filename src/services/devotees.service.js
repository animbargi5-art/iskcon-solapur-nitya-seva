import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  where
} from "firebase/firestore"
import { db } from "./firebase"


/* ===============================
   COLLECTION REFERENCE
   (IMPORTANT: DO NOT rename `collection`)
================================ */
const devoteesRef = collection(db, "devotees")

export const listenToDevotees = (callback) => {
  return onSnapshot(devoteesRef, (snapshot) => {
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    callback(list)
  })
}

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

/* =========================================
   🔥 AUTO ADD FROM PAYMENT (IMPORTANT)
========================================= */
export const addDevoteeFromPayment = async (payment) => {
  const q = query(devoteesRef, where("phone", "==", payment.phone))
  const snap = await getDocs(q)

  if (!snap.empty) return // already exists

  await addDoc(devoteesRef, {
    name: payment.name,
    phone: payment.phone,
    whatsapp: payment.phone,
    sevaAmount: payment.amount,
    active: true,
    source: "payment",
    createdAt: new Date(),
  })
}
