import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCjR1GsY5ZdSe8OUU4w7AShnLzj4ZakKNM",
  authDomain: "iskcon-solapur-nitya-seva.firebaseapp.com",
  projectId: "iskcon-solapur-nitya-seva",
  storageBucket: "iskcon-solapur-nitya-seva.appspot.com",
  messagingSenderId: "341860269935",
  appId: "1:341860269935:web:df8919f3f16d43a5d3f29a",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
