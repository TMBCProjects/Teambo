import React, { useEffect, useState } from "react";
import {
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
  IdcardOutlined,
  PlusSquareOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { Input, Button, Empty, notification, Select } from "antd";
import "../Profile/main.css";
import Loader from "../LoadingModal";
import {
  countAllTasks,
  countCurrentTasks,
  countTotalHours,
  readRequestsTeammate,
  requestAcceptTeammate,
  requestRejectTeammate,
  updateteammateDetails,
} from "../../DataBase/Teammate/teammate";
import {
  changePasswordWithCurrentPassword,
  logOut,
  setDocument,
} from "../../utils/FirebaseUtils";
import { updateManagerDetails } from "../../DataBase/Manager/manager";
import { Collections } from "../../utils/Collections";
import { onSnapshot } from "@firebase/firestore";

export default function Profile() {
  const [editable, setEditable] = useState(true);
  const [securityeditable, setSecurityEditable] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [api, apicontextHolder] = notification.useNotification();
  const [requests, setRequests] = useState([{}]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    data: { teammateName: " ", teammateEmail: " " },
    id: " ",
  });
  const [taskDetails, setTaskDetails] = useState({
    allTasks: 0,
    currentTasks: 0,
    totalHours: 0,
  });
  const [userLog, setUserLog] = useState({
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [userDetails, setUserDetails] = useState({
    name: "",
    whatsappNumber: "",
    typeOfEmployment: "",
    photoFile: "",
  });

  const handleInputChange = (event) => {
    let newInput = { [event.target.name]: event.target.value };
    setUserDetails({ ...userDetails, ...newInput });
  };
  const onEmploymentTypeChange = (event) => {
    let newInput = { typeOfEmployment: event };
    setUserDetails({ ...userDetails, ...newInput });
  }
  useEffect(() => {
    const obj = sessionStorage.getItem("userData");
    if (obj) {
      const data = JSON.parse(obj);
      setUserData(data);
      setProfileImage(data.data.profileImage);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (sessionStorage.getItem("LoggedIn") !== "manager") {
        const requestData = await readRequestsTeammate(
          userData.data.teammateEmail
        );
        setRequests(requestData);
      }
    };
    fetchData();
    return () => { };
  }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      const collection =
        sessionStorage.getItem("LoggedIn") === "manager"
          ? Collections.managers
          : Collections.teammates;
      const unsub = onSnapshot(
        setDocument(collection, userData.id),
        { includeMetadataChanges: true },
        (doc) => {
          setProfileImage(doc.data().profileImage);
        }
      );
      return unsub;
    };
    fetchData();
    return () => { };
  }, [userData]);

  useEffect(() => {
    const hoursInFullFormat = (decimalHour) => {
      var decimalTimeString = String(decimalHour);
      var decimalTime = parseFloat(decimalTimeString);
      decimalTime = decimalTime * 60 * 60;
      var hours = Math.floor(decimalTime / (60 * 60));
      return hours;
    };
    const fetchData = async () => {
      let obj = JSON.parse(sessionStorage.getItem("userData"));
      if (obj) {
        let a = await countAllTasks(obj.id);
        let b = await countCurrentTasks(obj.id);
        let c = await countTotalHours(obj.id);
        setTaskDetails({
          allTasks: a,
          currentTasks: b,
          totalHours: hoursInFullFormat(c),
        });
      }
    };
    fetchData();
  }, []);

  const accept = (
    teammateEmail,
    name,
    managerId,
    teammateId,
    companyId,
    companyName,
    requestId,
    managerName
  ) => {
    requestAcceptTeammate(
      teammateEmail,
      name,
      managerId,
      teammateId,
      companyId,
      companyName,
      managerName,
      requestId
    );
    let obj = sessionStorage.getItem("userData");
    if (obj) {
      let data = JSON.parse(obj);
      data.data.currentManagerName = managerName;
      setUserData(data);
    }
  };

  const reject = (teammateEmail, name, managerId, teammateId, requestId) => {
    requestRejectTeammate(
      teammateEmail,
      name,
      managerId,
      teammateId,
      requestId
    );
  };

  const changePassword = async (e, placement) => {
    if (userLog.newPassword === userLog.confirmNewPassword) {
      await changePasswordWithCurrentPassword(
        userLog.password,
        userLog.newPassword
      ).then(() => {
        api.open({
          message: "Success! ",
          description: "Your Password has been Changed.",
          placement,
        });
        setTimeout(() => {
          logOut();
        }, 1500);
      });
    } else {
      console.error("Passwords does not match!");
      api.open({
        message: "Failed! ",
        description: "Passwords does not match.",
        placement,
      });
    }
  };

  const handleChangeLog = (event) => {
    let newInput1 = { [event.target.name]: event.target.value };
    setUserLog({ ...userLog, ...newInput1 });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setProfileImage(event.target.value);
    let newInput = { photoFile: file };
    setUserDetails({ ...userDetails, ...newInput });
    setPhotoLoading(true);
  };

  const handleUserDetailSubmit = async () => {
    setLoading(true);
    const profileImage =
      sessionStorage.getItem("LoggedIn") === "manager"
        ? await updateManagerDetails(userData.id, userDetails)
        : await updateteammateDetails(userData.id, userDetails);
    let userDatas = JSON.parse(sessionStorage.getItem("userData"));
    userDatas.data.profileImage =
      userDetails.photoFile !== "" ? profileImage : userDatas.data.profileImage;
    sessionStorage.getItem("LoggedIn") === "manager"
      ? (userDatas.data.currentManagerName =
        userDetails.name !== ""
          ? userDetails.name
          : userDatas.data.currentManagerName)
      : (userDatas.data.teammateName =
        userDetails.name !== ""
          ? userDetails.name
          : userDatas.data.teammateName);

    userDatas.data.whatsappNumber =
      userDetails.whatsappNumber !== ""
        ? userDetails.whatsappNumber
        : userDatas.data.whatsappNumber;

    userDatas.data.typeOfEmployement =
      userDetails.typeOfEmployment !== ""
        ? userDetails.typeOfEmployment
        : userDatas.data.typeOfEmployement;

    sessionStorage.setItem("userData", JSON.stringify(userDatas));
    let obj = sessionStorage.getItem("userData");
    if (obj) {
      setUserData(JSON.parse(obj));
      setLoading(false);
      setEditable(true);
    }
  };

  return (
    <div className="teammateProfile">
      {apicontextHolder}
      <div className="profileHeader">
        <span>
          <IdcardOutlined /> Profile
        </span>
      </div>
      <div className="profileBody">
        <div className="userDetails">
          <div className="userDetailsHead">
            <span>User Details </span>
            <Button onClick={() => setEditable(!editable)}>
              {editable ? <EditOutlined /> : <CloseOutlined />}
            </Button>
          </div>

          <div className="userDetailsBody">
            <div className="profileForm">
              <label>Name</label>
              <label>Phone Number</label>
              <label>Designation</label>
              <label>Company</label>
              <label>Email</label>
              {sessionStorage.getItem("LoggedIn") === "teammate" ? (
                <label>Type of Employment</label>
              )
                :
                ""
              }
            </div>

            <div className="profileForm">
              <Input
                className="profileInputs"
                placeholder="Name"
                type="text"
                name="name"
                onChange={handleInputChange}
                disabled={editable}
                value={
                  userDetails.name ||
                  (sessionStorage.getItem("LoggedIn") === "manager"
                    ? userData.data.managerName
                    : userData.data.teammateName)
                }
              />
              <Input
                className="profileInputs"
                placeholder="Phone Number"
                type="number"
                name="whatsappNumber"
                onChange={handleInputChange}
                disabled={editable}
                value={
                  userDetails.whatsappNumber || userData.data.whatsappNumber
                }
              />
              <Input
                className="profileInputs disabled"
                type="text"
                disabled
                value={userData.data.designation}
                bordered={false}
              />
              <Input
                className="profileInputs disabled"
                type="text"
                disabled
                value={userData.data.companyName}
                bordered={false}
              />
              <Input
                className="profileInputs disabled"
                placeholder="Email"
                type="email"
                disabled
                value={
                  userData.data.teammateEmail || userData.data.managerEmail
                }
                bordered={false}
                style={{ width: "150%" }}
              />
              {sessionStorage.getItem("LoggedIn") === "teammate" ? (

                <Select
                  className="profileInputs"
                  placeholder={userData.data.typeOfEmployement}
                  disabled={editable}
                  style={{ marginBlock: "2vh" }}
                  name={"typeOfEmployment"}
                  onChange={(e) => { onEmploymentTypeChange(e) }}
                  options={[
                    {
                      value: 'Permanent full-time',
                      label: 'Permanent full-time',
                    },
                    {
                      value: 'Freelancer',
                      label: 'Freelancer',
                    },
                  ]}
                />)
                :
                ("")
              }
            </div>

            <div className="profilepicture">
              <label
                htmlFor="photoInput"
                disabled={editable}
                style={{
                  background:
                    userData.data.profileImage === ""
                      ? `url(${profileImage})`
                      : `url(${userData.data.profileImage})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  border: "2px black solid",
                }}
                className="photoLabel"
              >
                {photoLoading ? (
                  <>
                    <CheckSquareOutlined
                      style={{
                        fontSize: "1.3rem",
                        color: "greenyellow",
                        backdropFilter: "blur(4px)",
                      }}
                    />
                    <p>uploaded</p>
                  </>
                ) : (
                  <>
                    <PlusSquareOutlined
                      style={{
                        fontSize: "1.3rem",
                        backdropFilter: "blur(4px)",
                      }}
                    />
                  </>
                )}
              </label>
              <Input
                id="photoInput"
                type="file"
                style={{
                  width: "0",
                  visibility: "hidden",
                }}
                disabled={editable}
                onChange={(e) => {
                  handleFileUpload(e);
                }}
              />
            </div>
          </div>
          {!editable ? (
            <Button
              onClick={(e) => {
                handleUserDetailSubmit(e);
              }}
              className="profileBtn"
              type="primary"
              htmlType="submit"
            >
              Save
            </Button>
          ) : (
            ""
          )}
        </div>

        <div className="securityDetails">
          <div className="userDetailsHead">
            <span>Security </span>
            <Button onClick={() => setSecurityEditable(!securityeditable)}>
              {securityeditable ? <EditOutlined /> : <CloseOutlined />}
            </Button>
          </div>
          <div className="userDetailsBody">
            <div className="profileForm">
              <label>Current Password</label>
              <label>New Password</label>
              <label>Confirm New Password</label>
            </div>

            <div className="profileForm">
              <Input.Password
                className="profileInputs password"
                placeholder="Current Password"
                name="password"
                visibilityToggle={{
                  visible: passwordVisible,
                  onVisibleChange: setPasswordVisible,
                }}
                onChange={(e) => {
                  handleChangeLog(e);
                }}
                disabled={securityeditable}
              />
              <Input.Password
                className="profileInputs password"
                placeholder="New Password"
                name="newPassword"
                onChange={(e) => {
                  handleChangeLog(e);
                }}
                visibilityToggle={{
                  visible: passwordVisible,
                  onVisibleChange: setPasswordVisible,
                }}
                disabled={securityeditable}
              />
              <Input.Password
                className="profileInputs password"
                placeholder="Confirm New Password"
                name="confirmNewPassword"
                onChange={(e) => {
                  handleChangeLog(e);
                }}
                disabled={securityeditable}
                visibilityToggle={{
                  visible: passwordVisible,
                  onVisibleChange: setPasswordVisible,
                }}
              />
            </div>
          </div>
          {!securityeditable ? (
            <Button
              onClick={(e) => {
                changePassword(e, "top");
              }}
              className="profileBtn"
              type="primary"
              htmlType="submit"
            >
              Save
            </Button>
          ) : (
            ""
          )}
        </div>

        {sessionStorage.getItem("LoggedIn") === "teammate" ? (
          <div>
            <div className="workDetails" style={{ marginBottom: "5vh" }}>
              <div className="userDetailsHead">
                <span>Requests </span>
                {/* <button onClick={() => setSecurityEditable(false)}><EditOutlined /></button> */}
              </div>
              {requests && requests.length !== 0 ? (
                <div className="workDetailsBody">
                  <div className="workDetailsprofileForm">
                    {requests?.map((info) => {
                      return (
                        <div className="requests" key={info.id}>
                          <div className="profileForm">
                            <label>{info.managerName}</label>
                          </div>
                          <div className="profileForm">
                            <button
                              className="reqBtn accept"
                              onClick={() =>
                                accept(
                                  userData?.data.teammateEmail,
                                  userData?.data.teammateName,
                                  info.managerId,
                                  userData?.id,
                                  info.companyId,
                                  info.companyName,
                                  info.id,
                                  info.managerName
                                )
                              }
                            >
                              <CheckOutlined />
                            </button>
                          </div>

                          <div className="profileForm">
                            <button
                              className="reqBtn decline"
                              onClick={() =>
                                reject(
                                  userData?.data.teammateEmail,
                                  userData?.data.teammateName,
                                  info.managerId,
                                  userData?.id,
                                  info.id
                                )
                              }
                            >
                              <CloseOutlined />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div
                  className="notificationBox"
                  style={{ marginTop: "5vh", display: "flex" }}
                >
                  <Empty description={<span>No Requests</span>} />
                </div>
              )}
            </div>
            <div className="workDetails">
              <div className="userDetailsHead">
                <span>Work Details </span>
                {/* <button onClick={() => setSecurityEditable(false)}><EditOutlined /></button> */}
              </div>
              <div className="workDetailsBody">
                <div className="workDetailsprofileForm">
                  <div className="profileForm">
                    <label>Current Manager</label>
                  </div>

                  <div className="profileForm">
                    <label>{userData.data.currentManagerName}</label>
                  </div>
                </div>

                <div className="workDetailsFooter">
                  <div className="workFooterDetails">
                    <span>Total Tasks</span>
                    <span>{taskDetails.allTasks}</span>
                  </div>

                  <div className="workFooterDetails">
                    <span>Total Worktime</span>
                    <span>{taskDetails.totalHours} hrs</span>
                  </div>

                  <div className="workFooterDetails">
                    <span>Remaining tasks</span>
                    <span>{taskDetails.currentTasks}</span>
                  </div>
                  <Button className="moblogout" onClick={logOut} style={{ width: "100%" }}>Logout</Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>

      <Loader loading={loading} text="Updating profile ..." />
    </div>
  );
}
