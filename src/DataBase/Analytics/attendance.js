import { query, where } from "firebase/firestore";
import { Collections } from "../../utils/Collections";
import {
  getDocuments,
  setCollection,
  updateDocument,
} from "../../utils/FirebaseUtils";
import { Fields } from "../../utils/Fields";
import Attendance from "../../Modals/DB/Attendance";

export default async function defaultFn() {}

// READS
export async function readAttendanceByManagerId(managerId) {
  const attendances = [];
      const querySnapshot = await getDocuments(
        query(
          setCollection(Collections.attendance),
          where(Fields.managerId, "==", managerId)
        )
      );
      querySnapshot.forEach((doc) => {
        const attendance = new Attendance();
        attendance.id = doc.id;
        attendance.attendanceMarked = doc.data().attendanceMarked;
        attendance.workingHours = doc.data().workingHours;
        attendance.attendanceMarkedDate = doc.data().attendanceMarkedDate;
        attendance.workingHours = doc.data().workingHours;
        attendance.attendanceEndMarked = doc.data().attendanceEndMarked;
        attendance.attendanceApprovedTime = doc.data().attendanceApprovedTime;
        attendance.companyId = doc.data().companyId;
        attendance.companyName = doc.data().companyName;
        attendance.isApproved = doc.data().isApproved;
        attendance.managerId = doc.data().managerId;
        attendance.teammateId = doc.data().teammateId;
        attendance.teammateName = doc.data().teammateName;
        attendances.push(attendance);
      });
  return attendances;
}
export async function markAttendanceSure(attendanceId) {
  await updateDocument(
    Collections.attendance,
    { attendanceApprovedTime: new Date(), isApproved: true },
    attendanceId
  );
}