import { query, where } from "firebase/firestore";
import Client from "../../Modals/DB/Client";
import Communication from "../../Modals/DB/Communication";
import Request from "../../Modals/DB/Request";
import NewTask from "../../Modals/DB/NewTask";
import Type from "../../Modals/DB/Type";
import Notification from "../../Modals/DB/Notification";
import { Collections } from "../../utils/Collections";
import { Fields } from "../../utils/Fields";
import {
  addDocument,
  addSubDocument,
  getDocument,
  getDocuments,
  setCollection,
  setDocument,
  setSubCollection,
  updateDocument,
  uploadPhoto,
} from "../../utils/FirebaseUtils";
import { Notifications } from "../../utils/Notifications";
import { message } from "antd";

export default async function defaultFn() {}

//READS
export async function readTasksByManager(managerId) {
  try {
    const tasks = [];
    const querySnapshot = await getDocuments(
      query(
        setCollection(Collections.tasks),
        where(Fields.managerId, "==", managerId),
        where(Fields.isLive, "==", true)
      )
    );
    const promises = [];
    querySnapshot.forEach((doc) => {
      const promise = readCommunications(doc).then((communications) => {
        const task = {
          id: doc.id,
          assigned: doc.data().assigned,
          companyName: doc.data().companyName,
          companyId: doc.data().companyId,
          clientId: doc.data().clientId,
          clientEmail: doc.data().clientEmail,
          profileImage: doc.data().profileImage,
          clientName: doc.data().clientName,
          corrections: doc.data().corrections,
          createdAt: doc.data().createdAt,
          createdBy: doc.data().createdBy,
          createdByEmail: doc.data().createdByEmail,
          deadline: doc.data().deadline,
          isLive: doc.data().isLive,
          managerId: doc.data().managerId,
          status: doc.data().status,
          pauseTimeStamp: doc.data()?.pauseTimeStamp,
          startTimeStamp: doc.data()?.startTimeStamp,
          completedOn: doc.data().completedOn,
          taskId: doc.data().taskId,
          teammateId: doc.data().teammateId,
          teammateName: doc.data().teammateName,
          teammateEmail: doc.data().teammateEmail,
          title: doc.data().title,
          totalHours: doc.data().totalHours,
          totalPauseHours: doc.data().totalPauseHours,
          highPriority: doc.data().highPriority,
          type: doc.data().type,
          communications: communications,
        };
        tasks.push(task);
      });
      promises.push(promise);
    });
    await Promise.all(promises);

    sessionStorage.setItem("tasks", JSON.stringify(tasks));
    //sessionStorage.setItem("tasks", tasks);
    return tasks;
  } catch (err) {
    return [];
  }
}

export async function readApprovedTasksByManager(managerId) {
  try {
    const tasks = [];
    const querySnapshot = await getDocuments(
      query(
        setCollection(Collections.tasks),
        where(Fields.managerId, "==", managerId),
        where(Fields.status, "==", Fields.APPROVED),
        where(Fields.isLive, "==", false)
      )
    );
    const promises = [];
    querySnapshot.forEach((doc) => {
      const promise = readCommunications(doc).then((communications) => {
        const task = {
          id: doc.id,
          assigned: doc.data().assigned,
          companyName: doc.data().companyName,
          companyId: doc.data().companyId,
          clientId: doc.data().clientId,
          clientEmail: doc.data().clientEmail,
          profileImage: doc.data().profileImage,
          clientName: doc.data().clientName,
          corrections: doc.data().corrections,
          createdAt: doc.data().createdAt,
          createdBy: doc.data().createdBy,
          createdByEmail: doc.data().createdByEmail,
          pauseTimeStamp: doc.data()?.pauseTimeStamp,
          startTimeStamp: doc.data()?.startTimeStamp,
          completedOn: doc.data()?.completedOn,
          deadline: doc.data().deadline,
          isLive: doc.data().isLive,
          managerId: doc.data().managerId,
          status: doc.data().status,
          taskId: doc.data().taskId,
          teammateId: doc.data().teammateId,
          teammateName: doc.data().teammateName,
          title: doc.data().title,
          totalHours: doc.data().totalHours,
          highPriority: doc.data().highPriority,
          type: doc.data().type,
          communications: communications,
        };
        tasks.push(task);
      });
      promises.push(promise);
    });
    await Promise.all(promises);
    return tasks;
  } catch (err) {
    return [];
  }
}

