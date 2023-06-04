import React, { useState, useEffect } from "react";
import { TeamOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { Button, Tabs, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "../People/main.css";
import {
  readTasksByManager,
  readTeammatesByMangerId,
} from "../../../DataBase/Manager/manager";
import Loader from "../../LoadingModal";
import ClientPage from "../Clients/ClientPage";
import People from "./People";
export default function PeoplePage() {
  const [teammates, setTeammates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // fetch data api
  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = sessionStorage.getItem("userId");
      const teamMateData = await readTeammatesByMangerId(userId);
      const taskData = await readTasksByManager(userId);
      setTeammates(teamMateData);
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

  // const setTask = useCallback(
  //   (task) => {
  //     sessionStorage.setItem("selectedTask", JSON.stringify(task));
  //     navigate("/task");
  //   },
  //   [navigate]
  // );

  const onChange = () => {};

  const tabItems = [
    {
      key: "0",
      label: <div className="tab-heading">Teammates</div>,
      children: <People />,
    },
    {
      key: "1",
      label: <div className="tab-item">Clients</div>,
      children: <ClientPage tasks={tasks} />,
    },
  ];

  return (
    <div className="people">
      <div className="addPeople">
        <div>
          <Link to={"/"}>
            <TeamOutlined className="icon" />
          </Link>
          <span className="Tasktitle">People</span>
        </div>

        <div>
          <Button
            className="newBtn"
            onClick={() => navigate("/addmember")}>
            <PlusSquareOutlined /> <p>New</p>
          </Button>
        </div>
      </div>
      <Tabs
        defaultActiveKey="0"
        onChange={onChange}
        className="analytics-tab"
        type="editable"
        items={tabItems}
      />
      <Loader
        loading={loading}
        text="Getting peoples ..."
      />
    </div>
  );
}
