import React, { useEffect, useState } from "react";
import "./main.css";
import Logo from "../Common/Header/Logo/index";
import {
  BellOutlined,
  LineChartOutlined,
  HistoryOutlined,
  TeamOutlined,
  LogoutOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { Switch, Avatar, Badge } from "antd";
import { useNavigate, NavLink } from "react-router-dom";
import {
  markEndTeammateAttendance,
  markTeammateAttendance,
  attendanceStartTime,
} from "../../DataBase/Teammate/teammate";
import { logOut, setDocument } from "../../utils/FirebaseUtils";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase-config";
import { onSnapshot } from "@firebase/firestore";
import { Collections } from "../../utils/Collections";
import ProfilePic from "../Common/ProfilePic/ProfilePic";
import {
  readTeammateNotifications,
  readTasksByTeammate,
} from "../../DataBase/Teammate/teammate";
import {
  readManagerNotifications,
  readTasksByManager,
} from "../../DataBase/Manager/manager";

export default function Home() {
  // const [active, setActive] = useState(false)
  const [userData, setUserData] = useState({
    data: { managerName: "", designation: "", teammateName: "" },
  });
  const [profileImage, setProfileImage] = useState("");
  const [attendanceTime, setAttendanceTime] = useState("");
  const [profileName, setProfileName] = useState("");
  const [notificationList, setNotificationList] = useState([]);
  const navigate = useNavigate();

  // const handleClick = (event) => {
  //   setActive(true);
  // }
  async function fetchData() {
    try {
      const userId = sessionStorage.getItem("userId");
      const userLogged = sessionStorage.getItem("LoggedIn");

      const [taskFetched, notificationFetched] =
        userLogged === "manager"
          ? await Promise.all([
              readTasksByManager(userId),
              readManagerNotifications(userId),
            ])
          : await Promise.all([
              readTasksByTeammate(userId),
              readTeammateNotifications(userId),
            ]);
      setNotificationList(notificationFetched);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    async function fetchData2() {
      try {
        let userDatas = JSON.parse(sessionStorage.getItem("userData"));
        const attendance = await attendanceStartTime(
          userDatas.data.attendanceMarkedId
        );
        setAttendanceTime(attendance);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData2();
  }, []);
  onAuthStateChanged(auth, (user) => {
    if (user) {
    } else {
      window.location.href = "/";
    }
  });

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

  // sessionStorage.clear()
  function logOff() {
    logOut();
    setTimeout(() => {
      window.location.reload();
    }, 0);
    navigate("/");
  }

  async function onChange(event) {
    if (event) {
      const id = await markTeammateAttendance(
        userData.data.companyId,
        userData.id,
        userData.data.currentManagerId,
        userData.data.teammateName,
        userData.data.companyName,
        new Date().toLocaleDateString(),
        new Date()
      );
      let userD = JSON.parse(sessionStorage.getItem("userData"));
      userD.data.attendanceMarkedId = id;
      sessionStorage.setItem("userData", JSON.stringify(userD));
      let obj = sessionStorage.getItem("userData");
      if (obj) {
        setUserData(JSON.parse(obj));
      }
    } else {
      let userDatas = JSON.parse(sessionStorage.getItem("userData"));
      markEndTeammateAttendance(
        userDatas.data.attendanceMarkedId,
        userData.id,
        new Date()
      );
      userDatas.data.attendanceMarkedId = "";
      sessionStorage.setItem("userData", JSON.stringify(userDatas));
      let obj = sessionStorage.getItem("userData");
      if (obj) {
        setUserData(JSON.parse(obj));
      }
    }
  }
  // function notify() {
  //   navigate('/notification')
  // }

  useEffect(() => {
    let id = sessionStorage.getItem("userId");
    let unsub;
    if (sessionStorage.getItem("LoggedIn") === "manager") {
      unsub = onSnapshot(
        setDocument(Collections.managers, id),
        { includeMetadataChanges: true },
        async (doc) => {
          setProfileImage(doc.data().profileImage);
          setProfileName(doc.data().managerName);
        }
      );
    } else {
      unsub = onSnapshot(
        setDocument(Collections.teammates, id),
        { includeMetadataChanges: true },
        async (doc) => {
          setProfileImage(doc.data().profileImage);
          setProfileName(doc.data().teammateName);
        }
      );
    }

    return () => {
      unsub();
    };
  }, []);

  return (
    <div className="mainBG">
      <div
        className="header-container"
        style={{ color: "white" }}>
        <Logo />
      </div>

      <div className="content">
        <div className="profile">
          {profileImage ? (
            <Avatar
              size={60}
              src={userData?.data?.profileImage}
            />
          ) : (
            <ProfilePic initial={profileName} />
          )}
          <div className="profileDetails">
            <span>{profileName}</span> <br />
            <p>{userData.data.designation}</p>
          </div>
        </div>

        {/* <div className="search">
          <Search
            placeholder="Search"
            allowbClear
            onSearch={onSearch}
            style={{
              width: 200,
              background: "transparent",
            }}
          />
        </div> */}

        <div className="companiesMenu">
          <div className="companiesHead">
            <span>Companies</span>
          </div>
          <div className="companiesBody">
            <ProfilePic initial={userData.data.companyName} />
            &nbsp; &nbsp;
            <span>{userData.data.companyName}</span>
          </div>
        </div>

        {sessionStorage.getItem("LoggedIn") !== "manager" && (
          <div className="attendance">
            <span>Attendance</span>
            <Switch
              checked={userData.data.attendanceMarkedId !== "" ? true : false}
              onChange={(e) => {
                onChange(e);
              }}
            />
          </div>
        )}
        <div className="menu">
          {/* <li><HistoryOutlined /> &nbsp; Works in progress</li> */}

          <NavLink
            to="/"
            activeclassname="active"
            className="menu link wip">
            <HistoryOutlined /> &nbsp; Works in progress
          </NavLink>
          {/* <li><HistoryOutlined /> &nbsp; Works in progress</li> */}
          {sessionStorage.getItem("LoggedIn") === "manager" ? (
            <>
              <NavLink
                to="/people"
                activeclassname="active"
                className="menu link">
                <TeamOutlined /> &nbsp; People
              </NavLink>
              <NavLink
                to="/analytics"
                activeclassname="active"
                className="menu link">
                <LineChartOutlined /> &nbsp; Analytics
              </NavLink>
            </>
          ) : (
            ""
          )}
          <NavLink
            to="/notification"
            activeclassname="active"
            className="menu link">
            {notificationList ? (
              <Badge count={notificationList.length}>
                <BellOutlined className="notifyicon" />
              </Badge>
            ) : (
              <BellOutlined />
            )}
            &nbsp; Notifications
          </NavLink>
          <NavLink
            to="/profile"
            activeclassname="active"
            className="menu link">
            <IdcardOutlined /> &nbsp; Profile
          </NavLink>
        </div>

        <div
          className="foot"
          onClick={logOff}>
          <span>
            <LogoutOutlined className="logoutIcon" /> &nbsp; Logout
          </span>
        </div>
      </div>
    </div>
  );
}