export async function readArchivedTasksByManager(managerId) {
  try {
    const tasks = [];
    const querySnapshot = await getDocuments(
      query(
        setCollection(Collections.tasks),
        where(Fields.managerId, "==", managerId),
        where(Fields.status, "==", Fields.ARCHIVED),
        where(Fields.isLive, "==", false)
      )
    );
    const promises = [];
    querySnapshot.forEach((doc) => {
      const promise = readCommunications(doc).then((communications) => {
        const task = {
          id: doc.id,
          assigned: doc.data().assigned,
          companyName: doc.data().companyName,
          companyId: doc.data().companyId,
          clientId: doc.data().clientId,
          clientEmail: doc.data().clientEmail,
          profileImage: doc.data().profileImage,
          clientName: doc.data().clientName,
          corrections: doc.data().corrections,
          createdAt: doc.data().createdAt,
          createdBy: doc.data().createdBy,
          createdByEmail: doc.data().createdByEmail,
          deadline: doc.data().deadline,
          isLive: doc.data().isLive,
          managerId: doc.data().managerId,
          status: doc.data().status,
          taskId: doc.data().taskId,
          teammateId: doc.data().teammateId,
          teammateName: doc.data().teammateName,
          title: doc.data().title,
          totalHours: doc.data().totalHours,
          highPriority: doc.data().highPriority,
          type: doc.data().type,
          communications: communications,
        };
        tasks.push(task);
      });
      promises.push(promise);
    });
    await Promise.all(promises);
    return tasks;
  } catch (err) {
    return [];
  }
}

export async function readTaskById(id) {
  const docRef = setDocument(Collections.tasks, id);
  try {
    const doc = await getDocument(docRef);
    let task = {};
    if (doc.exists()) {
      const promise = readCommunications(doc).then((communications) => {
        task = {
          id: doc.id,
          assigned: doc.data().assigned,
          companyName: doc.data().companyName,
          companyId: doc.data().companyId,
          clientId: doc.data().clientId,
          clientEmail: doc.data().clientEmail,
          clientName: doc.data().clientName,
          profileImage: doc.data().profileImage,
          corrections: doc.data().corrections,
          createdAt: doc.data().createdAt,
          createdBy: doc.data().createdBy,
          pauseTimeStamp: doc.data()?.pauseTimeStamp,
          startTimeStamp: doc.data()?.startTimeStamp,
          completedOn: doc.data()?.completedOn,
          createdByEmail: doc.data().createdByEmail,
          deadline: doc.data().deadline,
          isLive: doc.data().isLive,
          managerId: doc.data().managerId,
          status: doc.data().status,
          taskId: doc.data().taskId,
          teammateId: doc.data().teammateId,
          teammateName: doc.data().teammateName,
          title: doc.data().title,
          totalHours: doc.data().totalHours,
          highPriority: doc.data().highPriority,
          type: doc.data().type,
          communications: communications,
        };
      });
      await Promise.resolve(promise);
      return task;
    } else {
      return {};
    }
  } catch (error) {
    message.error("Error while fetching data", error);
    return {};
  }
}

export async function readCommunications(doc) {
  try {
    const communications = [];
    const querySnapshot = await getDocuments(
      query(
        setSubCollection(Collections.tasks, doc.id, Collections.communications),
        where(Fields.isVisible, "==", true)
      )
    );
    querySnapshot.forEach(async (doc) => {
      let communication = new Communication();
      communication = {
        id: doc.id,
        corrections: doc.data().corrections,
        correctionNo: doc.data().correctionNo,
        createdAt: doc.data().createdAt,
        createdBy: doc.data().createdBy,
        createdByEmail: doc.data().createdByEmail,
        isVisible: doc.data().isVisible,
        managerId: doc.data().managerId,
        teammateId: doc.data().teammateId,
        query: doc.data().query,
        queryId: doc.data().queryId,
        description: doc.data().description,
        type: doc.data().type,
      };
      switch (doc.data().type) {
        case "DESCRIPTION_ADDED":
          communication.description = doc.data().description;
          break;
        case "QUERY_ADDED":
          communication.query = doc.data().query;
          communication.queryNo = doc.data().queryNo;
          break;
        case "QUERY_REPLIED":
          communication.query = doc.data().query;
          communication.queryId = doc.data().queryId;
          communication.queryReplied = doc.data().queryReplied;
          break;
        case "CORRECTION_ADDED":
          communication.description = doc.data().description;
          break;
        default:
          break;
      }
      communications.push(communication);
    });
    return communications;
  } catch (err) {
    return [];
  }
}

