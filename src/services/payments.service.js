import { db } from "./firebase"
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore"

export const addPayment = async (payment) => {
  return await addDoc(collection(db, "payments"), {
    ...payment,
    createdAt: Timestamp.now(),
  })
}

export const getPayments = async () => {
  const q = query(collection(db, "payments"), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}
