import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "./firebase"

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
