import React, { useState, useEffect } from "react";
import { Avatar, Badge, Input, Modal } from "antd";
import { PlayCircleFilled } from "@ant-design/icons";
import "../Attendence/main.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  markAttendanceSure,
  readAttendanceByManagerId,
} from "../../../../../DataBase/Analytics/attendance";
import Loader from "../../../../LoadingModal";
import moment from "moment/moment";
import { readTeammatesByMangerId } from "../../../../../DataBase/Manager/manager";
import ProfilePic from "../../../../Common/ProfilePic/ProfilePic";
import { Collections } from "../../../../../utils/Collections";
import { setCollection } from "../../../../../utils/FirebaseUtils";
import { onSnapshot, query, where } from "firebase/firestore";
import { Fields } from "../../../../../utils/Fields";

const { Search } = Input;

const Index = () => {
  const [attendance, setAttendance] = useState([]);
  const [searchText, setSearchText] = useState([]);
  const [attendanceSelected, setAttendanceSelected] = useState({});
  const [teammates, setTeammates] = useState([]);
  const [currentDate, setCurrentDate] = useState(moment());
  const [loading, setLoading] = useState(false);
  const dates = [];
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const showModal = (obj) => {
    setAttendanceSelected(obj);
    setOpen(true);
  };
  const onSearch = (value) => {
    setSearchText(value);
  };
  const handleOk = async () => {
    await markAttendanceSure(attendanceSelected.id);
    setConfirmLoading(true);
    const userId = sessionStorage.getItem("userId");
    const data = await readAttendanceByManagerId(userId);
    setAttendance(data);
    setTimeout(() => {
      setAttendanceSelected({});
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
  };
  const handleCancel = () => {
    setAttendanceSelected({});
    setOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const userId = sessionStorage.getItem("userId");
      const data = await readAttendanceByManagerId(userId);
      const teamMateData = await readTeammatesByMangerId(userId);
      setTeammates(teamMateData);
      setAttendance(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const q = query(
      setCollection(Collections.attendance),
      where(Fields.managerId, "==", userId)
    );
    onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      setAttendance(data);
    });
  });

  for (let i = 0; i < 6; i++) {
    dates.push(currentDate.clone().add(i, "days").format("DD/MM/YYYY"));
  }

  const handleLeftArrowClick = () => {
    setCurrentDate(currentDate.clone().subtract(1, "days"));
  };

  const handleRightArrowClick = () => {
    setCurrentDate(currentDate.clone().add(1, "days"));
  };
  return (
    <div
      className=""
      style={{ marginTop: "0", width: "100%" }}>
      <div className="searchHeader">
        <Search
          placeholder="Search"
          allowClear
          onSearch={onSearch}
          style={{
            width: 250,
          }}
        />{" "}
        {/* <div className="bodie">
          Work hour per day &nbsp;
          <InputNumber
            min={1}
            max={10}
            defaultValue={3}
            onChange={onChange}
          />{" "}
          &nbsp;hr
        </div> */}
        <div className="footee">
          <p>
            <FontAwesomeIcon
              className="fa"
              icon={faCheck}
              style={{ color: "#485EB4" }}
            />{" "}
            Present
          </p>
          <p>
            <FontAwesomeIcon
              className="fa"
              icon={faXmark}
              style={{ color: "#485EB4" }}
            />{" "}
            Absent
          </p>
        </div>
      </div>
      <table className="attendanceTable">
        <thead>
          <th>
            <td style={{ color: "#7E89AC" }}>Employee Name</td>
          </th>
          <th>
            <td>
              <PlayCircleFilled
                className="arrowLeft"
                onClick={handleLeftArrowClick}
              />
            </td>
          </th>
          {dates.map((date, index) => (
            <th key={index}>{date}</th>
          ))}
          <th>
            <td>
              <PlayCircleFilled
                className="arrow"
                onClick={handleRightArrowClick}
              />
            </td>
          </th>
        </thead>
        <tbody>
          {teammates
            .filter((info) => {
              return info?.data?.teammateName.includes(searchText);
            })
            .map((info, index) => (
              <tr key={index}>
                <td>
                  <div className="teammateData">
                    <Badge
                      dot
                      status="success">
                      {info?.data?.profileImage ? (
                        <Avatar
                          size={40}
                          src={info?.data?.profileImage}
                        />
                      ) : (
                        <ProfilePic initial={info?.data?.teammateName} />
                      )}
                    </Badge>
                    <div>
                      <p style={{ fontWeight: "Bold", fontSize: "1rem" }}>
                        {info.data.teammateName}
                      </p>
                      <p style={{ color: "#BCBCBC", fontSize: "1rem" }}>
                        {info.data.designation}
                      </p>
                    </div>
                    <Badge
                      count={25}
                      className="attendanceBadge"
                    />
                  </div>
                </td>
                <td></td>
                {dates.map((date, index) => {
                  const attendanceInfo = attendance.find(
                    (a) =>
                      a.attendanceMarkedDate &&
                      a.attendanceMarkedDate === date &&
                      a.teammateId === info.id
                  );
                  return (
                    <td key={index}>
                      {moment(new Date()).isSameOrAfter(
                        moment(date, "DD/MM/YYYY")
                      ) ? (
                        attendanceInfo ? (
                          <>
                            <FontAwesomeIcon
                              className="fa"
                              icon={faCheck}
                              onClick={() => {
                                showModal(attendanceInfo);
                              }}
                              style={{
                                fontSize: "25px",
                                color: attendanceInfo.isApproved
                                  ? "green"
                                  : "#000",
                              }}
                            />
                            {attendanceSelected && (
                              <Modal
                                title="Attendance Info"
                                open={open}
                                okText="Approve"
                                onOk={handleOk}
                                okButtonProps={{
                                  disabled: attendanceSelected?.isApproved,
                                }}
                                confirmLoading={confirmLoading}
                                onCancel={handleCancel}>
                                <p>
                                  This attendance was marked at{" "}
                                  {new Date(
                                    attendanceSelected?.attendanceMarked
                                      ?.seconds * 1000
                                  ).toLocaleString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                  <br />
                                  {attendanceSelected?.attendanceApprovedTime
                                    ? "Approved At : " +
                                      new Date(
                                        attendanceSelected
                                          ?.attendanceApprovedTime?.seconds *
                                          1000
                                      ).toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                      })
                                    : ""}
                                  <br />
                                  {attendanceSelected?.workingHours
                                    ? "Total Worked Hours : " +
                                      new Date(
                                        Math.floor(
                                          attendanceSelected?.workingHours *
                                            60 *
                                            60 *
                                            1000
                                        )
                                      )
                                        .toISOString()
                                        .substr(11, 5) +
                                      " Hrs"
                                    : ""}
                                </p>
                              </Modal>
                            )}
                          </>
                        ) : (
                          <FontAwesomeIcon
                            className="fa"
                            icon={faXmark}
                            style={{
                              fontSize: "25px",
                              color: "#000",
                            }}
                          />
                        )
                      ) : (
                        <div>-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
      <Loader
        loading={loading}
        text="Getting attendance ..."
      />
    </div>
  );
};

export default Index;
