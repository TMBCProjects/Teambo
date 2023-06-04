import React, { useState, useEffect } from "react";
import "./main.css";
import { Button, Dropdown, Space, Avatar, Badge, Input, message } from "antd";
import {
  PauseOutlined,
  SwapOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  LeftOutlined,
  UserOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { DatePicker } from "antd";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import doubleTick from "../../../Assets/doubleTick.svg";
import { Link, useNavigate } from "react-router-dom";
import {
  addNewTask,
  readTeammatesByMangerId,
  switchTask,
  addDescription,
  approveTask,
  updateCorrection,
  readCommunications,
  updateDue,
  addNotification,
} from "../../../DataBase/Manager/manager";
import { onSnapshot } from "firebase/firestore";
import Loader from "../../LoadingModal";
import { uid } from "uid";
import {
  assignTask,
  markTaskDone,
  pauseTask,
  playTask,
} from "../../../DataBase/Teammate/teammate";
import { setDocument } from "../../../utils/FirebaseUtils";
import { Collections } from "../../../utils/Collections";
import ProfilePic from "../../Common/ProfilePic/ProfilePic";
import sendEmail from "../../../utils/Email";
import { Notifications } from "../../../utils/Notifications";
import { MdArchive } from "react-icons/md";
const { TextArea } = Input;

const menuStyle = {
  boxShadow: "none",
};

const Index = () => {
  const navigate = useNavigate();
  const [correctionMode, setCorrectionMode] = useState(false);
  const [correctionDone, setCorrectionDone] = useState(false);
  const [teammates, setTeammates] = useState([]);
  const [newTeammateId, setNewTeammateId] = useState("");
  const [newTeammateName, setNewTeammateName] = useState("");
  const [newTeammateIcon, setNewTeammateIcon] = useState("");
  const [newTeammateEmail, setNewTeammateEmail] = useState("");
  const [switchMode, setSwitchMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [communication, setCommunication] = useState("");
  const [communications, setCommunications] = useState([]);
  const { id, data } = JSON.parse(sessionStorage.getItem("userData"));
  const [queryReply, setQueryReply] = useState("");
  const [teammateSearch, setTeammateSearch] = useState("");
  const currentUser = JSON.parse(sessionStorage.getItem("userData")).data
    .managerName;
  const [item, setItem] = useState(
    JSON.parse(sessionStorage.getItem("selectedTask"))
  );
  useEffect(() => {
    const unsub = onSnapshot(
      setDocument(Collections.tasks, item.id),
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
              profileImage: doc.data().profileImage,
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
              teammateEmail: doc.data()?.teammateEmail,
              title: doc.data().title,
              totalHours: doc.data().totalHours,
              startTimeStamp: doc.data().startTimeStamp,
              highPriority: doc.data().highPriority,
              type: doc.data().type,
              communications: communications,
            };
          });
          await Promise.resolve(promise);

          setItem(task);
        } else {
          message.info("Document does not exist");
        }
      }
    );
    return async () => {
      unsub();
    };
  }, [item]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teammates] = await Promise.all([readTeammatesByMangerId(id)]);
        sessionStorage.setItem("teammates", JSON.stringify(teammates));
        setTeammates(teammates);
        const comm = item.communications.map((communication) => {
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
        setCommunications(comm);
      } catch (error) {
        console.error(error);
        // Handle the error here
      }
    };
    fetchData();
  }, [item, id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = JSON.parse(sessionStorage.getItem("userData"));
        const [teammates] = await Promise.all([readTeammatesByMangerId(id)]);

        sessionStorage.setItem("teammates", JSON.stringify(teammates));
        setTeammates(teammates);
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
        setCommunications(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [item]);
  const [time, setTime] = useState(0);
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
  const changeDeadline = async (value, id, tasks) => {
    const dateString = `${value.date()}/${value.month() + 1}/${value.year()}`;
    const timeString = `${value.hour()}:${value.minute()}:${value.second()}`;
    let userDatas = JSON.parse(sessionStorage.getItem("userData"));
    const managerName = userDatas.data.managerName;
    await updateDue(id, { dateString, timeString }, tasks, managerName);
  };

  const timeStampFormatChange = (stamp) => {
    if (stamp === "--") {
      return "--";
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

  // const markApproved = (data) => {
  //   if (item.status === "DONE") {
  //     approveTask(data);
  //     item.status = "APPROVED";
  //     sessionStorage.setItem("selectedTask", JSON.stringify(item));
  //     setItem(JSON.parse(sessionStorage.getItem("selectedTask")));
  //   }
  // };

  // const handleMenuClick = (e) => {
  //   const newTeammateInfo = e.key.split(",");
  //   if (newTeammateInfo[0] !== item.teammateId) {
  //     setNewTeammateId(newTeammateInfo[0]);
  //     setNewTeammateName(newTeammateInfo[1]);
  //     setSwitchMode(true);
  //   } else {
  //     setSwitchMode(false);
  //   }
  // };

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
          backgroundColor: "#c40000",
          color: "#fff",
        };
      default:
        return;
    }
  };

  const markApproved = (data) => {
    if (item.status === "DONE") {
      approveTask(data);
      item.status = "APPROVED";
      sessionStorage.setItem("selectedTask", JSON.stringify(item));
      setItem(JSON.parse(sessionStorage.getItem("selectedTask")));
    }
  };

  const handleMenuClick = (e) => {
    const newTeammateInfo = e.key.split(",");
    if (newTeammateInfo[0] !== item.teammateId) {
      setNewTeammateId(newTeammateInfo[0]);
      setNewTeammateName(newTeammateInfo[1]);
      setNewTeammateIcon(newTeammateInfo[2]);
      setNewTeammateEmail(newTeammateInfo[3]);
      setSwitchMode(true);
    } else {
      setSwitchMode(false);
    }
  };
  const items = teammates
    ?.filter((teammate) =>
      teammate.data.teammateName
        .toLowerCase()
        .includes(teammateSearch.toLowerCase())
    )
    ?.map((teammate) => {
      return {
        label: (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: ".5rem",
            }}>
            <p style={{ fontWeight: "Bold", fontSize: "1rem" }}>
              {teammate?.data?.teammateName}
            </p>
            <p style={{ color: "#BCBCBC" }}>{teammate?.data?.designation}</p>
          </div>
        ),
        key: `${teammate?.id},${teammate?.data?.teammateName},${teammate?.data?.profileImage},${teammate?.data?.teammateEmail}`,
        icon: teammate?.data?.profileImage ? (
          <Badge
            dot
            status="success">
            <Avatar
              size={40}
              src={teammate.data.profileImage}
            />
          </Badge>
        ) : (
          <Badge
            dot
            status="success">
            <ProfilePic initial={teammate?.data?.teammateName} />
          </Badge>
        ),
      };
    });

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const taskSwitch = async () => {
    try {
      setLoading(true);
      const date = new Date();
      const newData = {
        status: "ARCHIVED",
        isLive: false,
      };
      await switchTask(
        item.id,
        {
          createdAt: date,
          createdBy: id,
          createdByEmail: data.managerEmail,
          managerId: id,
          managerName: currentUser,
          teammateId: item.teammateId,
          title: item.title,
        },
        {
          createdAt: date,
          createdBy: id,
          createdByEmail: data.managerEmail,
          managerId: id,
          managerName: currentUser,
          teammateId: newTeammateId,
          title: item.title,
        },
        newData
      );
      let newTask = {
        assigned: date,
        companyName: item.companyName,
        companyId: item.companyId,
        clientId: item.clientId,
        clientName: item.clientName,
        clientEmail: item.clientEmail,
        corrections: item.corrections,
        createdAt: date,
        profileImage: item.profileImage,
        createdBy: item.createdBy,
        createdByEmail: item.createdByEmail,
        deadline: item.deadline,
        isLive: true,
        managerId: item.managerId,
        status: "ASSIGNED",
        taskId: `t-${uid()}`,
        teammateId: newTeammateId,
        teammateName: newTeammateName,
        teammateEmail: newTeammateEmail,
        type: item.type,
        estimatedTime: item.estimatedTime,
        highPriority: item.highPriority,
        title: item.title,
      };

      const task = await addNewTask(newTask, currentUser);
      item.communications.map(async (communication) => {
        let comm = {};
        switch (communication.type) {
          case "DESCRIPTION_ADDED":
            comm = {
              createdAt: date,
              createdBy: communication.createdBy,
              createdByEmail: communication.createdByEmail,
              isVisible: true,
              managerId: communication.managerId,
              teammateId: newTeammateId,
              corrections: 0,
              teammateName: newTeammateName,
              description: communication.description,
              type: "DESCRIPTION_ADDED",
            };
            break;
          case "CORRECTION_ADDED":
            comm = {
              corrections: communication.corrections,
              createdAt: date,
              createdBy: communication.createdBy,
              createdByEmail: communication.createdByEmail,
              isVisible: true,
              managerId: communication.managerId,
              teammateId: newTeammateId,
              teammateName: newTeammateName,
              description: communication.description,
              type: "CORRECTION_ADDED",
            };
            break;
          case "QUERY_ADDED":
            comm = {
              correctionNo: communication.correctionNo,
              createdAt: date,
              createdBy: communication.createdBy,
              createdByEmail: communication.createdByEmail,
              isVisible: true,
              managerId: communication.managerId,
              teammateId: newTeammateId,
              query: communication.query,
              queryId: communication.queryId,
              queryNo: communication.queryNo,
              teammateName: newTeammateName,
              type: "QUERY_ADDED",
            };
            break;
          case "QUERY_REPLIED":
            comm = {
              correctionNo: communication.correctionNo,
              createdAt: date,
              createdBy: communication.createdBy,
              createdByEmail: communication.createdByEmail,
              isVisible: true,
              managerId: communication.managerId,
              teammateId: newTeammateId,
              queryReplied: communication.queryReplied,
              queryId: communication.queryId,
              teammateName: newTeammateName,
              type: "QUERY_REPLIED",
            };
            break;

          default:
            break;
        }

        await addDescription(comm, task.id);
      });
      messageApi.success("Task Switched Successfull");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setLoading(false);
      message.error(err);
    }
  };

  function max(arr) {
    let n = -11232423;
    arr.forEach((ar) => {
      if (ar > n) n = ar;
    });
    return n;
  }
  async function sendReAssignedTaskEmail(email, taskTitle) {
    try {
      const subject = "Task Re-Assignment";
      const output = `
      <h4> ${currentUser} Reassigned the task to you :<br/>
       ${taskTitle}</h4>
      <br/>
      <a href="https://teambo.app">Go to Teambo</a>
      <br/>
      <p><br/>
        Best regards,<br/>
        Teambo team</p>`;
      const res = await sendEmail(email, subject, output);
      if (res) {
        return true;
      }
    } catch (err) {
      console.log("Email sent failed");
      return false;
    }
  }

  async function sendCorrectionAddedEmail(email, taskTitle) {
    try {
      const subject = "New correction added";
      const output = `
      <h4> ${currentUser} correction added to you :<br/>
       ${taskTitle}</h4>
      <br/>
      <a href="https://teambo.app">Go to Teambo</a>
      <br/>
      <p><br/>
        Best regards,<br/>
        Teambo team</p>`;
      const res = await sendEmail(email, subject, output);
      if (res) {
        return true;
      }
    } catch (err) {
      console.log("Email sent failed");
      return false;
    }
  }

  const handleSubmit = async () => {
    const date = new Date();
    const newCorrection =
      max(communications.map((communication) => communication.corrections)) + 1;
    try {
      const { id, data } = JSON.parse(sessionStorage.getItem("userData"));
      const correction = {
        createdAt: date,
        createdBy: id,
        createdByEmail: data.managerEmail,
        isVisible: true,
        managerId: id,
        corrections: newCorrection,
        teammateId: item.teammateId,
        managerName: data.managerName,
        description: communication,
        title: item.title,
        type: "CORRECTION_ADDED",
      };
      const updatedCorrection = await addDescription(correction, item.id);
      await updateCorrection(item.id, newCorrection);

      const comm = {
        id: updatedCorrection.id,
        corrections: newCorrection,
        description: communication,
        type: "CORRECTION_ADDED",
      };
      setCorrectionMode(false);
      setCommunication("");

      if (comm) {
        await addNotification({
          createdAt: date,
          createdBy: item.managerId,
          createdByEmail: item.createdByEmail,
          managerId: item.managerId,
          managerName: currentUser,
          teammateId: item.teammateId,
          title: item.title,
          type: Notifications.CORRECTION_ADDED,
        });
        const isSent = await sendCorrectionAddedEmail(
          item?.teammateEmail,
          item.title
        );
      }

      setCommunications([...communications, comm]);
      if (item.status === "DONE") {
        await assignTask(item.id);
        await addNotification({
          createdAt: date,
          createdBy: item.managerId,
          createdByEmail: item.createdByEmail,
          managerId: item.managerId,
          managerName: currentUser,
          teammateId: item.teammateId,
          title: item.title,
          type: Notifications.NEW_TASK_REASSIGNED,
        });
        const isSent = await sendReAssignedTaskEmail(
          item?.teammateEmail,
          item.title
        );
        setCorrectionDone(true);
      }
    } catch (error) {
      message.error(error);
    }
  };

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
  const sendQueryReply = async (queryId, query) => {
    const date = new Date();
    try {
      const { id, data } = JSON.parse(sessionStorage.getItem("userData"));
      const queryAnswer = {
        createdAt: date,
        createdBy: id,
        createdByEmail: data.managerEmail,
        isVisible: true,
        managerId: id,
        teammateId: item.teammateId,
        correctionNo: query.correctionNo,
        queryId,
        teammateName: item.teammateName,
        queryReplied: queryReply,
        type: "QUERY_REPLIED",
      };
      const updatedCorrection = await addDescription(queryAnswer, item.id);
      const qReply = {
        queryReplied: queryReply,
        id: updatedCorrection.id,
        type: "QUERY_REPLIED",
        correctionNo: query.correctionNo,
        queryId,
      };
      setCommunications([...communications, qReply]);
      setQueryReply("");
      let el = document.getElementById(query.id);
      el.style.display = "none";
    } catch (error) {
      message.error(error);
    }
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
          createdByEmail: data.managerEmail,
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
      {contextHolder}
      {
        <div className="addTaskHead task-details-header">
          <div>
            <Link to={"/"}>
              <LeftOutlined className="icon task-details-icon" />
              <span className="Tasktitle task-details-back">Back</span>
            </Link>
          </div>

          {switchMode ? (
            <div className="task-status">
              <p style={{ color: "#000" }}>Switch</p>
              <div
                className="status-icon task-details-status-icon"
                style={{ backgroundColor: "#000", color: "#fff" }}
                onClick={taskSwitch}>
                <SwapOutlined style={{ color: "#fff", fontSize: "1.2rem" }} />
              </div>
            </div>
          ) : (
            <div className="task-status">
              <p style={textColor(item?.status)}>
                {correctionDone ? "ASSIGNED" : item.status}
              </p>
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
                    style={{ color: "#fff" }}
                  />
                ) : (
                  <RightOutlined />
                )}
              </div>
            </div>
          )}
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
            <div className="task-detail-point">
              <p>Assigned</p>
              <p>{timeStampFormatChange(item.assigned)}</p>
            </div>
            <div className="task-detail-point">
              <p>Due</p>
              <label
                className="link-detail"
                style={{ cursor: "pointer" }}
                htmlFor={`dateid`}>
                {timeStampFormatChange(item.deadline)}
              </label>
              <DatePicker
                style={{ visibility: "hidden", width: "0" }}
                placement="bottomLeft"
                id="dateid"
                showTime
                onOk={(value) => {
                  changeDeadline(value, item.id, {
                    title: item.title,
                    teammateId: item.teammateId,
                    managerId: item.managerId,
                    teammateEmail: item.teammateEmail,
                  });
                }}
              />
            </div>
          </div>
        </div>
        <div className="task-details-row2">
          <Dropdown
            menu={menuProps}
            trigger={["click"]}
            dropdownRender={(menu) => (
              <>
                <div className="search-input">
                  <SearchOutlined />
                  <Input
                    placeholder="Search"
                    bordered={false}
                    onChange={(e) => setTeammateSearch(e.target.value)}
                  />
                </div>
                {React.cloneElement(menu, {
                  style: menuStyle,
                })}
              </>
            )}>
            <Button className="teammate-dropdown">
              <Space>
                <Badge
                  dot
                  status="success">
                  {item?.profileImage ? (
                    <Avatar
                      size={40}
                      src={switchMode ? newTeammateIcon : item?.profileImage}
                    />
                  ) : (
                    <ProfilePic
                      initial={
                        switchMode ? newTeammateName : item?.teammateName
                      }
                    />
                  )}
                </Badge>
                <p style={{ fontWeight: "Bold", fontSize: "1rem" }}>
                  {switchMode ? newTeammateName : item?.teammateName}
                </p>
              </Space>
              <SwapOutlined style={{ color: "#01875A", fontSize: "1.2rem" }} />
            </Button>
          </Dropdown>
          <div className="approve-button">
            <p>
              <span>{time || "0 Hrs"}</span>
            </p>

            {item?.status === "APPROVED" ? (
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
              <>
                <Button
                  onClick={() => {
                    markApproved(item.id);
                  }}
                  type="primary"
                  shape="round"
                  icon={
                    <img
                      src={doubleTick}
                      alt="double tick"
                    />
                  }>
                  Mark Approved
                </Button>

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
                  style={{
                    marginLeft: 1 + "rem",
                    background: "rgb(1, 135, 90)",
                  }}
                  icon={
                    <img
                      src={doubleTick}
                      alt="double tick"
                    />
                  }>
                  Mark Complete
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="task-details-row3">
          <VerticalTimeline layout="1-column-left">
            <VerticalTimelineElement
              icon={
                  <PlusOutlined />
              }>
              <p
                className="correction-button"
                onClick={() => setCorrectionMode(!correctionMode)}>
                Add Correction
              </p>
              {correctionMode && (
                <div className="correction-textarea">
                  <TextArea
                    rows={6}
                    placeholder="Add Correction"
                    bordered={false}
                    value={communication}
                    onChange={(e) => setCommunication(e.target.value)}
                  />
                  <Button
                    className="textarea-button"
                    style={{ background: "#C40000" }}
                    onClick={handleSubmit}>
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

            {communications

              .filter((item1) => {
                return (
                  item1.type === "DESCRIPTION_ADDED" ||
                  item1.type === "CORRECTION_ADDED"
                );
              })
              .sort((a, b) => {
                return b.corrections - a.corrections;
              })
              ?.map((item1) => (
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

                    {communications
                      .filter((q) => {
                        return (
                          q.type === "QUERY_ADDED" &&
                          q.correctionNo === item1.corrections
                        );
                      })
                      .sort((a, b) => {
                        return b.queryNo - a.queryNo;
                      })
                      .map((q) => {
                        return (
                          <>
                            <div
                              className="query"
                              key={q.id}>
                              <Avatar
                                size={20}
                                icon={<UserOutlined />}
                              />
                              <p>{q.query}</p>
                            </div>
                            {communications
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
                            <button
                              className="reply-button"
                              onClick={() => {
                                let el = document.getElementById(q.id);
                                if (el.style.display === "none") {
                                  el.style.display = "block";
                                } else {
                                  el.style.display = "none";
                                }
                              }}>
                              reply
                            </button>
                            <div
                              id={q.id}
                              style={{ display: "none" }}
                              className="reply-input">
                              <TextArea
                                id={q.queryId}
                                rows={2}
                                placeholder="reply..."
                                bordered={true}
                                onChange={(e) => setQueryReply(e.target.value)}
                              />
                              <button
                                onClick={() => {
                                  sendQueryReply(q.queryId, q);
                                }}>
                                <SendOutlined />
                              </button>
                            </div>
                          </>
                        );
                      })}
                  </div>
                </VerticalTimelineElement>
              ))}
          </VerticalTimeline>
        </div>
      </div>
      <Loader
        loading={loading}
        text="Switching ....."
      />
    </div>
  );
};

export default Index;
