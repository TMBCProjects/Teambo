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
  SearchOutlined,
} from "@ant-design/icons";
import { Doughnut, Line } from "react-chartjs-2";
import { readTeammatesByMangerId } from "../../../../../DataBase/Manager/manager";
import ProfilePic from "../../../../Common/ProfilePic/ProfilePic";
import Loader from "../../../../LoadingModal";

const menuStyle = {
  boxShadow: "none",
};
const Index = ({ tasks2 }) => {
  const [tasks, setTasks] = useState([]);
  const [lastDays, setLastDays] = useState([]);
  const [teammates, setTeammates] = useState([]);
  const [teammateSearch, setTeammateSearch] = useState("");
  // const [newTeammateId, setNewTeammateId] = useState("");
  const [newTeammateName, setNewTeammateName] = useState("");
  const [newTeammateIcon, setNewTeammateIcon] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = sessionStorage.getItem("userId");
        const teamMateData = await readTeammatesByMangerId(userId);
        setTeammates(teamMateData);
        setTasks(
          tasks2.filter((task) => task.teammateId === teamMateData[0].id)
        );
        // setNewTeammateId(teamMateData[0].id);
        setNewTeammateName(teamMateData[0].data.teammateName);
        setNewTeammateIcon(teamMateData[0].data.profileImage);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        message.error(error);
      }
    };
    fetchData();
  }, [tasks2]);

  const handleMenuClick = (e) => {
    const newTeammateInfo = e.key.split(",");
    setTasks(tasks2.filter((task) => task.teammateId === newTeammateInfo[0]));
    // setNewTeammateId(newTeammateInfo[0]);
    setNewTeammateName(newTeammateInfo[1]);
    setNewTeammateIcon(newTeammateInfo[2]);
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
        key: `${teammate?.id},${teammate?.data?.teammateName},${teammate?.data?.profileImage}`,
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
    const data = getLast5Days();
    setLastDays(data);
  }, [lastDays]);

  useEffect(() => {
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
  function getMostTimeConsumingClients() {
    const data = tasks
      .sort((a, b) => b.totalHours - a.totalHours)
      .filter((task, i) => i < 5)
      .map((task) => {
        return {
          time: parseFloat(task.totalHours.toFixed(2)),
          client: task.clientName,
        };
      });
    const total = data.reduce((ac, curr) => ac + curr.time, 0);
    const data2 = data.map((dat) => {
      return {
        percentage: ((dat.time / total) * 100).toFixed(2),
        client: dat.client,
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
          )}>
          <Button className="teammate-dropdown">
            <Space>
              <Badge
                dot
                status="success">
                {newTeammateIcon ? (
                  <Avatar
                    size={40}
                    src={newTeammateIcon}
                  />
                ) : (
                  <ProfilePic initial={newTeammateName} />
                )}
              </Badge>
              <p style={{ fontWeight: "Bold", fontSize: "1rem" }}>
                {newTeammateName}
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
          style={{ width: 280 }}>
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
          style={{ width: 280 }}>
          <div className="card-row1">
            <div
              className="card-icon"
              style={{ backgroundColor: "#5575E84D", color: "#5575E8" }}>
              <ClockCircleOutlined />
            </div>
          </div>
          <div className="card-row2">Total Work Hours</div>
          <div className="card-row3">
            {tasks
              ?.reduce((acc, curr) => acc + curr?.totalHours, 0)
              .toFixed(2) || 0}
          </div>
          <hr />
          <div className="card-row4">From last month (January 1, 2022)</div>
        </Card>
        <Card
          className="overall-row1-card"
          bordered={false}
          style={{ width: 280 }}>
          <div className="card-row1">
            <div
              className="card-icon"
              style={{ backgroundColor: "#76C6644D", color: "#79C866" }}>
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
          style={{ width: 280 }}>
          <div className="card-row1">
            <div
              className="card-icon"
              style={{ backgroundColor: "#EB47724D", color: "#F22F2F" }}>
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
                  <li
                    style={{ background: "#FCAD00" }}
                    key={task.id}>
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
                  <li
                    style={{ background: "#2785FF" }}
                    key={task.id}>
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
                  <li
                    style={{ background: "#01875A" }}
                    key={task.id}>
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
                  <li
                    style={{ background: "#000000" }}
                    key={task.id}>
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
                            {dat.percentage === "NaN"
                              ? "-"
                              : dat.percentage + "%"}
                          </p>
                          <p>{dat.percentage !== "NaN" && dat.title}</p>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <div className="row4-box">
          <p>Most Time Consuming Clients</p>
          <div className="row4-box-data">
            <div className="box-graph">
              <Doughnut
                data={{
                  datasets: [
                    {
                      label: "Most Time(%)",
                      data: getMostTimeConsumingClients().map(
                        (dat) => dat.percentage
                      ),
                      backgroundColor: getMostTimeConsumingClients().map(
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
                {getMostTimeConsumingClients().map((dat, i) => {
                  return (
                    <li>
                      {dat.percentage !== "NaN" && (
                        <>
                          <p style={{ background: backgroundColor[i] }}></p>
                          <p>
                            {dat.percentage === "NaN"
                              ? "-"
                              : dat.percentage + "%"}
                          </p>
                          <p>{dat.percentage !== "NaN" && dat.client}</p>
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
      <Loader
        loading={loading}
        text="Getting individual ..."
      />
    </div>
  );
};

export default Index;
