import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// export const firebaseConfig = {
//   apiKey: "AIzaSyBLbHcHqnTMClDa12ibW4oYuFdJ32Nv-pI",
//   authDomain: "teambo-c231b.firebaseapp.com",
//   databaseURL: "https://teambo-c231b-default-rtdb.firebaseio.com",
//   projectId: "teambo-c231b",
//   storageBucket: "teambo-c231b.appspot.com",
//   messagingSenderId: "913130016248",
//   appId: "1:913130016248:web:45fc7e991e3afe9d765a0d",
// };
export const firebaseConfig = {
  apiKey: "AIzaSyC-AMBzDXUijnSma4VltNmU7hgtsgORNwc",
  authDomain: "teamboapp-160bb.firebaseapp.com",
  projectId: "teamboapp-160bb",
  storageBucket: "teamboapp-160bb.appspot.com",
  messagingSenderId: "481379118688",
  appId: "1:481379118688:web:b181a7615d1af544c99d05",
  measurementId: "G-X7JGW93VRB",
};
export const fire = initializeApp(firebaseConfig);
export const auth = getAuth(fire);
export const firestoreDB = getFirestore(fire);
export const storageRef = getStorage(fire);
