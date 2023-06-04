import React, { useState, useRef, useEffect } from "react";
import { Button, Form, Input } from "antd";
import "../RecoveryForms/main.css";

const formStyle = {
  width: "100%",
  color: "red",
};

export default function RecoveryForm1_test() {
  const Ref = useRef(null);

  const [timer, setTimer] = useState("00:00");
  const [resend, setResend] = useState(false);
  const [otp, setOtp] = useState("");

  const getTimeRemaining = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    return {
      total,
      minutes,
      seconds,
    };
  };

  const getDeadTime = () => {
    let deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 10);
    return deadline;
  };
  useEffect(() => {
    const startTimer = (e) => {
      let { total, minutes, seconds } = getTimeRemaining(e);
      if (total >= 0) {
        setTimer(
          (minutes > 9 ? minutes : "0" + minutes) +
            ":" +
            (seconds > 9 ? seconds : "0" + seconds) +
            "s"
        );
      }
    };
    const clearTimer = (e) => {
      setTimer("00:10s");
      if (Ref.current) clearInterval(Ref.current);
      const id = setInterval(() => {
        startTimer(e);
      }, 1000);
      Ref.current = id;
    };
    clearTimer(getDeadTime());
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setResend(true);
    }, 10000);
  }, []);

  const handleChange = (event) => {
    setOtp(event.target.value);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    // const isOTPValid = verifyOTP(otp);
    if (otp) {
      window.location.href = "/newPass";
    } else {
      console.error("OTP is wrong");
    }
  };
  return (
    <div className="forgot-pass-container">
      <div className="header1">
        <span style={{ fontWeight: "bold", fontSize: "24px" }}>
          Recovery Code{" "}
        </span>
        <br />
        <span
          className="code"
          style={{ color: "#B9B9B9", display: "block", marginTop: " 5px" }}
        >
          Enter 4 digit code sent to your mail id
        </span>
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
          name="otp"
          style={formStyle}
          rules={[
            {
              required: true,
              message: "Please enter OTP!",
            },
          ]}
        >
          <Input.Password
            onChange={(e) => {
              handleChange(e);
            }}
            placeholder="OTP"
            className="login-input"
          />
          {resend ? (
            <span className="timer">
              Didn't receive any code? <a href="/forgotpassword">send again</a>
            </span>
          ) : (
            <span className="timer1">{timer}</span>
          )}
        </Form.Item>
      </Form>
      <div className="body margin-top0 resetLinkBtn">
        <Button
          onClick={(e) => {
            handleSubmit(e);
          }}
          className="submitbtn2"
          type="primary"
          htmlType="submit"
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
