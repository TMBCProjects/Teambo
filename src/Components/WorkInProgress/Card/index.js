import React, { useEffect, useState } from "react";
import "./main.css";
import {
  PauseOutlined,
  PartitionOutlined,
  CheckOutlined,
  RightOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { DatePicker } from "antd";
import { Carousel, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import { updateDue } from "../../../DataBase/Manager/manager";
import ProfilePic from "../../Common/ProfilePic/ProfilePic";
import { MdArchive } from "react-icons/md";
const contentStyle = {
  height: "auto",
  color: "#707070",
  lineHeight: "20px",
  textAlign: "left",
  background: "#fff",
  marginLeft: "1.5vh",
  paddingInline: "2vh",
};
const Index = ({ index, task }) => {
  const [time, setTime] = useState(0);
  useEffect(() => {
    const updateTime = () => {
      setTime(
        hoursInFullFormat(task?.totalHours, task?.startTimeStamp) || "0 Hrs"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => {
      clearInterval(interval);
    };
  }, [task?.totalHours, task?.startTimeStamp]);

  const navigate = useNavigate();
  const item = task;
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

    var hours = Math.floor(decimalTime / (60 * 60)) || 0;
    decimalTime = decimalTime - hours * 60 * 60;
    var minutes = Math.floor(decimalTime / 60) || 0;

    return "" + hours + " Hrs " + minutes + " Mins";
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
  return (
    <div
      className="card"
      onClick={() => {
        sessionStorage.setItem("selectedTask", JSON.stringify(task));
        navigate("/task");
      }}
      style={{ cursor: "pointer" }}>
      <div
        className="card-header"
        style={bgColor(task.status)}>
        <div
          className="status-icon"
          style={
            (task.status === "ON_GOING" && {
              backgroundColor: "#fff",
              color: "#01875A",
            }) ||
            (task.status === "PAUSED" && {
              backgroundColor: "#fff",
              color: "#fcad00",
            }) ||
            (task.status === "ASSIGNED" && {
              backgroundColor: "#fff",
              color: "#000000",
            }) ||
            (task.status === "DONE" && {
              backgroundColor: "#fff",
              color: "#2785ff",
            }) ||
            (task.status === "APPROVED" && {
              backgroundColor: "#fff",
              color: "#9F2B68",
            }) ||
            (task.status === "ARCHIVED" && {
              backgroundColor: "#fff",
              color: "#c40000",
            })
          }>
          {task.status === "ON_GOING" ? (
            <PauseOutlined />
          ) : task.status === "DONE" ? (
            <CheckOutlined />
          ) : task.status === "APPROVED" ? (
            <CheckCircleOutlined style={{ color: "#802392" }} />
          ) : task.status === "ARCHIVED" ? (
            <MdArchive
              size={30}
              style={{ color: "#c40000" }}
            />
          ) : (
            <RightOutlined />
          )}
        </div>
        <div className="task-info">
          <p className="clientName">{task?.clientName || ""}</p>
          <p className="clientName">
            <PartitionOutlined /> {task?.type || ""}
          </p>
          <p className="clientName">{task?.title || ""}</p>
        </div>
      </div>
      <div className="card-body">
        <div className="teammate-info">
          <div className="data">
            {task?.profileImage ? (
              <Avatar
                size={40}
                src={task?.profileImage}
              />
            ) : (
              <ProfilePic initial={task?.teammateName} />
            )}
            <p>{task?.teammateName || ""}</p>
          </div>
          <Carousel
            autoplay
            dots={false}>
            {item?.communications
              .filter((item1) => {
                return (
                  item1.type === "DESCRIPTION_ADDED" ||
                  item1.type === "CORRECTION_ADDED"
                );
              })
              .map((item1) => (
                <div key={item1.id}>
                  <p style={contentStyle}>{item1.description}</p>
                </div>
              ))}
          </Carousel>
        </div>
        <div className="card-footer">
          <div className="task-info">
            <p>Start</p>
            <p>{timeStampFormatChange(task?.assigned || "--")}</p>
          </div>
          <div className="task-info">
            <p>Time</p>
            <p>{time || "0 Hrs"}</p>
          </div>
          <div className="task-info">
            <p>Due</p>
            <label
              style={{ cursor: "pointer", color: "#01875A" }}
              htmlFor={`dateid ${index}`}>
              {timeStampFormatChange(task?.deadline || "--")}
            </label>
            <DatePicker
              style={{ visibility: "hidden", width: "0" }}
              placement="bottomLeft"
              id={`dateid ${index}`}
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
    </div>
  );
};

export default Index;
