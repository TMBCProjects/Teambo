import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import "../FpForm/main.css";
// import { Link } from "react-router-dom";
import { resetPassword } from "../../../utils/FirebaseUtils";

const formStyle = {
  width: "100%",
  color: "red",
};
export default function ForgotPass_test() {
  const [messageApi, contextHolder] = message.useMessage();

  const success = () => {
    messageApi.open({
      type: "success",
      content: "OTP Sent",
    });
  };
  const error = (err) => {
    messageApi.open({
      type: "error",
      content: err,
    });
  };

  const [userLog, setUserLog] = useState({
    email: "",
  });
  const handleChangeLog = (event) => {
    let newInput1 = { [event.target.name]: event.target.value };
    setUserLog({ ...userLog, ...newInput1 });
  };

  const registerLogin = () => {
    const sent = resetPassword(userLog.email);
    if (sent) {
      window.location.href = "/";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      if (userLog.email === "") {
        error("Please enter email");
      } else {
        success();
        setTimeout(() => {
          registerLogin();
        }, 1000);
      }
    } catch (err) {
      error("Failed " + err);
    }
  };
  return (
    <div className="forgot-pass-container">
      {contextHolder}
      <div className="header1">
        <span style={{ fontWeight: "bold" }}>Forgot Password? </span>
        <br />
        <span style={{ color: "#B9B9B9", display: "block", marginTop: "5px" }}>
          Enter the email id associated with your Teambo account
        </span>
      </div>
      <Form
        className="form1"
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 24.24,
        }}
        style={{
          maxWidth: 470,
        }}
        initialValues={{
          remember: true,
        }}
        autoComplete="off"
      >
        <Form.Item
          name="email"
          onChange={(e) => {
            handleChangeLog(e);
          }}
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
            type="email"
            placeholder="Email"
            className="login-input"
          />
        </Form.Item>
      </Form>
      <Button
        className="submitBtn1 fpBtn"
        onClick={(e) => handleSubmit(e)}
        htmlType="submit"
      >
        Send OTP
      </Button>
    </div>
  );
}
