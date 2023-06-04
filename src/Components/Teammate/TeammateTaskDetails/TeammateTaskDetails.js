import React, { useState, useEffect } from "react";
import "./main.css";
import { Button, Input, message } from "antd";
import {
  PauseOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  RightOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { LeftOutlined } from "@ant-design/icons";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import doubleTick from "../../../Assets/doubleTick.svg";
import { Link } from "react-router-dom";
import {
  addDescriptionByTeammate,
  markTaskDone,
  pauseTask,
  playTask,
  readCommunications,
} from "../../../DataBase/Teammate/teammate";
import { uid } from "uid";
import { addDescription } from "../../../DataBase/Manager/manager";
import Avatar from "antd/es/avatar/avatar";
import { doc, onSnapshot } from "firebase/firestore";
import { firestoreDB } from "../../../firebase-config";
import sendEmail from "../../../utils/Email";
import { MdArchive } from "react-icons/md";
const { TextArea } = Input;

const TeammateTaskDetails = () => {
  const [time, setTime] = useState(0);
  const [correctionMode, setCorrectionMode] = useState(false);
  const [query, setQuery] = useState("");
  const [queries, setQueries] = useState([]);
  const [item, setItem] = useState(
    JSON.parse(sessionStorage.getItem("selectedTask"))
  );

  const currentUser = JSON.parse(sessionStorage.getItem("userData")).data
    .managerName;
  useEffect(() => {
    const data = item.communications.map((communication) => {
      if (communication.type === "QUERY_ADDED") {
        return {
          query: communication.query,
          id: communication.id,
          type: communication.type,
          correctionNo: communication.correctionNo,
          queryId: communication.queryId,
          queryNo: communication.queryNo,
        };
      } else if (communication.type === "QUERY_REPLIED") {
        return {
          queryReplied: communication.queryReplied,
          id: communication.id,
          type: communication.type,
          correctionNo: communication.correctionNo,
          queryId: communication.queryId,
        };
      } else {
        return {
          description: communication.description,
          id: communication.id,
          corrections: communication.corrections,
          type: communication.type,
        };
      }
    });
    setQueries(data);
  }, [item]);

  useEffect(() => {
    const updateTime = () => {
      setTime(
        hoursInFullFormat(item?.totalHours, item?.startTimeStamp) || "0 Hrs"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => {
      clearInterval(interval);
    };
  }, [item]);
  const hoursInFullFormat = (decimalHour, startTime) => {
    var decimalTimeString = String(decimalHour);
    var decimalTime = parseFloat(decimalTimeString);
    decimalTime = decimalTime * 60 * 60;
    if (startTime !== null && startTime !== undefined) {
      var startTimeInSeconds = startTime.seconds * 1000;
      var currentTimeInSeconds = new Date().getTime();
      var timeDifferenceInSeconds = currentTimeInSeconds - startTimeInSeconds;
      decimalTime += timeDifferenceInSeconds / 1000;
    }
    var days = Math.floor(decimalTime / (24 * 60 * 60));
    decimalTime = decimalTime - days * 24 * 60 * 60;
    var hours = Math.floor(decimalTime / (60 * 60));
    decimalTime = decimalTime - hours * 60 * 60;
    var minutes = Math.floor(decimalTime / 60);
    var seconds = Math.floor(decimalTime % 60);

    if (days > 0) {
      return "" + days + " Days " + hours + " Hrs ";
    } else if (hours > 0) {
      return "" + hours + " Hrs " + minutes + " Mins";
    } else if (minutes > 0) {
      return "" + minutes + " Mins " + seconds + " Secs";
    } else {
      return "" + seconds + " Secs";
    }
  };

  const timeStampFormatChange = (stamp) => {
    if (stamp === undefined) {
      return "-- | --";
    }
    const timestamp = new Date(stamp.seconds * 1000);
    let dateOnly = timestamp.toLocaleDateString("default", {
      day: "numeric",
      month: "short",
    });
    let timeOnly = timestamp.toLocaleTimeString("default", {
      hour: "2-digit",
      minute: "numeric",
      hour12: true,
    });
    return (
      <>
        {dateOnly} | {timeOnly}
      </>
    );
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

  const doneTask = (teammateId, title, managerId, taskId) => {
    if (item.status !== "Done") {
      const { data } = JSON.parse(sessionStorage.getItem("userData"));
      markTaskDone(
        {
          createdAt: new Date(),
          createdBy: teammateId,
          createdByEmail: data.teammateEmail,
          teammateName: data.teammateName,
          managerId: managerId,
          teammateId: teammateId,
          title: title,
        },
        taskId
      );
      item.status = "DONE";
      sessionStorage.setItem("selectedTask", JSON.stringify(item));
      setItem(JSON.parse(sessionStorage.getItem("selectedTask")));
    }
  };

  const textColor = (status) => {
    switch (status) {
      case "ON_GOING":
        return { color: "#01875A" };
      case "PAUSED":
        return { color: "#fcad00" };
      case "ASSIGNED":
        return { color: "#000000" };
      case "DONE":
        return { color: "#2785ff" };
      case "ARCHIVED":
        return { color: "#c40000" };
      default:
        return;
    }
  };
  const bgColor = (status) => {
    switch (status) {
      case "ON_GOING":
        return {
          backgroundColor: "#01875A",
          color: "#fff",
        };
      case "PAUSED":
        return {
          backgroundColor: "#fcad00",
          color: "#fff",
        };
      case "ASSIGNED":
        return {
          backgroundColor: "#000000",
          color: "#fff",
        };
      case "DONE":
        return {
          backgroundColor: "#2785ff",
          color: "#fff",
        };
      case "APPROVED":
        return {
          backgroundColor: "#802392",
          color: "#fff",
        };
      case "ARCHIVED":
        return {
          backgroundColor: "#fff",
          color: "#c40000",
        };
      default:
        return;
    }
  };
  function max(arr) {
    let n = -1;
    arr.forEach((ar) => {
      if (ar > n) n = ar;
    });
    return n;
  }

  useEffect(() => {
    const unsub = onSnapshot(
      doc(firestoreDB, "tasks", item.id),
      { includeMetadataChanges: true },
      async (doc) => {
        if (doc.exists) {
          let task = {};
          const promise = readCommunications(doc).then((communications) => {
            task = {
              id: doc.id,
              assigned: doc.data().assigned,
              companyName: doc.data().companyName,
              companyId: doc.data().companyId,
              clientId: doc.data().clientId,
              clientEmail: doc.data().clientEmail,
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
          });
          await Promise.resolve(promise);

          setItem(task);
        } else {
          message.error("Document does not exist");
        }
      }
    );
    return async () => {
      unsub();
    };
  }, [item]);

  const handleSubmit = async (title) => {
    const date = new Date();
    const correctionNo = max(
      queries.map((communication) => communication.corrections)
    );
    const queryNo =
      max(
        queries
          .filter((item1) => item1.type === "QUERY_ADDED")
          .map((communication) => communication.queryNo)
      ) + 1;
    const queryId = `Q-${uid(5)}`;
    try {
      const { id, data } = JSON.parse(sessionStorage.getItem("userData"));
      const feedback = {
        createdAt: date,
        createdBy: id,
        createdByEmail: data.teammateEmail,
        isVisible: true,
        managerId: item.managerId,
        teammateId: id,
        correctionNo: correctionNo,
        queryId,
        teammateName: item.teammateName,
        query: query,
        queryNo,
        type: "QUERY_ADDED",
      };
      const updateCorrection = await addDescriptionByTeammate(
        feedback,
        title,
        item.id
      );
      const qur = {
        query,
        correctionNo: correctionNo,
        id: updateCorrection.id,
        type: "QUERY_ADDED",
        queryNo,
      };
      setQueries([...queries, qur]);
      setCorrectionMode(false);
      setQuery("");
    } catch (error) {
      message.error(error);
    }
  };
  const handleStatusIconClick = () => {
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
      case "DONE":
        action = doneTask;
        break;
      default:
        action = () => {};
        break;
    }
    action(item.teammateId, item.id);
  };
  return (
    <div
      className="addtask"
      style={{ height: "100%", overflowY: "auto" }}>
      {
        <div className="addTaskHead task-details-header">
          <div>
            <Link to={"/"}>
              <LeftOutlined className="icon task-details-icon" />
              <span className="Tasktitle task-details-back">back</span>
            </Link>
          </div>
          <div className="task-status">
            <p style={textColor(item.status)}>{item.status}</p>
            <div
              onClick={handleStatusIconClick}
              className="status-icon task-details-status-icon"
              style={bgColor(item.status)}>
              {item.status === "ON_GOING" ? (
                <PauseOutlined />
              ) : item.status === "DONE" ? (
                <CheckOutlined />
              ) : item.status === "APPROVED" ? (
                <CheckCircleOutlined
                  style={{ color: "#fff", fontSize: "1.5rem" }}
                />
              ) : item.status === "ARCHIVED" ? (
                <MdArchive
                  size={30}
                  style={{ color: "#c40000" }}
                />
              ) : (
                <RightOutlined />
              )}
            </div>
          </div>
        </div>
      }

      <div className="Taskform task-details-form">
        <div className="task-details-row1">
          <div className="task-details-row1-col1">
            <div className="task-detail-point">
              <p>Task</p>
              <p>{item.title}</p>
            </div>
            <div className="task-detail-point">
              <p>Client</p>
              <p>{item.clientName}</p>
            </div>
            <div className="task-detail-point">
              <p>Type</p>
              <p className="link-detail">{item.type}</p>
            </div>
          </div>
          <div className="task-details-row1-col2">
            <div className="task-detail-point assigned">
              <p>Assigned</p>
              <p>{timeStampFormatChange(item.assigned)}</p>
            </div>
            <div className="task-detail-point">
              <p>Due</p>
              <p className="link-detail">
                {timeStampFormatChange(item.deadline)}
              </p>
            </div>
          </div>
        </div>
        <div className="task-details-row2">
          <VerticalTimeline layout="1-column-left">
            <VerticalTimelineElement
              icon={
                <div>
                  <PlusOutlined />
                </div>
              }>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                }}>
                <p
                  className="correction-button"
                  onClick={() => setCorrectionMode(!correctionMode)}>
                  Add Feedback
                </p>
                <div className="approve-button">
                  <p>
                    <span>{time}</span>
                  </p>
                  {item.status === "APPROVED" ? (
                    <Button
                      style={{ background: "#802392", color: "#fff" }}
                      shape="round"
                      icon={
                        <CheckCircleOutlined
                          style={{ color: "#fff", fontSize: "2rem" }}
                        />
                      }>
                      Approved
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        doneTask(
                          item.teammateId,
                          item.title,
                          item.managerId,
                          item.id
                        );
                      }}
                      type="primary"
                      shape="round"
                      style={{ marginLeft: 1 + "rem" }}
                      icon={
                        <img
                          src={doubleTick}
                          alt="double tick"
                        />
                      }>
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>

              {correctionMode && (
                <div className="correction-textarea">
                  <TextArea
                    rows={6}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Add Feedback"
                    bordered={false}
                  />
                  <Button
                    className="textarea-button"
                    onClick={() => handleSubmit(item.title)}
                    style={{ background: "#C40000" }}>
                    <CheckOutlined />
                  </Button>
                  <Button
                    className="textarea-button"
                    style={{ background: "#207892" }}
                    onClick={() => setCorrectionMode(false)}>
                    <CloseOutlined />
                  </Button>
                </div>
              )}
            </VerticalTimelineElement>

            {queries

              .filter((item1) => {
                return (
                  item1.type === "DESCRIPTION_ADDED" ||
                  item1.type === "CORRECTION_ADDED"
                );
              })
              .sort((a, b) => {
                return b.corrections - a.corrections;
              })
              .map((item1) => (
                <VerticalTimelineElement
                  className="vertical-timeline-element--work"
                  iconStyle={{
                    background: "#fff",
                    color: "#2D5C6B",
                    fontWeight: "bold",
                  }}
                  key={item1.id}
                  icon={
                    <p>
                      {item1.corrections === 0
                        ? item1.corrections
                        : "+" + item1.corrections}
                    </p>
                  }>
                  <div>
                    <p>{item1.description}</p>
                    {queries
                      .filter((q) => {
                        return (
                          q.type === "QUERY_ADDED" &&
                          q.correctionNo === item1.corrections
                        );
                      })
                      ?.sort((a, b) => {
                        return b.queryNo - a.queryNo;
                      })
                      .map((q) => {
                        return (
                          <>
                            <div className="query">
                              <Avatar
                                size={20}
                                icon={<UserOutlined />}
                              />
                              <p>{q.query}</p>
                            </div>
                            {queries
                              ?.filter((q1) => {
                                return (
                                  q1.type === "QUERY_REPLIED" &&
                                  q1.queryId === q.queryId
                                );
                              })
                              .map((q2) => {
                                return (
                                  <div className="query query-reply">
                                    <p>{q2.queryReplied}</p>
                                    <Avatar
                                      size={20}
                                      icon={<UserOutlined />}
                                    />
                                  </div>
                                );
                              })}
                          </>
                        );
                      })}
                  </div>
                </VerticalTimelineElement>
              ))}
          </VerticalTimeline>
        </div>
        <div className="task-details-row3"></div>
      </div>
    </div>
  );
};

export default TeammateTaskDetails;