export async function readTeammatesByMangerId(id) {
  let teamates = [];
  const teammatesRef = setCollection(Collections.teammates);
  const q = query(
    teammatesRef,
    where(Fields.currentManagerId, "array-contains", id)
  );
  const querySnapshot = await getDocuments(q);
  querySnapshot.forEach((doc) => {
    let teamate = {
      id: doc.id,
      data: doc.data(),
    };
    teamates.push(teamate);
  });
  return teamates;
}

export async function readClientsByMangerId(id) {
  let clients = [];
  const clientsRef = setCollection(Collections.clients);
  const q = query(clientsRef, where(Fields.managerId, "==", id));
  const querySnapshot = await getDocuments(q);
  querySnapshot.forEach((doc) => {
    let client = {
      id: doc.id,
      data: doc.data(),
    };
    clients.push(client);
  });
  return clients;
}

export async function readTypesByMangerId(id) {
  let types = [];
  const typesRef = setCollection(Collections.types);
  const q = query(typesRef, where(Fields.managerId, "==", id));
  const querySnapshot = await getDocuments(q);
  querySnapshot.forEach((doc) => {
    let type = {
      id: doc.id,
      data: doc.data(),
    };
    types.push(type);
  });
  return types;
}
function convertStringToDate(dateString, timeString) {
  const dateParts = dateString.split("/");
  const timeParts = timeString.split(":");
  const year = parseInt(dateParts[2]);
  const month = parseInt(dateParts[1]) - 1;
  const day = parseInt(dateParts[0]);
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const seconds = parseInt(timeParts[2]);
  return new Date(year, month, day, hours, minutes, seconds);
}

export async function addNewTask(taskList, currentUser) {
  let deadline;

  if (!currentUser) {
    deadline = new Date(convertStringToDate(taskList.deadline, "0:0:0"));
  } else {
    deadline = taskList.deadline;
  }

  let task = new NewTask();
  task = {
    assigned: taskList.assigned,
    companyName: taskList.companyName,
    companyId: taskList.companyId,
    clientId: taskList.clientId,
    clientName: taskList.clientName,
    clientEmail: taskList.clientEmail,
    corrections: taskList.corrections,
    createdAt: taskList.createdAt,
    createdBy: taskList.createdBy,
    profileImage: taskList.profileImage,
    createdByEmail: taskList.createdByEmail,
    deadline: deadline,
    isLive: true,
    highPriority: taskList.highPriority,
    managerId: taskList.managerId,
    taskId: taskList.taskId,
    teammateId: taskList.teammateId,
    totalHours: 0,
    totalPauseHours: 0,
    teammateName: taskList.teammateName,
    teammateEmail: taskList?.teammateEmail,
    title: taskList.title,
    type: taskList.type,
    status: taskList.status,
  };

  await addNotification({
    createdAt: taskList.createdAt,
    createdBy: taskList.createdBy,
    createdByEmail: taskList.createdByEmail,
    managerId: taskList.managerId,
    managerName: currentUser || taskList.managerName,
    teammateId: taskList.teammateId,
    title: taskList.title,
    type: Notifications.NEW_TASK,
  });
  return await addDocument(Collections.tasks, task);
}

const diff_hours = (dt2, dt1) => {
  var diff =
    (new Date("" + dt2).getTime() - new Date("" + dt1).getTime()) / 1000;
  diff /= 60 * 60;
  return Math.abs(diff);
};

export async function deleteTask(task, task_id) {
  var today = new Date();
  const q = setDocument(Collections.tasks, task_id);
  const docSnap = await getDocument(q);
  if (docSnap.exists()) {
    let now = 0;
    let pauseTime = 0;
    if (docSnap.data().totalHours !== undefined) {
      now = docSnap.data().totalHours;
    }
    if (
      docSnap.data().startTimeStamp !== null &&
      docSnap.data().startTimeStamp !== undefined
    ) {
      now += diff_hours(
        today,
        new Date(docSnap.data().startTimeStamp.seconds * 1000)
      );
    }
    if (docSnap.data().totalPauseHours !== undefined) {
      pauseTime = docSnap.data().totalPauseHours;
    }
    if (
      docSnap.data().pauseTimeStamp !== null &&
      docSnap.data().pauseTimeStamp !== undefined
    ) {
      pauseTime += diff_hours(
        today,
        new Date(docSnap.data().pauseTimeStamp.seconds * 1000)
      );
    }
    updateDocument(
      Collections.tasks,
      {
        status: Fields.ARCHIVED,
        totalHours: now,
        completedOn: today,
        isLive: false,
        startTimeStamp: null,
        pauseTimeStamp: null,
        totalPauseHours: pauseTime,
      },
      docSnap.id
    );
    addNotification({
      createdAt: task.createdAt,
      createdBy: task.createdBy,
      createdByEmail: task.createdByEmail,
      managerName: task.managerName,
      managerId: task.managerId,
      teammateId: task.teammateId,
      title: task.title,
      type: Notifications.ARCHIVED_TASK,
    });
  }
}

