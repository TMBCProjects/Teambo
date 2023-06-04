import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PartitionOutlined } from "@ant-design/icons";
import {
  readTasksByManager,
  readTeammatesByMangerId,
} from "../../../DataBase/Manager/manager";
import { Avatar, message } from "antd";
import ProfilePic from "../../Common/ProfilePic/ProfilePic";

const People = () => {
  const [tasks, setTasks] = useState([]);
  const [teammates, setTeammates] = useState([]);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const teamMateData = await readTeammatesByMangerId(userId);
      const taskData = await readTasksByManager(userId);
      setTeammates(teamMateData);
      setTasks(taskData);
    } catch (error) {
      message.error("Error while fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const setTask = useCallback(
    (task) => {
      sessionStorage.setItem("selectedTask", JSON.stringify(task));
      navigate("/task");
    },
    [navigate]
  );

  const bgColor = (status) => {
    switch (status) {
      case "ON_GOING":
        return {
          backgroundColor: "#d9fff2",
          color: "#000",
        };
      case "PAUSED":
        return {
          backgroundColor: "#fff7e8",
          color: "#000",
        };
      case "ASSIGNED":
        return {
          backgroundColor: "#f5f5f5",
          color: "#000",
        };
      case "DONE":
        return {
          backgroundColor: "#e2f2ff",
          color: "#000",
        };
      default:
        return;
    }
  };
  const visitProfile = (id, data) => {
    const newTasks = tasks.filter((task) => task.teammateId === id);
    navigate("/profiletask", {
      state: {
        tasks: newTasks,
        data: data,
      },
    });
  };
  return (
    <div className="masonry">
      {teammates.map((teammate) => (
        <div className="item">
          <div className="peoplecard">
           <div onClick={()=>{visitProfile(teammate.id,teammate.data)}} className="peoplehead">
              {teammate?.data?.profileImage ? (
                <Avatar size={40} src={teammate?.data?.profileImage} />
              ) : (
                <ProfilePic initial={teammate?.data?.teammateName} />
              )}

              <span className="teammateNameSpan">
                <b className="teammate-name">{teammate?.data?.teammateName} </b>
                <br />
                {teammate?.data?.designation}
              </span>

              <span style={{ color: "#26809B" }} className="teammateNameSpan">
                <h2>
                  {
                    tasks
                      .filter((task) => task.teammateId === teammate.id)
                      .filter((task) => task.status !== "DONE").length
                  }
                </h2>{" "}
              </span>

              <span style={{ color: "#A2A2A2" }} className="teammateNameSpan">
                <h5>
                  {
                    tasks
                      .filter((task) => task.teammateId === teammate.id)
                      .filter((task) => task.status === "DONE").length
                  }
                </h5>
              </span>
            </div>
            <div className="peoplebody">
              {tasks
                .filter((task) => task.teammateId === teammate.id)
                .map((task) => (
                  <div
                    className="cardcontent"
                    onClick={() => {
                      setTask(task);
                    }}
                    style={bgColor(task.status)}
                  >
                    <span style={{ fontSize: "16px" }}>{task.clientName}</span>
                    <br />
                    <span style={{ fontSize: "14px" }}>
                      <PartitionOutlined /> {task?.type || ""}
                    </span>
                    <br />
                    <span style={{ fontSize: "18px" }}>{task.title}</span>
                    <br />
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default People;
