import React, { useState, useEffect } from "react";
import "./main.css";
import { Tabs, message } from "antd";
import Overall from "./Tabs/Overall";
import Individual from "./Tabs/Individual";
import Attendence from "./Tabs/Attendence";
import Client from "./Tabs/Client";
import Loader from "../../LoadingModal";
import { readTasksByManager } from "../../../DataBase/Manager/manager";

const Index = () => {
  const [taskData, setTaskData] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch data api
  async function fetchData() {
    try {
      setLoading(true);
      const userId = sessionStorage.getItem("userId");
      const data = await readTasksByManager(userId);
      setTaskData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      message.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);
  const onChange = () => {};

  const tabItems = [
    {
      key: "0",
      label: <div className="tab-heading">Overview</div>,
      children: <></>,
      disabled: true,
    },
    {
      key: "1",
      label: <div className="tab-item">Overall</div>,
      children: <Overall tasks={taskData} />,
    },
    {
      key: "2",
      label: <div className="tab-item">Individual</div>,
      children: <Individual tasks2={taskData} />,
    },
    {
      key: "3",
      label: <div className="tab-item">Attendence</div>,
      children: <Attendence tasks={taskData} />,
    },
    {
      key: "4",
      label: <div className="tab-item">Clients</div>,
      children: <Client tasks2={taskData} />,
    },
  ];

  return (
    <div className="addtask analytics">
      <div className="analytics-container">
        <Tabs
          defaultActiveKey="1"
          onChange={onChange}
          className="analytics-tab"
          type="editable"
          items={tabItems}
        />
      </div>
      <Loader loading={loading} text="Getting analytics ..." />
    </div>
  );
};

export default Index;