export async function switchTask(id, oldTeammate, newTeammate, data) {
  addNotification({
    createdAt: newTeammate.createdAt,
    createdBy: newTeammate.createdBy,
    createdByEmail: newTeammate.createdByEmail,
    managerId: newTeammate.managerId,
    managerName:oldTeammate.managerName,
    teammateId: newTeammate.teammateId,
    title: newTeammate.title,
    type: Notifications.NEW_TASK,
  });
  // console.log(oldTeammate,newTeammate);
  addNotification({
    createdAt: oldTeammate.createdAt,
    createdBy: oldTeammate.createdBy,
    createdByEmail: oldTeammate.createdByEmail,
    managerId: oldTeammate.managerId,
    teammateId: oldTeammate.teammateId,
    managerName:oldTeammate.managerName,
    title: oldTeammate.title,
    type: Notifications.ARCHIVED_TASK,
  });
  return await updateDocument(Collections.tasks, data, id);
}

export async function readTeammateWhatsapp(user) {
  const q = setDocument(Collections.teammates, user);
  const docSnap = await getDocument(q);
  if (docSnap.exists()) {
      return docSnap.data().whatsappNumber
  }
}

export async function addDescription(description, id,currentUser) {
  if(!currentUser){
    addNotification({
      createdAt: description.createdAt,
      createdBy: description.createdBy,
      createdByEmail: description.createdByEmail,
      managerId: description.managerId,
      managerName: description.managerName,
      teammateId: description.teammateId,
      type: description.type,
      corrections: description.newCorrection,
      title: description.title,
      description: description.description,
      isActive: true,
      newDeadline: description.newDeadline || "",
    });
  }

  return await addSubDocument(
    Collections.tasks,
    id,
    Collections.communications,
    description
  );
}

export async function requestTeammate(
  managerId,
  managerName,
  companyId,
  companyName,
  managerEmail,
  teammateEmail
) {
  const q = query(
    setCollection(Collections.teammates),
    where(Fields.teammateEmail, "==", teammateEmail)
  );
  let teammateId = "";
  const querySnapshot = await getDocuments(q);
  querySnapshot.forEach(async (docA) => {
    teammateId = docA.id;
    let request = new Request();
    request = {
      createdAt: new Date(),
      createdBy: managerId,
      managerId: managerId,
      teammateEmail: teammateEmail,
      managerName: managerName,
      companyName: companyName,
      companyId: companyId,
      isActive: true,
    };
    return await addDocument(Collections.requests, request);
  });
  addNotification({
    createdAt: new Date(),
    createdBy: managerId,
    createdByEmail: managerEmail,
    managerName: managerName,
    managerId: managerId,
    teammateId: teammateId,
    title: managerName,
    type: Notifications.REQUEST_FROM_MANAGER,
  });
}

export async function addNotification(taskList) {
  let notification = new Notification();
  notification = {
    createdAt: taskList.createdAt,
    createdBy: taskList.createdBy,
    createdByEmail: taskList.createdByEmail,
    managerId: taskList.managerId,
    managerName: taskList.managerName,
    teammateId: taskList.teammateId,
    type: taskList.type,
    title: taskList.title,
    description: taskList.description || "",
    isActive: true,
    newDeadline: taskList.newDeadline || "",
  };
  return await addDocument(Collections.notifications, notification);
}

export async function readManagerNotifications(managerId) {
  try {
    const notifications = [];

    const query1 = query(
      setCollection(Collections.notifications),
      where(Fields.managerId, "==", managerId),
      where(Fields.isActive, "==", true)
    );

    // const query2 = query((query1),
    //   where(Fields.createdBy, "!=", teammateId),
    // );

    const querySnapshot = await getDocuments(query1);

    querySnapshot.forEach(async (doc) => {
      if (doc.data().createdBy !== managerId) {
        let notification = new Notification();
        notification = {
          id: doc.id,
          createdAt: doc.data().createdAt,
          createdBy: doc.data().createdBy,
          createdByEmail: doc.data().createdByEmail,
          isActive: doc.data().isActive,
          newDeadline: doc.data().newDeadline,
          teammateName: doc.data().teammateName,
          managerId: doc.data().managerId,
          teammateId: doc.data().teammateId,
          description: doc.data().description,
          title: doc.data().title,
          type: doc.data().type,
        };
        notifications.push(notification);
      }
    });
    return notifications;
  } catch (err) {
    return [];
  }
}

