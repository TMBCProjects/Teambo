import React, { useState } from "react";
import { Button, Form, Input } from "antd";
import "../RecoveryForms/main.css";

const formStyle = {
  width: "100%",
  color: "red",
};

export default function RecoveryForm2_test() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const handleChange = (event) => {
    setPassword(event.target.value);
  };
  const handleChange2 = (event) => {
    setPassword2(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password === password2) {
      //   const changed = changePassword(password);
      //   if (changed) {
      //     window.location.href = "/successfulFP";
    } else {
      console.error("Password does not match");
    }
    // }
  };
  return (
    <div className="forgot-pass-container">
      <div className="enter-new-pass">
        <span style={{ fontWeight: "bold", fontSize: "18px" }}>
          Enter New Password
        </span>
        <br />
      </div>
      <Form
        className="form1"
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 17,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        autoComplete="off"
      >
        <Form.Item
          name="newPass"
          style={formStyle}
          rules={[
            {
              required: true,
              message: "Please enter a new password!",
            },
          ]}
        >
          <Input.Password
            onChange={(e) => {
              handleChange(e);
            }}
            placeholder="New Password"
            className="login-input"
          />
        </Form.Item>

        <Form.Item
          name="re-newPass"
          style={formStyle}
          rules={[
            {
              required: true,
              message: "Please re-enter the new password!",
            },
          ]}
        >
          <Input.Password
            onChange={(e) => {
              handleChange2(e);
            }}
            placeholder="Re-enter New Password"
            className="login-input"
          />
        </Form.Item>
      </Form>
      <div className="body margin-top0">
        <Button
          onClick={(e) => {
            handleSubmit(e);
          }}
          className="submitBtn1 resetPassBtn"
          type="primary"
          htmlType="submit"
          style={{ marginTop: "5vh" }}
        >
          Change Password
        </Button>
      </div>
    </div>
  );
}
