import React from "react";
import { NavLink, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "../../Pages/Login/login_test";
import LoginForm from "../../Components/Login/LoginForm/LoginForm_test";
import SignupTest from "../Signup/SignupFormTM/Signup_test";
import ForgotPassTest from "../Login/FpForm/ForgotPass_test";
import RecoveryForm1Test from "../Login/RecoveryForms/RecoveryForm1_test";
import SignupFinishTest from "../Signup/SignupFinishForm/SignupFinish_test";
import RecoveryForm2Test from "../Login/RecoveryForms/RecoveryForm2_test";
import RecoveryFormFinish from "../Login/RecoveryForms/RecoveryFormFinish";
import PageNotFound from "../PageNotFound/PageNotFound";
import Home from "../Home/Home";
import WorkInProgress from "../WorkInProgress/WorkInProgress";
import "../Routing/main.css";
import AddTask from "../Manager/AddTask/AddTask";
import AddMember from "../Manager/AddNewMember/AddMember";
import Notification from "../Notification/Notification";
import PeoplePage from "../Manager/People/PeoplePage";
import TaskDetails from "../Manager/TaskDetails";
import TeammateTaskDetails from "../Teammate/TeammateTaskDetails/TeammateTaskDetails";
import Analytics from "../Manager/Analytics";
import Profile from "../Profile/Profile";
import SignupWithGoogle from "../Signup/SignupWithGoogle/SignupWithGoogle";
import ProfileTask from "../ProfileTask/profileTask";
import { HomeOutlined, HistoryOutlined, BellOutlined, UserOutlined } from "@ant-design/icons"

const Routing = () => {
  const home = () => {
    sessionStorage.setItem("home","home");
  }

  const nothome = () => {
    sessionStorage.removeItem("home");

  }
  return (
    <Router>
      <div>
        {sessionStorage.getItem("LoggedIn") ? (
          <div className="authorisedLogin">
            <Home />
            <div className="manager">
              <Routes>
                <Route path="/" element={<WorkInProgress />} />
                <Route path="/profile" element={<Profile />}></Route>
              </Routes>
              {sessionStorage.getItem("LoggedIn") === "manager" ? (
                <Routes>
                  <Route path="/addnewtask" element={<AddTask />}></Route>
                  <Route path="/addmember" element={<AddMember />}></Route>
                  <Route path="/task" element={<TaskDetails />}></Route>
                  <Route path="/people" element={<PeoplePage />}></Route>
                  <Route path="/analytics" element={<Analytics />}></Route>
                  <Route path="/profileTask" element={<ProfileTask />}></Route>
                  <Route
                    path="/notification"
                    element={<Notification />}
                  ></Route>
                </Routes>
              ) : (
                ""
              )}

              {sessionStorage.getItem("LoggedIn") === "teammate" ? (
                <Routes>
                  <Route path="/task" element={<TeammateTaskDetails />}></Route>
                  <Route
                    path="/notification"
                    element={<Notification />}
                  ></Route>
                </Routes>
              ) : (
                ""
              )}

              <div className="bottomNavbar">
                <NavLink to={"/"} onClick={home} activeclassname="active" className="menuitems"><HomeOutlined /></NavLink>
                <NavLink to={"/"} onClick={nothome} activeclassname="active" className="menuitems"><HistoryOutlined /></NavLink>
                <NavLink to={"/notification"} activeclassname="active" className="menuitems"><BellOutlined /></NavLink>
                <NavLink to={"/profile"} activeclassname="active" className="menuitems"><UserOutlined /></NavLink>
              </div>
              

            </div>
          </div>
        ) : (
          <div>
            <Login />
            <Routes>
              <Route path="/" element={<LoginForm />} />
              <Route path="/signup" element={<SignupTest />} />
              <Route
                path="/signup-with-google"
                element={<SignupWithGoogle />}
              />
              <Route path="/successfullSignup" element={<SignupFinishTest />} />
              <Route path="/forgotpassword" element={<ForgotPassTest />} />
              <Route
                path="/RecoveryForm1_test"
                element={<RecoveryForm1Test />}
              />
              <Route path="/newPass" element={<RecoveryForm2Test />} />
              <Route path="/successfulFP" element={<RecoveryFormFinish />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
};

export default Routing;
