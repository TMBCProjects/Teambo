import React, { useState, useEffect, useCallback } from "react";
import { PartitionOutlined } from "@ant-design/icons";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import "../People/main.css";
import {
  readTasksByManager,
  readClientsByMangerId,
} from "../../../DataBase/Manager/manager";
import Loader from "../../LoadingModal";
import ProfilePic from "../../Common/ProfilePic/ProfilePic";

export default function ClientPage() {
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = sessionStorage.getItem("userId");
      const clientsData = await readClientsByMangerId(userId);
      const taskData = await readTasksByManager(userId);
      setClients(clientsData);
      setTasks(taskData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error("Error while fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const setTask = useCallback(
    (task) => {
      sessionStorage.setItem("selectedTask", JSON.stringify(task));
      navigate("/task");
    },
    [navigate]
  );
  return (
    <div className="people">
      <div className="addPeople">
        {/* <div>
          <Link to={"/"}>
            <TeamOutlined className="icon" />
          </Link>
          <span className="Tasktitle">Clients</span>
        </div> */}

        {/* <div>
          <Button className="newBtn" onClick={() => navigate("/addmember")}>
            <PlusSquareOutlined /> <p>New</p>
          </Button>
        </div> */}
      </div>
      <div className="masonry">
        {clients.map((client) => (
          <div className="item">
            <div className="peoplecard">
              <div className="peoplehead">
                <ProfilePic initial={client?.data?.clientName} />
                <span>
                  <b className="teammate-name">{client?.data?.clientName} </b>
                  <br />
                  {client?.data?.companyName}
                </span>

                <span style={{ color: "#26809B" }}>
                  <h2>
                    {
                      tasks
                        .filter((task) => task.clientId === client.id)
                        .filter((task) => task.status !== "DONE").length
                    }
                  </h2>{" "}
                </span>

                <span style={{ color: "#A2A2A2" }}>
                  <h5>
                    {
                      tasks
                        .filter((task) => task.clientId === client.id)
                        .filter((task) => task.status === "DONE").length
                    }
                  </h5>
                </span>
              </div>
              <div className="peoplebody">
                {tasks
                  .filter((task) => task.clientId === client.id)
                  .map((task) => (
                    <div
                      className="cardcontent"
                      onClick={() => {
                        setTask(task);
                      }}
                      style={bgColor(task.status)}>
                      <span style={{ fontSize: "16px" }}>
                        {task.clientName}
                      </span>
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
      <Loader
        loading={loading}
        text="Getting peoples ..."
      />
    </div>
  );
}
