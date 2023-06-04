import React, { useState, useEffect } from "react";
import {
  Button,
  Dropdown,
  Space,
  message,
  Avatar,
  Badge,
  Input,
  Card,
} from "antd";
import "./main.css";
import {
  CarryOutFilled,
  ClockCircleOutlined,
  SwitcherFilled,
  HourglassOutlined,
  PartitionOutlined,
  DownOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Doughnut, Line } from "react-chartjs-2";
import { readClientsByMangerId } from "../../../../../DataBase/Manager/manager";
import ProfilePic from "../../../../Common/ProfilePic/ProfilePic";
import Loader from "../../../../LoadingModal";

const menuStyle = {
  boxShadow: "none",
};
const Index = ({ tasks2 }) => {
  const [tasks, setTasks] = useState([]);
  const [lastDays, setLastDays] = useState([]);
  const [clients, setClients] = useState([]);
  const [teammateSearch, setTeammateSearch] = useState("");
  const [newClientId, setNewClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = sessionStorage.getItem("userId");
        const clientsData = await readClientsByMangerId(userId);

        setClients(clientsData);
        setTasks(tasks2.filter((task) => task.clientId === clientsData[0].id));
        setNewClientId(clientsData[0].id);
        setNewClientName(clientsData[0].data.clientName);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        message.error(error);
      }
    };
    fetchData();
  }, []);

  const handleMenuClick = (e) => {
    const newClientInfo = e.key.split(",");
    setTasks(tasks2.filter((task) => task.clientId === newClientInfo[0]));
    setNewClientId(newClientInfo[0]);
    setNewClientName(newClientInfo[1]);
  };
  console.log("Clients", clients);
  const items = clients
    ?.filter((client) => client.data.clientName)
    ?.filter((client) =>
      client?.data?.clientName
        ?.toLowerCase()
        .includes(teammateSearch?.toLowerCase())
    )
    ?.map((client) => {
      return {
        label: (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: ".5rem",
            }}
          >
            <p style={{ fontWeight: "Bold", fontSize: "1rem" }}>
              {client?.data?.clientName}
            </p>
          </div>
        ),
        key: `${client?.id},${client?.data?.clientName}`,
        icon: (
          <Badge dot status="success">
            <ProfilePic initial={client?.data?.clientName} />
          </Badge>
        ),
      };
    });

  const menuProps = {
    items,
    onClick: handleMenuClick,
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
    return dateOnly;
  };

  function getLast5Days() {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const today = new Date();
    const last5Days = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const monthName = months[date.getMonth()];
      const dateNum = date.getDate();

      const formattedDate = `${dateNum} ${monthName}`;
      last5Days.push(formattedDate);
    }
    return last5Days;
  }

  function getTotalWorks() {
    const totalWorks = [];
    for (let i = 0; i < 6; i++) {
      let count = 0;
      let day = lastDays[i];
      for (let j = 0; j < tasks.length; j++) {
        let task = tasks[j];
        let taskDate = timeStampFormatChange(task.assigned);
        if (taskDate === day) {
          count++;
        }
      }
      totalWorks.push(count);
    }
    return totalWorks;
  }

  function getCompletedWorks() {
    const completeWorks = [];
    for (let i = 0; i < 6; i++) {
      let count = 0;
      let day = lastDays[i];
      let tasks2 = tasks.filter(
        (task) => task.status === "DONE" || task.status === "APPROVED"
      );
      for (let j = 0; j < tasks2.length; j++) {
        let task = tasks2[j];
        let taskDate = timeStampFormatChange(task.assigned);
        if (taskDate === day) {
          count++;
        }
      }
      completeWorks.push(count);
    }
    return completeWorks;
  }

  useEffect(() => {
    const data = getLast5Days();
    setLastDays(data);
  }, []);

  useEffect(() => {
    getTotalWorks();
    getCompletedWorks();
  }, [lastDays, tasks]);

  function getTimestampDifference(timestamp1) {
    if (!timestamp1) return 0;
    const date2 = new Date();
    const differenceInSeconds =
      Math.abs(timestamp1.toDate().getTime() - date2.getTime()) / 1000;
    return differenceInSeconds;
  }
  function timeElapsed(timestamp1) {
    if (!timestamp1) return "-";
    const date2 = new Date();
    const seconds =
      Math.abs(timestamp1.toDate().getTime() - date2.getTime()) / 1000;
    if (seconds < 60) {
      return Math.floor(seconds) + "S";
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return Math.floor(minutes) + "M";
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return Math.floor(hours) + "H";
    }

    const days = Math.floor(hours / 24);
    return Math.floor(days) + "D";
  }

  function getMostTimeConsumingTasks() {
    const data = tasks
      .sort((a, b) => b.totalHours - a.totalHours)
      .filter((task, i) => i < 5)
      .map((task) => {
        return {
          time: parseFloat(task.totalHours.toFixed(2)),
          title: task.title,
        };
      });
    const total = data.reduce((ac, curr) => ac + curr.time, 0);
    const data2 = data.map((dat) => {
      return {
        percentage: ((dat.time / total) * 100).toFixed(2),
        title: dat.title,
      };
    });
    return data2;
  }

  let backgroundColor = ["#3C99EF", "#EB4772", "#79C866", "#5575E8"];

  return (
    <div>
      <div className="overall-row0">
        <Dropdown
          menu={menuProps}
          trigger={["click"]}
          dropdownRender={(menu) => (
            <div className="dropdown analytics">
              <div className="search-input">
                <SearchOutlined />
                <Input
                  placeholder="Search"
                  onChange={(e) => setTeammateSearch(e.target.value)}
                  bordered={false}
                />
              </div>
              {React.cloneElement(menu, {
                style: menuStyle,
              })}
            </div>
          )}
        >
          <Button className="teammate-dropdown">
            <Space>
              <Badge dot status="success">
                {<ProfilePic initial={newClientName} />}
              </Badge>
              <p style={{ fontWeight: "Bold", fontSize: "1rem" }}>
                {newClientName}
              </p>
            </Space>
            <DownOutlined style={{ color: "#01875A", fontSize: "1.2rem" }} />
          </Button>
        </Dropdown>
      </div>
      <div className="overall-row1">
        <Card
          className="overall-row1-card"
          bordered={false}
          style={{ width: 280 }}
        >
          <div className="card-row1">
            <div className="card-icon">
              <CarryOutFilled />
            </div>
          </div>
          <div className="card-row2">Complete Works</div>
          <div className="card-row3">
            {tasks.filter((task) => task.status === "DONE").length}
          </div>
          <hr />
          <div className="card-row4">From last month (January 1, 2022)</div>
        </Card>
        <Card
          className="overall-row1-card"
          bordered={false}
          style={{ width: 280 }}
        >
          <div className="card-row1">
            <div
              className="card-icon"
              style={{ backgroundColor: "#5575E84D", color: "#5575E8" }}
            >
              <ClockCircleOutlined />
            </div>
          </div>
          <div className="card-row2">Total Work Hours</div>
          <div className="card-row3">
            {tasks
              ?.reduce((acc, curr) => acc + curr?.totalHours, 0)
              ?.toFixed(2)}
          </div>
          <hr />
          <div className="card-row4">From last month (January 1, 2022)</div>
        </Card>
        <Card
          className="overall-row1-card"
          bordered={false}
          style={{ width: 280 }}
        >
          <div className="card-row1">
            <div
              className="card-icon"
              style={{ backgroundColor: "#76C6644D", color: "#79C866" }}
            >
              <SwitcherFilled />
            </div>
          </div>
          <div className="card-row2">Total Works Assigned</div>
          <div className="card-row3">
            {tasks.filter((task) => task.status === "ASSIGNED").length}
          </div>
          <hr />
          <div className="card-row4">From last month (January 1, 2022)</div>
        </Card>
        <Card
          className="overall-row1-card"
          bordered={false}
          style={{ width: 280 }}
        >
          <div className="card-row1">
            <div
              className="card-icon"
              style={{ backgroundColor: "#EB47724D", color: "#F22F2F" }}
            >
              <HourglassOutlined />
            </div>
          </div>
          <div className="card-row2">Pending Works</div>
          <div className="card-row3">
            {tasks.filter((task) => task.status === "PAUSED").length}
          </div>
          <hr />
          <div className="card-row4">From last month (January 1, 2022)</div>
        </Card>
      </div>
      <div className="overall-row2">
        <p>Works timeline</p>
        <Line
          data={{
            labels: lastDays,
            datasets: [
              {
                label: "Completed Work",
                data: getCompletedWorks(),
                backgroundColor: "#3C99EF",
                fill: true,
              },
              {
                label: "Total Work",
                data: getTotalWorks(),
                backgroundColor: "#6BE1E9",
                fill: true,
              },
            ],
          }}
        />
      </div>
      <div className="overall-row3">
        <div className="box1">
          <div className="box-heading">
            <p>Tasks Paused for long time</p>
            <div>{tasks.filter((task) => task.status === "PAUSED").length}</div>
          </div>
          <ul>
            {tasks
              ?.filter((task, i) => task.status === "PAUSED" && i < 10)
              ?.sort((a, b) => {
                return (
                  getTimestampDifference(b.pauseTimeStamp) -
                  getTimestampDifference(a.pauseTimeStamp)
                );
              })
              ?.map((task) => {
                return (
                  <li style={{ background: "#FCAD00" }} key={task.id}>
                    <div className="task-info">
                      <p>{task.title}</p>
                      <p>
                        <PartitionOutlined /> {task.clientName}
                      </p>
                    </div>
                    <div>{timeElapsed(task.pauseTimeStamp)}</div>
                  </li>
                );
              })}
          </ul>
        </div>
        <div className="box1">
          <div className="box-heading">
            <p>Tasks Completed for long time</p>
            <div>{tasks.filter((task) => task.status === "DONE").length}</div>
          </div>
          <ul>
            {tasks
              ?.filter((task, i) => task.status === "DONE" && i < 10)
              ?.sort((a, b) => {
                return (
                  getTimestampDifference(b.completedOn) -
                  getTimestampDifference(a.completedOn)
                );
              })
              ?.map((task) => {
                return (
                  <li style={{ background: "#2785FF" }} key={task.id}>
                    <div className="task-info">
                      <p>{task.title}</p>
                      <p>
                        <PartitionOutlined /> {task.clientName}
                      </p>
                    </div>
                    <div>{timeElapsed(task.completedOn)}</div>
                  </li>
                );
              })}
          </ul>
        </div>
        <div className="box1">
          <div className="box-heading">
            <p>Tasks On Going for long time</p>
            <div>
              {tasks.filter((task) => task.status === "ON_GOING").length}
            </div>
          </div>
          <ul>
            {tasks
              ?.filter((task, i) => task.status === "ON_GOING" && i < 10)
              ?.sort((a, b) => {
                return (
                  getTimestampDifference(b.startTimeStamp) -
                  getTimestampDifference(a.startTimeStamp)
                );
              })
              ?.map((task) => {
                return (
                  <li style={{ background: "#01875A" }} key={task.id}>
                    <div className="task-info">
                      <p>{task.title}</p>
                      <p>
                        <PartitionOutlined /> {task.clientName}
                      </p>
                    </div>
                    <div>{timeElapsed(task.startTimeStamp)}</div>
                  </li>
                );
              })}
          </ul>
        </div>
        <div className="box1">
          <div className="box-heading">
            <p>Tasks Assigned for long time</p>
            <div>
              {tasks.filter((task) => task.status === "ASSIGNED").length}
            </div>
          </div>
          <ul>
            {tasks
              ?.filter((task, i) => task.status === "ASSIGNED" && i < 10)
              ?.sort((a, b) => {
                return (
                  getTimestampDifference(b.assigned) -
                  getTimestampDifference(a.assigned)
                );
              })
              ?.map((task) => {
                return (
                  <li style={{ background: "#000000" }} key={task.id}>
                    <div className="task-info">
                      <p>{task.title}</p>
                      <p>
                        <PartitionOutlined /> {task.clientName}
                      </p>
                    </div>
                    <div>{timeElapsed(task.assigned)}</div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
      <div className="overall-row4">
        <div className="row4-box">
          <p>Most Time Consuming Projects</p>
          <div className="row4-box-data">
            <div className="box-graph">
              <Doughnut
                data={{
                  datasets: [
                    {
                      label: "Most Time(%)",
                      data: getMostTimeConsumingTasks().map(
                        (dat) => dat.percentage
                      ),
                      backgroundColor: getMostTimeConsumingTasks().map(
                        (dat, i) => backgroundColor[i]
                      ),
                      fill: true,
                    },
                  ],
                }}
              />
            </div>
            <div className="box-graph-info">
              <ul>
                {getMostTimeConsumingTasks().map((dat, i) => {
                  return (
                    <li>
                      {dat.percentage !== "NaN" && (
                        <>
                          <p style={{ background: backgroundColor[i] }}></p>
                          <p>
                            {dat.percentage == "NaN"
                              ? "-"
                              : dat.percentage + "%"}
                          </p>
                          <p>{dat.percentage != "NaN" && dat.client}</p>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Loader loading={loading} text="Getting client analytics ..." />
    </div>
  );
};

export default Index;
