import React, { useEffect, useState } from "react";
import { BellOutlined } from "@ant-design/icons";
import { Empty } from "antd";
import { Button } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import Loader from "../LoadingModal";
import "../Notification/main.css";
import { deleteRequest } from "../..//utils/FirebaseUtils";
import {
  clearNotifications,
  clearNotificationWithId,
  readTeammateNotifications,
  readRequestsTeammate,
  requestAcceptTeammate,
  requestRejectTeammate,
  readTasksByTeammate,
} from "../../DataBase/Teammate/teammate";
import {
  readManagerNotifications,
  readTasksByManager,
} from "../../DataBase/Manager/manager";
import { NavLink } from "react-router-dom";

export default function Notification() {
  const [notificationList, setNotificationList] = useState([]);
  const [requests, setRequests] = useState([{}]);
  const [userData, setUserData] = useState({
    data: { teammateName: " ", teammateEmail: " " },
    id: " ",
  });
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(false);

  const timeStampDiff = (date1, date2) => {
    const diffMs = date1 - date2;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    if (diffDays <= 0) {
      return <>{diffHours} Hrs</>;
    } else {
      return <>{diffDays} Days</>;
    }
  };

  const timeStampDiffValue = (date1, date2) => {
    const diffMs = date1 - date2;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  async function fetchData() {
    try {
      const userId = sessionStorage.getItem("userId");
      const userLogged = sessionStorage.getItem("LoggedIn");

      const [taskFetched, notificationFetched] =
        userLogged === "manager"
          ? await Promise.all([
              readTasksByManager(userId),
              readManagerNotifications(userId),
            ])
          : await Promise.all([
              readTasksByTeammate(userId),
              readTeammateNotifications(userId),
            ]);
      setNotificationList(notificationFetched);
      setTaskList(taskFetched);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const clearOnlyOne = (notificationId) => {
    clearNotificationWithId(notificationId);
    fetchData();
  };

  const clearAll = async (teammateId) => {
    await clearNotifications(teammateId);
    fetchData();
  };

  const timeStampFormatChange = (stamp) => {
    if (stamp === "--") {
      return "--";
    }
    const timestamp = new Date(stamp.seconds * 1000);
    let dateOnly = timestamp.toLocaleDateString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return <>{dateOnly}</>;
  };

  useEffect(() => {
    let obj = sessionStorage.getItem("userData");
    if (obj) {
      let data = JSON.parse(obj);
      setUserData(data);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (sessionStorage.getItem("LoggedIn") !== "manager") {
        const requestData = await readRequestsTeammate(
          userData.data.teammateEmail
        );
        setRequests(requestData);
      }
    };
    fetchData();
    return () => {};
  }, [userData]);

  const accept = async (
    teammateEmail,
    name,
    managerId,
    teammateId,
    companyId,
    companyName,
    requestId,
    managerName
  ) => {
    requestAcceptTeammate(
      teammateEmail,
      name,
      managerId,
      teammateId,
      companyId,
      companyName,
      managerName,
      requestId
    );
    let obj = sessionStorage.getItem("userData");
    if (obj) {
      let data = JSON.parse(obj);
      data.data.currentManagerName = managerName;
      setUserData(data);
      await deleteRequest(requestId);
      setRequests((old) => {
        return requests.filter((req) => req.id !== requestId);
      });
    }
  };

  const reject = async (
    teammateEmail,
    name,
    managerId,
    teammateId,
    requestId
  ) => {
    requestRejectTeammate(
      teammateEmail,
      name,
      managerId,
      teammateId,
      requestId
    );
    await deleteRequest(requestId);
    setRequests((old) => {
      return requests.filter((req) => req.id !== requestId);
    });
  };

  return (
    <>
      <div className="notification">
        <div
          className="addTaskHead"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span className="Tasktitle">
              <BellOutlined className="icon" /> Notifications
            </span>
          </div>
          <div className="clear">
            <Button
              style={{ fontWeight: "bold" }}
              onClick={() => {
                clearAll(sessionStorage.getItem("userId"));
              }}
            >
              Clear all notifications
            </Button>
          </div>
        </div>
        {notificationList.length > 0 ? (
          <>
            {sessionStorage.getItem("LoggedIn") === "teammate" && (
              <div>
                <div className="workDetails" style={{ marginBottom: "5vh" }}>
                  <div className="userDetailsHead">
                    {/* <button onClick={() => setSecurityEditable(false)}><EditOutlined /></button> */}
                  </div>
                </div>
              </div>
            )}
            <div>
              {sessionStorage.getItem("LoggedIn") === "teammate" ? (
                <div className="notificationBody">
                  {notificationList
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((info) => {
                      return (
                        <div key={info.id} className="notify">
                          {(info.type === "NEW_TASK" && (
                            <span>
                              {info.managerName} assigned a new task to you:{" "}
                              {info.title}.
                            </span>
                          )) ||
                            (info.type === "REQUEST_FROM_MANAGER" && (
                              <span className="requestNotify">
                                <span>
                                  {info.title} has requested you to join his
                                  team.
                                </span>

                                <span>
                                  {requests?.map((info) => {
                                    return (
                                      <button
                                        className="reqBtn accept"
                                        style={{ width: "5vh", height: "5vh" }}
                                        onClick={() =>
                                          accept(
                                            userData?.data.teammateEmail,
                                            userData?.data.teammateName,
                                            info.managerId,
                                            userData?.id,
                                            info.companyId,
                                            info.companyName,
                                            info.id,
                                            info.managerName
                                          )
                                        }
                                      >
                                        <CheckOutlined />
                                      </button>
                                    );
                                  })}
                                </span>
                              </span>
                            )) ||
                            (info.type === "ARCHIVED_TASK" && (
                              <span>
                                Task titled "{info.title}" is deleted.
                              </span>
                            )) ||
                            (info.type === "CORRECTION_ADDED" && (
                              <span>
                                 {info.managerName} commented on the task "{info.title}": "{info.description}".
                              </span>
                            )) ||
                            (info.type === "QUERY_REPLIED" && (
                              <span>
                                {info.managerName} replied to your query "
                                {info.title}".
                              </span>
                            )) ||
                            (info.type === "APPROVED_TASK" && (
                              <span>
                                Task titled "{info.title}" is approved.
                              </span>
                            )) ||
                            (info.type === "NEW_TASK_REASSIGNED" && (
                              <span>
                                {info.managerName} reassigned the task{" "}
                                {info.title} to you.
                              </span>
                            )) ||
                            (info.type === "DEADLINE_UPDATED" && (
                              <span>
                                {info.managerName} updated the deadline of "
                                {info.title}" to{" "}
                                {timeStampFormatChange(info.newDeadline)}.
                              </span>
                            ))}
                          <Button
                            style={{ fontWeight: "bold" }}
                            onClick={() => {
                              clearOnlyOne(info.id);
                            }}
                          >
                            X
                          </Button>
                        </div>
                      );
                    })}
                </div>
              ) : (
                ""
              )}

              {sessionStorage.getItem("LoggedIn") === "manager" ? (
                <div className="managerNotification">
                  {notificationList.map((info) => {
                    return (
                      <div key={info.id} className="notify">
                        {(info.type === "REQUEST_REJECTED" && (
                          <span>{info.title} has rejected your request.</span>
                        )) ||
                          (info.type === "REQUEST_ACCEPTED" && (
                            <span>{info.title} has joined your team.</span>
                          )) ||
                          (info.type === "QUERY_ADDED" && (
                            <span>
                              New Task titled "{info.title}" assigned to you.
                            </span>
                          )) ||
                          (info.type === "DONE_TASK" && (
                            <span>
                              {info.teammateName} completed the task: "
                              {info.title}"
                            </span>
                          )) ||
                          (info.type = "CORRECTION_ADDED" && (
                            <span>
                              {info.teammateName} added new correction: "
                              {info.title}"
                            </span>
                          ))}
                        <Button
                          style={{ fontWeight: "bold" }}
                          onClick={() => {
                            clearOnlyOne(info.id);
                          }}
                        >
                          X
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                ""
              )}
            </div>
          </>
        ) : (
          <div style={{ marginTop: "10vh" }}>
            <Empty description={<span>No Notifications</span>} />
          </div>
        )}
        {/* Reminder */}
        <div>
          {taskList
            .filter((info) => {
              return (
                new Date(info.deadline.seconds * 1000) < new Date() &&
                info.status !== "DONE"
              );
            })
            .map((info) => {
              return (
                <div className="notify">
                  Reminder: The task "{info.title}" is overdue by{" "}
                  {timeStampDiff(
                    new Date(),
                    new Date(info.deadline.seconds * 1000)
                  )}
                </div>
              );
            })}
        </div>
        {/* Heads up */}
        <div>
          {taskList
            .filter((info) => {
              return (
                timeStampDiffValue(
                  new Date(),
                  new Date(info.deadline.seconds * 1000)
                ) < 4 &&
                info.status !== "DONE" &&
                timeStampDiffValue(
                  new Date(info.deadline.seconds * 1000),
                  new Date()
                ) > 0
              );
            })
            .map((info) => {
              return (
                <div className="notify">
                  Heads up: The project "{info.title}" is approaching its
                  deadline in{" "}
                  {timeStampDiff(
                    new Date(info.deadline.seconds * 1000),
                    new Date()
                  )}
                </div>
              );
            })}
        </div>
        <Loader loading={loading} text="Getting Notifications ..." />
      </div>
    </>
  );
}
