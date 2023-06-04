import React, { useEffect, useState } from "react";
import {
  HistoryOutlined,
  PlusSquareOutlined,
  UnorderedListOutlined,
  BorderlessTableOutlined,
  ClearOutlined,
  FolderViewOutlined,
  FilterOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Button, Select, Empty, Drawer, Space, Tabs, Radio } from "antd";
import Loader from "../LoadingModal";
import "../WorkInProgress/main.css";
import { useNavigate } from "react-router-dom";
import ListView from "./ListView";
import GridView from "./GridView";
import {
  readTasksByTeammate,
  readArchivedTasksByTeammate,
  readApprovedTasksByTeammate,
} from "../../DataBase/Teammate/teammate";
import {
  readClientsByCompanyId,
  readTasksByManager,
  readTeammatesByMangerId,
  readTypesByCompanyId,
  readArchivedTasksByManager,
  readApprovedTasksByManager,
} from "../../DataBase/Manager/manager";
import { logOut, setCollection } from "../../utils/FirebaseUtils";
import { onSnapshot, query, where } from "firebase/firestore";
import { Collections } from "../../utils/Collections";
import { Fields } from "../../utils/Fields";
import { MdArchive } from "react-icons/md";
import { markTeammateAttendance } from "../../DataBase/Teammate/teammate";
import { Avatar, Switch } from "antd";
import ProfilePic from "../Common/ProfilePic/ProfilePic";