export async function clearNotifications(managerId) {
  var today = new Date();
  const q = query(
    setCollection(Collections.notifications),
    where(Fields.managerId, "==", managerId),
    where(Fields.createdBy, "!=", managerId),
    where(Fields.isActive, "==", true)
  );
  const querySnapshot = await getDocuments(q);
  querySnapshot.forEach((docA) => {
    updateDocument(
      Collections.notifications,
      {
        clearedAt: today,
        isActive: false,
      },
      docA.id
    );
  });
}

export async function clearNotificationWithId(notificationId) {
  var today = new Date();
  const q = setDocument(Collections.notifications, notificationId);
  const docSnap = await getDocument(q);
  if (docSnap.exists()) {
    updateDocument(
      Collections.notifications,
      {
        clearedAt: today,
        isActive: false,
      },
      docSnap.id
    );
  }
}

export async function approveTask(task_id) {
  var today = new Date();
  await updateDocument(
    Collections.tasks,
    {
      status: Fields.APPROVED,
      approvedTimeStamp: today,
      isLive: false,
    },
    task_id
  );
}
export async function updateCorrection(task_id, newCorrection) {
  await updateDocument(
    Collections.tasks,
    {
      corrections: newCorrection,
    },
    task_id
  );
  // addNotification({});
}
export async function updateDue(task_id, newDue, tasks, managerName) {
  const due = convertStringToDate(newDue.dateString, newDue.timeString);
  await updateDocument(
    Collections.tasks,
    {
      deadline: due,
    },
    task_id
  );

  addNotification({
    createdAt: new Date(),
    createdBy: tasks.managerId,
    createdByEmail: tasks.teammateEmail,
    managerName: managerName,
    managerId: tasks.managerId,
    teammateId: tasks.teammateId,
    title: tasks.title,
    type: Notifications.DEADLINE_UPDATED,
    newDeadline: due,
  });
}

export async function addNewClient(clientData) {
  let client = new Client();
  client = {
    clientName: clientData.clientName,
    companyId: clientData.companyId,
    companyName: clientData.companyName,
    createdAt: clientData.createdAt,
    createdBy: clientData.createdBy,
    isActive: true,
    managerId: clientData.managerId,
    managerName: clientData.managerName,
  };

  return await addDocument(Collections.clients, client);
}


export async function addNewType(typeData) {
  let type = new Type();
  type = {
    type: typeData.type,
    companyId: typeData.companyId,
    companyName: typeData.companyName,
    createdAt: typeData.createdAt,
    createdBy: typeData.createdBy,
    isActive: true,
    managerId: typeData.managerId,
    managerName: typeData.managerName,
  };

  return await addDocument(Collections.types, type);
}
export async function readTypesByCompanyId(companyId) {
  let types = [];
  const clientsRef = setCollection(Collections.types);
  const q = query(clientsRef, where(Fields.companyId, "==", companyId));
  const querySnapshot = await getDocuments(q);
  querySnapshot.forEach((doc) => {
    let client = {
      id: doc.id,
      data: doc.data(),
    };
    types.push(client);
  });
  return types;
}
export async function readClientsByCompanyId(companyId) {
  let clients = [];
  const clientsRef = setCollection(Collections.clients);
  const q = query(clientsRef, where(Fields.companyId, "==", companyId));
  const querySnapshot = await getDocuments(q);
  querySnapshot.forEach((doc) => {
    let client = {
      id: doc.id,
      data: doc.data(),
    };
    clients.push(client);
  });
  return clients;
}

export async function updateManagerDetails(managerId, userDetails) {
  try {
    let photoUrl;
    if (userDetails?.photoFile) {
      photoUrl = await uploadPhoto(managerId, userDetails.photoFile);
    }
    const q = setDocument(Collections.managers, managerId);
    const docSnap = await getDocument(q);
    if (docSnap.exists()) {
      const updateData = {
        managerName:
          userDetails.managerName === ""
            ? docSnap.data()?.managerName
            : userDetails.name,
        whatsappNumber:
          userDetails.whatsappNumber === ""
            ? docSnap.data()?.whatsappNumber
            : userDetails.whatsappNumber,
        profileImage:
          photoUrl === undefined ? docSnap.data()?.profileImage : photoUrl,
      };
      await updateDocument(Collections.managers, updateData, docSnap.id);
      return photoUrl;
    } else {
      throw new Error("Teammate does not exist");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error updating teammate details");
  }
}
