import React, { useState } from "react";
import {
  Layout,
  Space,
  Button,
  Form,
  Input,
  Divider,
  message,
  notification,
} from "antd";

import "../LoginForm/main.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { NavLink, useNavigate } from "react-router-dom";
import registerLogin, {
  readManagers,
  readTeammate,
} from "../../../DataBase/Login/login";
import Loader from "../../LoadingModal";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../firebase-config";
import { checkUser } from "../../../DataBase/SignUp/signUp";
const formStyle = {
  width: "100%",
  color: "red",
};

export default function LoginForm() {
  const [messageApi, contextHolder] = message.useMessage();
  const [api, apicontextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const success = () => {
    messageApi.open({
      type: "success",
      content: "Login successful",
    });
  };
  const error = (err) => {
    messageApi.open({
      type: "error",
      content: "Login failed. Invalid email or password.",
    });
  };

  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const handleChangeLog = (event) => {
    let newInput1 = { [event.target.name]: event.target.value };
    setValues({ ...values, ...newInput1 });
  };

  const navigate = useNavigate();

  const onFinish = async () => {
    try {
      setLoading(true);
      let user = await registerLogin(values.email, values.password);
      if (user.photoURL === "Manager") {
        sessionStorage.setItem("LoggedIn", "manager");
        const myObj = await readManagers(user.uid);
        const objStr = JSON.stringify(myObj);
        sessionStorage.setItem("userData", objStr);
        success();
        setTimeout(() => {
          window.location.reload();
        }, 1000);

        navigate("/");
      } else if (user.photoURL === "Teammate") {
        sessionStorage.setItem("LoggedIn", "teammate");
        const myObj = await readTeammate(user.uid);
        const objStr = JSON.stringify(myObj);
        sessionStorage.setItem("userData", objStr);
        success();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        navigate("/");
      }
    } catch (err) {
      setLoading(false);
      error(err.message);
    }
  };
  const handleLoginWithGoogle = () => {
    try {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider).then(async (data) => {
        const user = await checkUser(data.user.email);
        if (user) {
          setLoading(true);
          if (user.photoURL === "Manager") {
            sessionStorage.setItem("LoggedIn", "manager");
            const myObj = await readManagers(user.uid);
            const objStr = JSON.stringify(myObj);
            sessionStorage.setItem("userData", objStr);
            success();
            setTimeout(() => {
              window.location.reload();
            }, 1000);

            navigate("/");
          } else if (user.photoURL === "Teammate") {
            sessionStorage.setItem("LoggedIn", "teammate");
            const myObj = await readTeammate(user.uid);
            const objStr = JSON.stringify(myObj);
            sessionStorage.setItem("userData", objStr);
            success();
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            navigate("/");
          }
        } else {
          navigate("/signup-with-google", {
            state: {
              email: data.user.email,
              id: data.user.uid,
              photoURL: data.user.photoURL,
              name: data.user.displayName,
            },
          });
        }
      });
    } catch (error) {
      setLoading(false);
      message.error(error);
    }
  };

  return (
    <Space
      direction="vertical"
      style={{
        width: "100%",
      }}
      size={[0, 48]}
    >
      {contextHolder}
      {apicontextHolder}
      <Layout>
        <div className="loginForm">
          <Form
            className="form"
            name="basic"
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 24.24,
            }}
            style={{
              maxWidth: 600,
            }}
            initialValues={{
              remember: true,
            }}
            autoComplete="off"
          >
            <div className="loginHead">
              <p>Sign in</p>
              <NavLink className="su" to="/signup">
                Signup
              </NavLink>
            </div>
            <Divider
              style={{ backgroundColor: "rgb(235 235 235)", marginTop: "0" }}
            />

            <Form.Item
              name="email"
              style={formStyle}
              rules={[
                {
                  required: true,
                  message: "Please enter your email!",
                },
              ]}
            >
              <Input
                name="email"
                onChange={(e) => {
                  handleChangeLog(e);
                }}
                placeholder="Email"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter your password!",
                },
              ]}
            >
              <Input.Password
                name="password"
                onChange={(e) => {
                  handleChangeLog(e);
                }}
                placeholder="Password"
                className="login-input"
              />
            </Form.Item>

            <div className="formFooter">
              <Form.Item name="remember" className="forgotText">
                <NavLink
                  to="/forgotpassword"
                  style={{ color: "#26809A" }}
                  className="forgot-password"
                >
                  Forgot your Password?
                </NavLink>
              </Form.Item>
              <Button
                className="submitBtn"
                type="primary"
                style={{ width: "100%" }}
                onClick={() => {
                  onFinish();
                }}
                htmlType="submit"
              >
                Log in
              </Button>

              <p className="footerText">or</p>
              <Button className="googleBtn" onClick={handleLoginWithGoogle}>
                <FontAwesomeIcon
                  className="fa"
                  icon={faGoogle}
                  style={{ marginRight: "1vh" }}
                />
                Continue with google
              </Button>
            </div>
          </Form>
          <div className="bottomBackground"></div>
        </div>
      </Layout>
      <Loader loading={loading} text="Logging in..." />
    </Space>
  );
}