export default function WorkInProgress() {
  const navigate = useNavigate();
  const [listView, setListView] = useState(false);
  const [gridView, setGridView] = useState(true);
  const [approvedView, setApprovedView] = useState(false);
  const [archivedView, setArchivedView] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [approvedTaskList, setApprovedTaskList] = useState([]);
  const [archivedTaskList, setArchivedTaskList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter1, setFilter1] = useState({ type: "Any", value: "Any" });
  const [filter2, setFilter2] = useState({ type: "Any", value: "Any" });
  const [filter3, setFilter3] = useState({ type: "Any", value: "Any" });
  const [filter4, setFilter4] = useState({ type: "Any", value: "Any" });
  const [filter5, setFilter5] = useState({ type: "Any", value: "Any" });
  const [teammates, setTeammates] = useState([]);
  const [clients, setClients] = useState([]);
  const [types, setTypes] = useState([]);
  const location = sessionStorage.getItem("home");
  const [menuopen, setMenuOpen] = useState(false);
  const showMenu = () => {
    setMenuOpen(true);
  };
  const onMenuClose = () => {
    setMenuOpen(false);
  };
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const handleChangeTaskAssignedTime = (e) => {
    setFilter1({ type: "TaskAssignedTime", value: e });
  };
  const handleChangePeople = (e) => {
    setFilter2({ type: "TaskPeople", value: e });
  };
  const handleChangeClient = (e) => {
    setFilter3({ type: "TaskClient", value: e });
  };
  const handleChangeType = (e) => {
    setFilter4({ type: "TaskType", value: e });
  };
  const [userData, setUserData] = useState({
    data: { managerName: "", designation: "", teammateName: "" },
  });
  const [profileImage, setProfileImage] = useState("");
  const [profileName, setProfileName] = useState("");
  useEffect(() => {
    let obj = sessionStorage.getItem("userData");
    if (obj) {
      setUserData(JSON.parse(obj));
      sessionStorage.setItem("userId", JSON.parse(obj).id);
      setProfileImage(JSON.parse(obj).data.profileImage);
      if (sessionStorage.getItem("LoggedIn") === "manager") {
        setProfileName(JSON.parse(obj).data.managerName);
      } else {
        setProfileName(JSON.parse(obj).data.teammateName);
      }
    }

  }, []);

  const onChangeRadioTime = (e) => {
    setValue(e.target.value);
    setFilter1({ type: "TaskAssignedTime", value: e.target.value });
  };

  const onChangeRadioType = (e) => {
    setValue(e.target.value);
    setFilter4({ type: "TaskType", value: e.target.value });
  };

  const onChangeRadioClient = (e) => {
    setValue(e.target.value);
    setFilter3({ type: "TaskClient", value: e.target.value });
  };

  function onChange(event) {
    if (event) {
      markTeammateAttendance(
        userData.data.companyId,
        userData.id,
        userData.data.currentManagerId,
        userData.data.teammateName,
        userData.data.companyName,
        new Date().toLocaleDateString(),
        new Date()
      );
      let userDatas = JSON.parse(sessionStorage.getItem("userData"));
      userDatas.data.attendanceMarkedDate = new Date().toLocaleDateString();
      sessionStorage.setItem("userData", JSON.stringify(userDatas));
      let obj = sessionStorage.getItem("userData");
      if (obj) {
        setUserData(JSON.parse(obj));
      }
    }
  }

  async function fetchData2() {
    try {
      const userId = sessionStorage.getItem("userId");
      const userLogged = sessionStorage.getItem("LoggedIn");
      const companyId = JSON.parse(sessionStorage.getItem("userData")).data
        .companyId;
      const data =
        userLogged === "manager"
          ? await readTasksByManager(userId)
          : await readTasksByTeammate(userId);
      setTaskList(data);
      const [typesFetched, clientsFetched] =
        userLogged === "manager"
          ? await Promise.all([
            readTypesByCompanyId(companyId),
            readClientsByCompanyId(companyId),
          ])
          : await Promise.all([
            readTypesByCompanyId(companyId),
            readClientsByCompanyId(companyId),
          ]);
      setClients(clientsFetched);
      setTypes(typesFetched);
      if (userLogged === "manager") {
        const teammatesFetched = await readTeammatesByMangerId(userId);
        setTeammates(teammatesFetched);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  }
  useEffect(() => {
    async function fetchData() {
      try {
        const userId = sessionStorage.getItem("userId");
        const userLogged = sessionStorage.getItem("LoggedIn");
        const companyId = JSON.parse(sessionStorage.getItem("userData")).data
          .companyId;
        setLoading(true);
        const data =
          userLogged === "manager"
            ? await readTasksByManager(userId)
            : await readTasksByTeammate(userId);
        setTaskList(data);
        const [typesFetched, clientsFetched] =
          userLogged === "manager"
            ? await Promise.all([
              readTypesByCompanyId(companyId),
              readClientsByCompanyId(companyId),
            ])
            : await Promise.all([
              readTypesByCompanyId(companyId),
              readClientsByCompanyId(companyId),
            ]);
        setClients(clientsFetched);
        setTypes(typesFetched);
        if (userLogged === "manager") {
          const teammatesFetched = await readTeammatesByMangerId(userId);
          setTeammates(teammatesFetched);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);
  useEffect(() => {
    let unsub;
    const userLogged = sessionStorage.getItem("LoggedIn");
    if (userLogged === "manager") {
      const userId = sessionStorage.getItem("userId");
      const newcoll = setCollection(Collections.tasks);
      const q = query(newcoll, where(Fields.managerId, "==", userId));
      unsub = onSnapshot(q, { includeMetadataChanges: true }, async (snap) => {
        await fetchData2();
      });
    } else {
      const userId = sessionStorage.getItem("userId");
      const newcoll = setCollection(Collections.tasks);
      const q = query(newcoll, where(Fields.teammateId, "==", userId));
      unsub = onSnapshot(q, { includeMetadataChanges: true }, async (snap) => {
        await fetchData2();
      });
    }

    return async () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = sessionStorage.getItem("userId");
        const userLogged = sessionStorage.getItem("LoggedIn");
        setLoading(true);
        const data =
          userLogged === "manager"
            ? await readApprovedTasksByManager(userId)
            : await readApprovedTasksByTeammate(userId);
        const data2 =
          userLogged === "manager"
            ? await readArchivedTasksByManager(userId)
            : await readArchivedTasksByTeammate(userId);
        setApprovedTaskList(data);
        setArchivedTaskList(data2);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };
  const formatMonthYear = (date) => {
    return date.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  };

  /*
async function send(){
  try{
    const email='basu1735@gmail.com'
    const subject='Email testing'
    const output=`
    <p>Hello its a email testing </p>
    `
     const res=await sendEmail(email,subject,output);
     if(res){
      alert("sent")
     }
  }catch(err){
    alert("sent failed")
  }
}
*/

  return (
    <>
      <Drawer
        title="Teambo"
        placement="right"
        onClose={onMenuClose}
        open={menuopen}>
        <Button
          onClick={logOut}
          style={{ width: "100%" }}>
          Logout
        </Button>
      </Drawer>
      <Drawer
        title="Filters"
        placement={"bottom"}
        width={500}
        onClose={onClose}
        open={open}
        closable={false}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
          </Space>
        }>
        <Tabs
          tabPosition={"left"}
          items={[
            {
              label: `Time`,
              key: 1,
              children: (
                <div>
                  <Radio.Group
                    onChange={onChangeRadioTime}
                    value={value}>
                    <Radio
                      className="filterRadios"
                      value={"Any"}>
                      Any
                    </Radio>
                    <br />
                    <Radio
                      className="filterRadios"
                      value={"Today"}>
                      Today
                    </Radio>
                    <br />
                    <Radio
                      className="filterRadios"
                      value={"This week"}>
                      This week
                    </Radio>
                    <br />
                    <Radio
                      className="filterRadios"
                      value={"This month"}>
                      This month
                    </Radio>
                    <br />
                  </Radio.Group>
                </div>
              ),
            },
            {
              label: `Type`,
              key: 2,
              children: (
                <div>
                  <Radio.Group
                    onChange={onChangeRadioType}
                    value={value}>
                    <Radio
                      className="filterRadios"
                      value={"Any"}>
                      Any
                    </Radio>
                    <br />
                    {types.map((info) => (
                      <Radio
                        className="filterRadios"
                        value={info.data.type}>
                        {info.data.type}
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>
              ),
            },
            {
              label: `Client`,
              key: 3,
              children: (
                <div>
                  <Radio.Group
                    onChange={onChangeRadioClient}
                    value={value}>
                    <Radio
                      className="filterRadios"
                      value={"Any"}>
                      Any
                    </Radio>
                    <br />
                    {clients.map((info) => (
                      <Radio
                        className="filterRadios"
                        value={info.data.clientName}>
                        {info.data.clientName}
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>
              ),
            },
          ]}
        />
      </Drawer>
      <div
        className="WIPmanager"
        id="WIPmanager">
        {location !== "home" && (
          <div
            className="head"
            id="head">
            <span>
              <HistoryOutlined className="WIPicon" />{" "}
              {approvedView
                ? "Approved works"
                : archivedView
                ? "Archived works"
                : "Works in progress"}
            </span>
            <div className="head icon">
              <FilterOutlined onClick={showDrawer} />
              <MenuOutlined onClick={showMenu} />
            </div>
          </div>
        )}
        <div className="WIPhead">
          <div className="dropdowns">
            <Select
              defaultValue="Today"
              name="TaskAssignedTime"
              style={{ width: 120 }}
              onChange={handleChangeTaskAssignedTime}
              options={[
                { value: "Any", label: "Any" },
                { value: "Today", label: "Today" },
                { value: "Month", label: "This Month" },
                { value: "Year", label: "This Year" },
              ]}
            />
            {sessionStorage.getItem("LoggedIn") === "manager" && (
              <Select
                defaultValue="People"
                style={{ width: 120 }}
                onChange={handleChangePeople}
                options={[
                  { value: "Any", label: "Any" },
                  ...teammates.map((info) => ({
                    value: info.data.teammateName,
                    label: info.data.teammateName,
                  })),
                ]}
              />
            )}
            <Select
              defaultValue="Type"
              style={{ width: 120 }}
              onChange={handleChangeType}
              options={[
                { value: "Any", label: "Any" },
                ...types.map((info) => ({
                  value: info.data.type,
                  label: info.data.type,
                })),
              ]}
            />
            <Select
              defaultValue="Client"
              style={{ width: 120 }}
              onChange={handleChangeClient}
              options={[
                { value: "Any", label: "Any" },
                ...clients.map((info) => ({
                  value: info.data.clientName,
                  label: info.data.clientName,
                })),
              ]}
            />

            <Button
              onClick={() => {
                setFilter1({ type: "Any", value: "Any" });
                setFilter2({ type: "Any", value: "Any" });
                setFilter3({ type: "Any", value: "Any" });
                setFilter4({ type: "Any", value: "Any" });
                setFilter5({ type: "Any", value: "Any" });
              }}>
              Clear filters <ClearOutlined />
            </Button>
          </div>

          <div className="switch-buttons">
            <div
              className="grid-button"
              style={
                archivedView
                  ? { backgroundColor: "#2785ff", color: "#fff" }
                  : {}
              }
              onClick={() => {
                setArchivedView(true);
                setApprovedView(false);
                setListView(false);
                setGridView(false);
              }}>
              <MdArchive size={18} />
            </div>
            <div
              className="grid-button"
              style={
                approvedView
                  ? { backgroundColor: "#2785ff", color: "#fff" }
                  : {}
              }
              onClick={() => {
                setApprovedView(true);
                setArchivedView(false);
                setListView(false);
                setGridView(false);
              }}>
              <FolderViewOutlined />
            </div>
            <div
              className="grid-button"
              style={
                gridView ? { backgroundColor: "#fcad00", color: "#fff" } : {}
              }
              onClick={() => {
                setApprovedView(false);
                setArchivedView(false);
                setListView(false);
                setGridView(true);
              }}>
              <BorderlessTableOutlined />
            </div>
            <div
              className="list-button"
              style={
                listView ? { backgroundColor: "#01875a", color: "#fff" } : {}
              }
              onClick={() => {
                setApprovedView(false);
                setArchivedView(false);
                setListView(true);
                setGridView(false);
              }}>
              <UnorderedListOutlined />
            </div>

            {sessionStorage.getItem("LoggedIn") === "manager" ? (
              <div
                className="newTask"
                style={{ background: "transparent" }}>
                <Button
                  className="newBtn"
                  onClick={() => navigate("/addnewtask")}>
                  <PlusSquareOutlined /> <p>New</p>
                </Button>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>

        <div className="mobileView">
          {location === "home" && (
            <div
              className="homemobview"
              id="homemobview">
              <div className="profile">
                <div
                  style={{ display: "flex", gap: "2vh", alignItems: "center" }}>
                  {profileImage ? (
                    <Avatar
                      size={60}
                      src={userData?.data?.profileImage}
                    />
                  ) : (
                    <ProfilePic initial={profileName} />
                  )}
                  <div className="profileDetails">
                    <span style={{ color: "black" }}>{profileName}</span> <br />
                    <p style={{ fontWeight: "700" }}>
                      {userData.data.designation}
                    </p>
                  </div>
                </div>
                <MenuOutlined onClick={showMenu} />
              </div>

              <div className="attendance">
                <span style={{ color: "black" }}>Attendance</span>
                <Switch
                  checked={
                    userData.data.attendanceMarkedDate ===
                    new Date().toLocaleDateString()
                      ? true
                      : false
                  }
                  disabled={
                    userData.data.attendanceMarkedDate !==
                    new Date().toLocaleDateString()
                      ? false
                      : true
                  }
                  onChange={(e) => {
                    onChange(e);
                  }}
                />
              </div>

              <div className="progress">
                <span>This week</span>
                <div className="progresses">
                  <div
                    className="progressTasks"
                    style={{ backgroundColor: "#D9FFF2" }}>
                    <span style={{ color: "#01875A" }}>On Going</span>
                    <span
                      className="Taskscount"
                      style={{ color: "#01875A" }}>
                      {
                        taskList
                          ?.filter((info) => {
                            const filter1Result =
                              filter1.value !== "Any"
                                ? filter1.value === "Today"
                                  ? formatDate(new Date()) ===
                                    formatDate(
                                      new Date(info.assigned.seconds * 1000)
                                    )
                                  : filter1.value === "Month"
                                  ? formatMonthYear(new Date()) ===
                                    formatMonthYear(
                                      new Date(info.assigned.seconds * 1000)
                                    )
                                  : filter1.value === "Year"
                                  ? new Date().getFullYear() ===
                                    new Date(
                                      info.assigned.seconds * 1000
                                    ).getFullYear()
                                  : true
                                : true;

                            const filter2Result =
                              filter2.value !== "Any"
                                ? filter2.value === info.teammateName
                                : true;
                            const filter3Result =
                              filter3.value !== "Any"
                                ? filter3.value === info.clientName
                                : true;
                            const filter4Result =
                              filter4.value !== "Any"
                                ? filter4.value === info.type
                                : true;

                            return (
                              filter1Result &&
                              filter2Result &&
                              filter3Result &&
                              filter4Result
                            );
                          })
                          .filter((task) => task.status === "ON_GOING").length
                      }
                    </span>
                  </div>

                  <div
                    className="progressTasks"
                    style={{ backgroundColor: "#FFF7E8" }}>
                    <span style={{ color: "#FCAD00" }}>Paused</span>
                    <span
                      className="Taskscount"
                      style={{ color: "#FCAD00" }}>
                      {
                        taskList
                          ?.filter((info) => {
                            const filter1Result =
                              filter1.value !== "Any"
                                ? filter1.value === "Today"
                                  ? formatDate(new Date()) ===
                                    formatDate(
                                      new Date(info.assigned.seconds * 1000)
                                    )
                                  : filter1.value === "Month"
                                  ? formatMonthYear(new Date()) ===
                                    formatMonthYear(
                                      new Date(info.assigned.seconds * 1000)
                                    )
                                  : filter1.value === "Year"
                                  ? new Date().getFullYear() ===
                                    new Date(
                                      info.assigned.seconds * 1000
                                    ).getFullYear()
                                  : true
                                : true;

                            const filter2Result =
                              filter2.value !== "Any"
                                ? filter2.value === info.teammateName
                                : true;
                            const filter3Result =
                              filter3.value !== "Any"
                                ? filter3.value === info.clientName
                                : true;
                            const filter4Result =
                              filter4.value !== "Any"
                                ? filter4.value === info.type
                                : true;

                            return (
                              filter1Result &&
                              filter2Result &&
                              filter3Result &&
                              filter4Result
                            );
                          })
                          .filter((task) => task.status === "PAUSED").length
                      }
                    </span>
                  </div>

                  <div
                    className="progressTasks"
                    style={{ backgroundColor: "#F5F5F5" }}>
                    <span style={{ color: "#000000", fontSize: "22px" }}>
                      Not Started
                    </span>
                    <span
                      className="Taskscount"
                      style={{ color: "#000000" }}>
                      {
                        taskList
                          ?.filter((info) => {
                            const filter1Result =
                              filter1.value !== "Any"
                                ? filter1.value === "Today"
                                  ? formatDate(new Date()) ===
                                    formatDate(
                                      new Date(info.assigned.seconds * 1000)
                                    )
                                  : filter1.value === "Month"
                                  ? formatMonthYear(new Date()) ===
                                    formatMonthYear(
                                      new Date(info.assigned.seconds * 1000)
                                    )
                                  : filter1.value === "Year"
                                  ? new Date().getFullYear() ===
                                    new Date(
                                      info.assigned.seconds * 1000
                                    ).getFullYear()
                                  : true
                                : true;

                            const filter2Result =
                              filter2.value !== "Any"
                                ? filter2.value === info.teammateName
                                : true;
                            const filter3Result =
                              filter3.value !== "Any"
                                ? filter3.value === info.clientName
                                : true;
                            const filter4Result =
                              filter4.value !== "Any"
                                ? filter4.value === info.type
                                : true;

                            return (
                              filter1Result &&
                              filter2Result &&
                              filter3Result &&
                              filter4Result
                            );
                          })
                          .filter((task) => task.status === "ASSIGNED").length
                      }
                    </span>
                  </div>

                  <div
                    className="progressTasks"
                    style={{ backgroundColor: "#E2F2FF" }}>
                    <span style={{ color: "#2785FF" }}>Done</span>
                    <span
                      className="Taskscount"
                      style={{ color: "#2785FF" }}>
                      {
                        taskList
                          ?.filter((info) => {
                            const filter1Result =
                              filter1.value !== "Any"
                                ? filter1.value === "Today"
                                  ? formatDate(new Date()) ===
                                    formatDate(
                                      new Date(info.assigned.seconds * 1000)
                                    )
                                  : filter1.value === "Month"
                                  ? formatMonthYear(new Date()) ===
                                    formatMonthYear(
                                      new Date(info.assigned.seconds * 1000)
                                    )
                                  : filter1.value === "Year"
                                  ? new Date().getFullYear() ===
                                    new Date(
                                      info.assigned.seconds * 1000
                                    ).getFullYear()
                                  : true
                                : true;

                            const filter2Result =
                              filter2.value !== "Any"
                                ? filter2.value === info.teammateName
                                : true;
                            const filter3Result =
                              filter3.value !== "Any"
                                ? filter3.value === info.clientName
                                : true;
                            const filter4Result =
                              filter4.value !== "Any"
                                ? filter4.value === info.type
                                : true;

                            return (
                              filter1Result &&
                              filter2Result &&
                              filter3Result &&
                              filter4Result
                            );
                          })
                          .filter((task) => task.status === "DONE").length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {location !== "home" && (
            <div
              className="mob"
              id="mob">
              <Button
                block
                style={{
                  color: "#01875A",
                  backgroundColor: "#D9FFF2",
                  border: "#66D9B3 solid 2px",
                  boxShadow: "#01875A",
                }}
                onClick={() => {
                  setFilter5({ type: "ON_GOING", value: "ON_GOING" });
                  setApprovedView(false);
                  setArchivedView(false);
                  setListView(false);
                  setGridView(true);
                }}>
                On Going
              </Button>
              <Button
                block
                style={{
                  color: "rgb(252, 173, 0)",
                  backgroundColor: "rgba(252, 173, 0, 0.1)",
                  border: "rgb(252, 173, 0) solid 2px",
                  boxShadow: "rgb(252, 173, 0)",
                }}
                onClick={() => {
                  setFilter5({ type: "PAUSED", value: "PAUSED" });
                  setApprovedView(false);
                  setArchivedView(false);
                  setListView(false);
                  setGridView(true);
                }}>
                Paused
              </Button>
              <Button
                block
                style={{
                  color: "rgb(8, 16, 36)",
                  backgroundColor: "rgba(8, 16, 36, 0.1)",
                  border: "rgb(8, 16, 36) solid 2px",
                  boxShadow: "rgb(8, 16, 36)",
                }}
                onClick={() => {
                  setFilter5({ type: "ASSIGNED", value: "ASSIGNED" });
                  setApprovedView(false);
                  setArchivedView(false);
                  setListView(false);
                  setGridView(true);
                }}>
                Not Started
              </Button>
              <Button
                block
                style={{
                  color: "rgb(39, 133, 255)",
                  backgroundColor: "rgba(39, 133, 255, 0.1)",
                  border: "rgb(39, 133, 255) solid 2px",
                  boxShadow: "rgb(39, 133, 255)",
                }}
                onClick={() => {
                  setFilter5({ type: "DONE", value: "DONE" });
                  setApprovedView(false);
                  setArchivedView(false);
                  setListView(false);
                  setGridView(true);
                }}>
                Done
              </Button>
            </div>
          )}
        </div>

        <div
          className="action"
          style={{ gap: "0.8vw" }}
          id="action">
          <div
            className="action child"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setFilter5({ type: "ON_GOING", value: "ON_GOING" });
              setApprovedView(false);
              setArchivedView(false);
              setListView(true);
              setGridView(false);
            }}>
            <div className="ongoing">
              <span>On Going</span>
            </div>
            <div className="count">
              <span>
                {
                  taskList
                    ?.filter((info) => {
                      const filter1Result =
                        filter1.value !== "Any"
                          ? filter1.value === "Today"
                            ? formatDate(new Date()) ===
                              formatDate(new Date(info.assigned.seconds * 1000))
                            : filter1.value === "Month"
                            ? formatMonthYear(new Date()) ===
                              formatMonthYear(
                                new Date(info.assigned.seconds * 1000)
                              )
                            : filter1.value === "Year"
                            ? new Date().getFullYear() ===
                              new Date(
                                info.assigned.seconds * 1000
                              ).getFullYear()
                            : true
                          : true;

                      const filter2Result =
                        filter2.value !== "Any"
                          ? filter2.value === info.teammateName
                          : true;
                      const filter3Result =
                        filter3.value !== "Any"
                          ? filter3.value === info.clientName
                          : true;
                      const filter4Result =
                        filter4.value !== "Any"
                          ? filter4.value === info.type
                          : true;

                      return (
                        filter1Result &&
                        filter2Result &&
                        filter3Result &&
                        filter4Result
                      );
                    })
                    .filter((task) => task.status === "ON_GOING").length
                }
              </span>
            </div>
          </div>

          <div
            className="action child"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setFilter5({ type: "PAUSED", value: "PAUSED" });
              setApprovedView(false);
              setArchivedView(false);
              setListView(true);
              setGridView(false);
            }}>
            <div
              className="ongoing"
              style={{
                backgroundColor: "rgba(252,173,0,0.1)",
                color: "#FCAD00",
              }}>
              <span>Paused</span>
            </div>
            <div
              className="count"
              style={{ backgroundColor: "#FCAD00", color: "white" }}>
              <span>
                {
                  taskList
                    ?.filter((info) => {
                      const filter1Result =
                        filter1.value !== "Any"
                          ? filter1.value === "Today"
                            ? formatDate(new Date()) ===
                              formatDate(new Date(info.assigned.seconds * 1000))
                            : filter1.value === "Month"
                            ? formatMonthYear(new Date()) ===
                              formatMonthYear(
                                new Date(info.assigned.seconds * 1000)
                              )
                            : filter1.value === "Year"
                            ? new Date().getFullYear() ===
                              new Date(
                                info.assigned.seconds * 1000
                              ).getFullYear()
                            : true
                          : true;

                      const filter2Result =
                        filter2.value !== "Any"
                          ? filter2.value === info.teammateName
                          : true;
                      const filter3Result =
                        filter3.value !== "Any"
                          ? filter3.value === info.clientName
                          : true;
                      const filter4Result =
                        filter4.value !== "Any"
                          ? filter4.value === info.type
                          : true;

                      return (
                        filter1Result &&
                        filter2Result &&
                        filter3Result &&
                        filter4Result
                      );
                    })
                    .filter((task) => task.status === "PAUSED").length
                }
              </span>
            </div>
          </div>

          <div
            className="action child"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setFilter5({ type: "ASSIGNED", value: "ASSIGNED" });
              setApprovedView(false);
              setArchivedView(false);
              setListView(true);
              setGridView(false);
            }}>
            <div
              className="ongoing"
              style={{
                backgroundColor: "rgba(8,16,36,0.1)",
                color: "#081024",
              }}>
              <span>Not Started</span>
            </div>
            <div
              className="count"
              style={{ backgroundColor: "#081024", color: "white" }}>
              <span>
                {
                  taskList
                    ?.filter((info) => {
                      const filter1Result =
                        filter1.value !== "Any"
                          ? filter1.value === "Today"
                            ? formatDate(new Date()) ===
                              formatDate(new Date(info.assigned.seconds * 1000))
                            : filter1.value === "Month"
                            ? formatMonthYear(new Date()) ===
                              formatMonthYear(
                                new Date(info.assigned.seconds * 1000)
                              )
                            : filter1.value === "Year"
                            ? new Date().getFullYear() ===
                              new Date(
                                info.assigned.seconds * 1000
                              ).getFullYear()
                            : true
                          : true;

                      const filter2Result =
                        filter2.value !== "Any"
                          ? filter2.value === info.teammateName
                          : true;
                      const filter3Result =
                        filter3.value !== "Any"
                          ? filter3.value === info.clientName
                          : true;
                      const filter4Result =
                        filter4.value !== "Any"
                          ? filter4.value === info.type
                          : true;

                      return (
                        filter1Result &&
                        filter2Result &&
                        filter3Result &&
                        filter4Result
                      );
                    })
                    .filter((task) => task.status === "ASSIGNED").length
                }
              </span>
            </div>
          </div>

          <div
            className="action child"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setFilter5({ type: "DONE", value: "DONE" });
              setApprovedView(false);
              setArchivedView(false);
              setListView(true);
              setGridView(false);
            }}>
            <div
              className="ongoing"
              style={{
                backgroundColor: "rgba(39,133,255,0.1)",
                color: "#2785ff",
              }}>
              <span>Done</span>
            </div>
            <div
              className="count"
              style={{ backgroundColor: "#2785ff", color: "white" }}>
              <span>
                {
                  taskList
                    ?.filter((info) => {
                      const filter1Result =
                        filter1.value !== "Any"
                          ? filter1.value === "Today"
                            ? formatDate(new Date()) ===
                              formatDate(new Date(info.assigned.seconds * 1000))
                            : filter1.value === "Month"
                            ? formatMonthYear(new Date()) ===
                              formatMonthYear(
                                new Date(info.assigned.seconds * 1000)
                              )
                            : filter1.value === "Year"
                            ? new Date().getFullYear() ===
                              new Date(
                                info.assigned.seconds * 1000
                              ).getFullYear()
                            : true
                          : true;

                      const filter2Result =
                        filter2.value !== "Any"
                          ? filter2.value === info.teammateName
                          : true;
                      const filter3Result =
                        filter3.value !== "Any"
                          ? filter3.value === info.clientName
                          : true;
                      const filter4Result =
                        filter4.value !== "Any"
                          ? filter4.value === info.type
                          : true;

                      return (
                        filter1Result &&
                        filter2Result &&
                        filter3Result &&
                        filter4Result
                      );
                    })
                    .filter((task) => task.status === "DONE").length
                }
              </span>
            </div>
          </div>

          <div
            className="action child"
            style={{ cursor: "pointer" }}
            onClick={() => {
              // setFilter5({ type: "APPROVED", value: "APPROVED" });
              setApprovedView(true);
              setListView(false);
              setGridView(false);
              setArchivedView(false);
            }}>
            <div
              className="ongoing"
              style={{
                backgroundColor: "2785ff",
                color: "#802392",
              }}>
              <span>Approved</span>
            </div>
            <div
              className="count"
              style={{ backgroundColor: "#802392", color: "white" }}>
              <span>
                {
                  approvedTaskList
                    ?.filter((info) => {
                      const filter1Result =
                        filter1.value !== "Any"
                          ? filter1.value === "Today"
                            ? formatDate(new Date()) ===
                              formatDate(new Date(info.assigned.seconds * 1000))
                            : filter1.value === "Month"
                            ? formatMonthYear(new Date()) ===
                              formatMonthYear(
                                new Date(info.assigned.seconds * 1000)
                              )
                            : filter1.value === "Year"
                            ? new Date().getFullYear() ===
                              new Date(
                                info.assigned.seconds * 1000
                              ).getFullYear()
                            : true
                          : true;

                      const filter2Result =
                        filter2.value !== "Any"
                          ? filter2.value === info.teammateName
                          : true;
                      const filter3Result =
                        filter3.value !== "Any"
                          ? filter3.value === info.clientName
                          : true;
                      const filter4Result =
                        filter4.value !== "Any"
                          ? filter4.value === info.type
                          : true;

                      return (
                        filter1Result &&
                        filter2Result &&
                        filter3Result &&
                        filter4Result
                      );
                    })
                    .filter((task) => task.status === "APPROVED").length
                }
              </span>
            </div>
          </div>
        </div>

        {taskList.length > 0 ||
        approvedTaskList.length > 0 ||
        archivedTaskList.length > 0 ? (
          <>
            {location !== "home" && (
              <div
                className="view"
                id="view">
                {approvedView && (
                  <GridView
                    tasks={approvedTaskList}
                    filter1={filter1}
                    filter2={filter2}
                    filter3={filter3}
                    filter4={filter4}
                    filter5={filter5}
                  />
                )}
                {archivedView && (
                  <GridView
                    tasks={archivedTaskList}
                    filter1={filter1}
                    filter2={filter2}
                    filter3={filter3}
                    filter4={filter4}
                    filter5={filter5}
                  />
                )}

                {listView && (
                  <ListView
                    tasks={taskList}
                    filter1={filter1}
                    filter2={filter2}
                    filter3={filter3}
                    filter4={filter4}
                    filter5={filter5}
                  />
                )}
                {gridView && (
                  <GridView
                    tasks={taskList}
                    filter1={filter1}
                    filter2={filter2}
                    filter3={filter3}
                    filter4={filter4}
                    filter5={filter5}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ marginTop: "10vh" }}>
            <Empty description={<span>No Tasks</span>} />
          </div>
        )}

        <Loader
          loading={loading}
          text="Getting tasks ..."
        />
      </div>
    </>
  );
}
