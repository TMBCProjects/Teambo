import {
  arrayUnion,
  collection,
  query,
  where,
} from 'firebase/firestore'
import { firestoreDB } from '../../firebase-config'
import Company from '../../Modals/DB/Company'
import Manager from '../../Modals/DB/Manager'
import { Collections } from '../../utils/Collections'
import { Fields } from '../../utils/Fields'
import {
  addDocument,
  createUser,
  getDocuments,
  updateDocument,
  updateUser,
} from "../../utils/FirebaseUtils";

export default async function defaultFn() {
}

//READS
export async function readCompanies() {
  let data = []
  const querySnapshot = await getDocuments(query(
    collection(firestoreDB, Collections.companies),
    where(Fields.isActive, '==', true),
  ))
  querySnapshot.forEach((doc) => {
    var company = new Company()
    company = {
      id: doc.id,
      companyName: doc.data().companyName,
      designations: doc.data().designations,
    }
    data.push(company)
  })
  return data
}
//WRITES
export async function writeCompany(name) {
  var company = new Company()
  company = {
    companyName: name,
    isActive: true,
  }
  const cred = await addDocument(Collections.companies, company)
  return cred.id
}

export async function writeDesignation(companyId, name) {
  await updateDocument(Collections.companies, { designations: arrayUnion(name) }, companyId)
}

export async function addNewManager(docId, user) {
  var manager = new Manager()
  manager = {
    managerName: user.name || "",
    companyName: user.companyName,
    companyId: user.companyId,
    designation: user.designation,
    profileImage:user?.profileImage || "",
    isActive: true,
    managerEmail: user.email,
    whatsappNumber: user.whatsappNumber,
  }
  await addDocument(Collections.managers, manager, docId)
}

export async function addNewTeammate(docId, user) {
  var teammate = new Manager()
  teammate = {
    teammateName: user.name || "",
    companyName: user.companyName,
    profileImage: user?.profileImage || "",
    companyId: user.companyId,
    designation: user.designation,
    isActive: true,
    teammateEmail: user.email,
    whatsappNumber: user.whatsappNumber,
    typeOfEmployement: user.typeofEmployment
  };
  await addDocument(Collections.teammates, teammate, docId)
}
//SIGNUP
export async function registerUser(doc, user) {
  if (user.designation === Collections.Manager) {
    await addNewManager(doc, user)
  } else {
    await addNewTeammate(doc, user)
  }
}

export async function registerLogin(user) {
  const cred = await createUser(user)
  updateUser(user)
  await registerUser(cred.user.uid, user)
}


export async function checkUser(email) {
  let user = {};
  const querySnapshot = await getDocuments(query(
    collection(firestoreDB, Collections.managers),
    where(Fields.managerEmail, '==', email),
  ))
  if (!querySnapshot.empty) {
    querySnapshot.forEach((doc) => {
      user = {
        uid: doc.id,
        photoURL: 'Manager'
      }
    })
    return user;
  } else {
    const querySnapshot2 = await getDocuments(query(
      collection(firestoreDB, Collections.teammates),
      where(Fields.teammateEmail, '==', email),
    ))
    if (!querySnapshot2.empty) {
      querySnapshot2.forEach((doc) => {
        user = {
          uid: doc.id,
          photoURL: 'Teammate'
        }
      })
      return user;
    } else {
      return null;
    }
  }

}

