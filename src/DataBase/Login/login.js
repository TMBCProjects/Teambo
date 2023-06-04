import { Collections } from "../../utils/Collections";
import { getDocument, setDocument, signIn } from "../../utils/FirebaseUtils";


export default async function  registerLogin (email,password) {
  const userCred = await signIn(email, password);
  return userCred.user;
};

export async function readManagers(user) {
    let manager = null
    const q = setDocument(Collections.managers,user);
    const docSnap = await getDocument(q);
    if (docSnap.exists()) {
        manager = { id: docSnap.id, data: docSnap.data() };
    }
    return manager;
}

export async function readTeammate(user) {
    let teammate = null;
    const q = setDocument(Collections.teammates, user);
    const docSnap = await getDocument(q);
    if (docSnap.exists()) {
        teammate = { id: docSnap.id, data: docSnap.data() };
    }
    return teammate;
}

