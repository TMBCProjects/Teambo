import React, { useCallback, useState } from "react";
import icon from "../../../src/icon.png";
import { useNavigate } from "react-router-dom";
import { DatePicker, Avatar } from "antd";
import { deleteTask, updateDue } from "../../DataBase/Manager/manager";
import moment from "moment";
import { CaretDownOutlined } from "@ant-design/icons";
import { pauseTask, playTask } from "../../DataBase/Teammate/teammate";
import ProfilePic from "../Common/ProfilePic/ProfilePic";
import { MdArchive } from "react-icons/md";

const ListView = ({ tasks, filter1, filter2, filter3, filter4, filter5 }) => {
  const [item, setItem] = useState(
    JSON.parse(sessionStorage.getItem("selectedTask"))
  );

  const [taskData, setTaskData] = useState([]);
  const navigate = useNavigate();
  const timeStampFormatChange = (stamp) => {
    if (stamp === "--") {
      return "--";
    }
    var today = new Date();
    const timestamp = new Date(stamp.seconds * 1000);
    if (timestamp.toLocaleDateString() === today.toLocaleDateString()) {
      return "Today";
    } else {
      let dateOnly = timestamp.toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      });
      return <>{dateOnly}</>;
    }
  };

  const setTask = useCallback(
    (task) => {
      sessionStorage.setItem("selectedTask", JSON.stringify(task));
      navigate("/task");
    },
    [navigate]
  );

  const changeDeadline = async (value, id, tasks) => {
    const dateString = `${value.date()}/${value.month() + 1}/${value.year()}`;
    const timeString = `${value.hour()}:${value.minute()}:${value.second()}`;
    let userDatas = JSON.parse(sessionStorage.getItem("userData"));
    const managerName = userDatas.data.managerName;
    await updateDue(id, { dateString, timeString }, tasks, managerName);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };
  const formatMonthYear = (date) => {
    return date.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  };

  const startTask = (teammateId, taskId) => {
    playTask(taskId, teammateId);
    let stat = {
      status: "ON_GOING",
    };
    setItem({ ...item, ...stat });
    sessionStorage.setItem("selectedTask", JSON.stringify(item));
    setItem(JSON.parse(sessionStorage.getItem("selectedTask")));
  };

  const pauseOnGoingTask = (teammateId) => {
    pauseTask(teammateId);
    let stat = {
      status: "PAUSED",
    };
    setItem({ ...item, ...stat });
    sessionStorage.setItem("selectedTask", JSON.stringify(item));
    setItem(JSON.parse(sessionStorage.getItem("selectedTask")));
  };
  
  const handleArchieveTask = async (item) => {
    const { id, data } = JSON.parse(sessionStorage.getItem("userData"));
    await deleteTask(
      {
        createdAt: new Date(),
        createdBy: id,
        createdByEmail: data.managerEmail,
        managerName: data.managerName,
        managerId: id,
        teammateId: item.teammateId,
        title: item.title,
      },
      item.id
    );
  };

  const handleStatusIconClick = (item) => {
    let action;
    switch (item.status) {
      case "ASSIGNED":
        action = startTask;
        break;
      case "ON_GOING":
        action = pauseOnGoingTask;
        break;
      case "PAUSED":
        action = startTask;
        break;
      default:
        action = () => {};
        break;
    }
    action(item.teammateId, item.id);
  };

  // sort the data using date
  const sortDataAsc = () => {
    const sorted = tasks.sort((a, b) => b.deadline - a.deadline);
    setTaskData(sorted);
  };

  // // delete the task by id
  // const handleDeleteTaskById = async () => {
  //   const tasks = JSON.parse(sessionStorage.getItem("tasks"));
  //   const taskId = tasks[0]["id"];
  //   await deleteTask(taskId);
  // };

  return (
    <div className="WIPTable">
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Type</th>
            <th>Task</th>
            {sessionStorage.getItem("LoggedIn") === "manager" && <th> </th>}
            <th>Assigned</th>
            <th style={{ cursor: "pointer" }}>
              Due
              <CaretDownOutlined onClick={sortDataAsc} />
            </th>
            <th>Correction</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks
            ?.filter((info) => {
              const filter1Result =
                filter1.value !== "Any"
                  ? filter1.value === "Today"
                    ? formatDate(new Date()) ===
                      formatDate(new Date(info.assigned.seconds * 1000))
                    : filter1.value === "Month"
                    ? formatMonthYear(new Date()) ===
                      formatMonthYear(new Date(info.assigned.seconds * 1000))
                    : filter1.value === "Year"
                    ? new Date().getFullYear() ===
                      new Date(info.assigned.seconds * 1000).getFullYear()
                    : true
                  : true;

              const filter2Result =
                filter2.value !== "Any"
                  ? filter2.value === info.teammateName
                  : true;
              const filter3Result =
                filter3.value !== "Any"
                  ? filter3.value === info.clientName
                  : true;
              const filter4Result =
                filter4.value !== "Any" ? filter4.value === info.type : true;
              const filter5Result =
                filter5.value !== "Any" ? filter5.value === info.status : true;

              return (
                filter1Result &&
                filter2Result &&
                filter3Result &&
                filter4Result &&
                filter5Result
              );
            })
            ?.sort((a, b) => {
              if (a.highPriority && !b.highPriority) {
                return -1;
              } else if (!a.highPriority && b.highPriority) {
                return 1;
              }
              return 0;
            })
            ?.map(
              (item, index) =>
                tasks.filter(
                  (task) => task.teammateName === item.teammateName
                ) && (
                  <tr key={item.id}>
                    <td>{item.clientName}</td>
                    <td>{item.type}</td>
                    <td>{item.title}</td>
                    {sessionStorage.getItem("LoggedIn") === "manager" && (
                      <td style={{ width: "4%" }}>
                        {item?.profileImage ? (
                          <Avatar size={40} src={item?.profileImage || icon} />
                        ) : (
                          <ProfilePic initial={item?.teammateName} />
                        )}
                      </td>
                    )}
                    <td>{timeStampFormatChange(item.assigned || "--")}</td>
                    <td
                      className="due"
                      style={{
                        color: "#2785FF",
                        cursor: "pointer",
                      }}
                    >
                      <label
                        style={{
                          cursor: "pointer",
                          color: "#01875A",
                          marginLeft:
                            sessionStorage.getItem("LoggedIn") === "manager" &&
                            "1.2rem",
                        }}
                        htmlFor={`dateid ${index}`}
                      >
                        {timeStampFormatChange(item.deadline || "--")}
                      </label>

                      {sessionStorage.getItem("LoggedIn") === "manager" && (
                        <DatePicker
                          style={{ visibility: "hidden", width: "0" }}
                          placement="bottomLeft"
                          id={`dateid ${index}`}
                          disabledDate={(current) =>
                            current && current < moment().startOf("day")
                          }
                          showTime
                          onChange={(value) => {
                            changeDeadline(value, item.id, {
                              title: item.title,
                              teammateId: item.teammateId,
                              managerId: item.managerId,
                              teammateEmail: item.teammateEmail,
                            });
                          }}
                        />
                      )}
                    </td>
                    <td>{item.corrections}</td>
                    <td
                      onClick={() => {
                        handleStatusIconClick(item);
                      }}
                      style={
                        (item.status === "ON_GOING" && {
                          background: "#01875A",
                          color: "white",
                          cursor: "pointer",
                        }) ||
                        (item.status === "PAUSED" && {
                          background: "#FCAD00",
                          color: "white",
                          cursor: "pointer",
                        }) ||
                        (item.status === "ASSIGNED" && {
                          background: "#000000",
                          color: "white",
                          cursor: "pointer",
                        }) ||
                        (item.status === "DONE" && {
                          background: "#2785ff",
                          color: "white",
                          cursor: "pointer",
                        }) ||
                        (item.status === "APPROVED" && {
                          background: "#802392",
                          color: "white",
                          cursor: "pointer",
                        })
                      }
                    >
                      {item.status === "ASSIGNED" && "ASSIGNED"}
                      {item.status === "ON_GOING" && "ON_GOING"}
                      {item.status === "PAUSED" && "PAUSED"}
                      {item.status === "DONE" && "DONE"}
                      {item.status === "APPROVED" && "APPROVED"}
                    </td>
                    <td
                      onClick={() => {
                        setTask(item);
                      }}
                      style={{
                        background: "rgb(8, 16, 36)",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      View
                    </td>
                    {sessionStorage.getItem("LoggedIn") === "manager" && (
                      <td
                        onClick={() => handleArchieveTask(item)}
                        style={{
                          background: "red",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        <MdArchive size={22} />
                      </td>
                    )}
                  </tr>
                )
            )}
        </tbody>
      </table>
    </div>
  );
};

export default ListView;
