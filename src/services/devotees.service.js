import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "./firebase"
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp
} from "firebase/firestore"

export const addDevoteeFromPayment = async (payment) => {
  const q = query(
    collection(db, "devotees"),
    where("phone", "==", payment.phone)
  )

  const existing = await getDocs(q)

  if (existing.empty) {
    await addDoc(collection(db, "devotees"), {
      name: payment.name,
      phone: payment.phone,
      sevaAmount: payment.amount,
      source: "payment",
      active: true,
      birthday: "",
      anniversary: "",
      notes: "Auto-added from payment",
      createdAt: Timestamp.now(),
    })
  }
}


/* ===== GET ALL DEVOTEES ===== */
export const getDevotees = async () => {
  const snap = await getDocs(collection(db, "devotees"))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/* ===== ADD DEVOTEE ===== */
export const addDevotee = async (data) => {
  return await addDoc(collection(db, "devotees"), {
    ...data,
    active: true,
    createdAt: new Date(),
  })
}

/* ===== UPDATE DEVOTEE ===== */
export const updateDevotee = async (id, data) => {
  return await updateDoc(doc(db, "devotees", id), data)
}

/* ===== ACTIVATE / DEACTIVATE ===== */
export const setDevoteeActive = async (id, active) => {
  return await updateDoc(doc(db, "devotees", id), { active })
}
