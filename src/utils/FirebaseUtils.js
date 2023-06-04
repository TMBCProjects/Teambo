import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { auth, firestoreDB, storageRef } from "../firebase-config";
import { Collections } from "./Collections";
// import speakeasy from "speakeasy";
import { Buffer } from "buffer";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
// import sendEmail from "./Email";
global.Buffer = Buffer;

export function addDocument(collectionName, data, id) {
  const docRef =
    id !== undefined
      ? setDocument(collectionName, id)
      : setCollection(collectionName);
  return id !== undefined ? setDoc(docRef, data) : addDoc(docRef, data);
}

export function addSubDocument(
  collectionName,
  collectionId,
  subCollectionName,
  data,
  subCollectionId
) {
  const subcollectionRef =
    subCollectionId !== undefined
      ? setSubDocument(
          collectionName,
          collectionId,
          subCollectionName,
          subCollectionId
        )
      : setSubCollection(collectionName, collectionId, subCollectionName);

  return subCollectionId !== undefined
    ? setDoc(subcollectionRef, data)
    : addDoc(subcollectionRef, data);
}

export function updateDocument(collectionName, data, id) {
  return updateDoc(setDocument(collectionName, id), data);
}

export function setDocument(collectionName, id) {
  return doc(firestoreDB, collectionName, id);
}
export function setSubDocument(
  collectionName,
  id,
  subCollectionName,
  subCollectionId
) {
  return doc(
    firestoreDB,
    collectionName,
    id,
    subCollectionName,
    subCollectionId
  );
}
export function setSubCollection(collectionName, id, subCollectionName) {
  return collection(firestoreDB, collectionName, id, subCollectionName);
}
export function setCollection(collectionName) {
  return collection(firestoreDB, collectionName);
}
export function getDocuments(query) {
  return getDocs(query);
}

export function getDocument(query) {
  return getDoc(query);
}

export function createUser(user) {
  return createUserWithEmailAndPassword(auth, user.email, user.password);
}

export function updateUser(user) {
  return updateProfile(auth.currentUser, {
    photoURL:
      user.designation === Collections.Manager
        ? Collections.Manager
        : Collections.Teammate,
    displayName: user.name,
  });
}
export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function resetPassword(email) {
  try {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset email sent!");
        window.location.href = "/";
      })
      .catch((error) => {
        if (error === "Firebase: Error (auth/user-not-found).")
          alert("USER NOT FOUND");
      });
  } catch (error) {
    console.error(error);
  }
}

export function logOut() {
  sessionStorage.clear();
  return signOut(auth);
}

export async function changePasswordWithCurrentPassword(
  currentPassword,
  newPassword
) {
  try {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(
      user?.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    alert("Password updated. Account logged off for security.");
  } catch (error) {
    console.error(error);
  }
}
export async function uploadPhoto(id, file) {
  try {
    const fileName = file.name;
    const storage = ref(storageRef, `profileImages/${id}/${fileName}`);
    await uploadBytes(storage, file);
    const downloadURL = await getDownloadURL(storage);
    return downloadURL;
  } catch (error) {
    console.error(error);
    throw new Error("Error uploading photo");
  }
}

export async function deleteRequest(id) {
  await deleteDoc(doc(firestoreDB, Collections.requests, id));
}

export async function deleteTask(id) {
  await deleteDoc(doc(firestoreDB, Collections.tasks, id));
}

// const generateOTP = () => {
//   try {
//     const secret = speakeasy.generateSecret({ length: 20 });
//     const otp = speakeasy.totp({
//       secret: secret.base32,
//       encoding: "ascii",
//       step: 600,
//       digits: 6,
//     });
//     return { otp, secret: secret.base32 };
//   } catch (error) {
//     console.log(error.message);
//   }
// };
// export function verifyOTP(otp) {
//   const verified = speakeasy.totp.verify({
//     secret: sessionStorage.getItem("otpSecret"),
//     encoding: "ascii",
//     step: 600,
//     digits: 6,
//     token: otp,
//   });
//   if (verified === true) {
//     sessionStorage.setItem("otpVerified", true);
//     return true;
//   } else {
//     sessionStorage.setItem("otpVerified", false);
//     return false;
//   }
// }
// export async function sendResetPasswordEmail(email, otp) {
//   const output = `
//     <h4> Your One-Time Password for Teambo</h4>
//     <br />
//     <p>Dear User,<br/><br/>
//       As requested, we have generated a one-time password (OTP) for your Teambo account.<br/><br/>
//       Your OTP is: ${otp}<br/><br/>
//       Please enter this code in the provided field to complete the login process. Note that this OTP will expire in 10 minutes.<br/>
//       If you did not request this OTP, please contact our support team immediately.<br/><br/>
//       Best regards,<br/>
//       Teambo team</p>`;
//   const subject = "Your One-Time Password for Teambo";
//   const sent = sendEmail(email, subject, output);
//   return sent;
// }
// export async function changePassword(password) {
//   try {
//     const otpVerifed = sessionStorage.getItem("otpVerified");
//     if (otpVerifed) {
// const email = sessionStorage.getItem("email");
// const otp = sessionStorage.getItem("otp");
//       await updatePassword(auth, password);
//       sessionStorage.removeItem("email");
//       sessionStorage.removeItem("otp");
//       sessionStorage.removeItem("otpSecret");
//       sessionStorage.removeItem("otpVerifed");
//       return true;
//     }
//   } catch (error) {
//     console.log(error);
//     return false;
//   }
// }
