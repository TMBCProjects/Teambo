import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";
import "../AddNewMember/main.css";
import { Button, Form, Input, message, notification } from "antd";
import {
  addNotification,
  requestTeammate,
} from "../../../DataBase/Manager/manager";
import sendEmail from "../../../utils/Email";
import { Notifications } from "../../../utils/Notifications";

const formStyle = {
  width: "100%",
  color: "red",
};

export default function AddMember() {
  const [api, apicontextHolder] = notification.useNotification();
  const [email, setEmail] = useState("");
  const [user, setUser] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setUser(JSON.parse(sessionStorage.getItem("userData")));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (placement) => {
    if (email === "") {
      message.error("Please enter your email");
    } else {
      requestTeammate(
        user.id,
        user.data.managerName,
        user.data.companyId,
        user.data.companyName,
        user.data.managerEmail,
        email
      )
      api.open({
        message: "Great! ",
        description: `Teammate has been added.`,
        placement,
      });
      setTimeout(() => {
        navigate("/people");
      }, 1000);
    }
  };

  function sendRequestMail(managerName, companyName, email) {
    const output = `
      <h4> ${managerName} from ${companyName} requested you to join his team in Teambo</h4>
      <br />
      <p>Dear User,<br/><br/>
        As requested by ${managerName}, we have sent a request to your Teambo account to join his ${companyName} team.<br/><br/>
        Please go to Profile>Request to see your requests. Kindly accept/reject Mr. ${managerName}'s offer.<br/><br/>
        Best regards,<br/>
        Teambo team</p>`;
    const subject = "You have a Join-team request in Teambo";
    const sent = sendEmail(email, subject, output);
    return sent;
  }

  return (
    <div className="addnewmember">
      {apicontextHolder}
      <div className="addTaskHead">
        <Link to={"/people"}>
          <LeftOutlined className="icon" />
        </Link>
        <span className="Tasktitle">Add a new member here</span>
      </div>

      <div className="memeberform">
        <Form
          name="addMemberForm"
          form={form} // pass form instance to Form component
        >
          <Form.Item
            name="email"
            style={formStyle}
            rules={[
              {
                required: true,
                message: "Please enter the email",
              },
            ]}
          >
            <Input
              name="email"
              onChange={(e) => {
                handleChange(e);
              }}
              placeholder="Email"
              className="login-input"
            />
          </Form.Item>
        </Form>
      </div>
      <Button
        onClick={() => {
          handleSubmit("top");
        }}
        className="submitBtn"
        type="primary"
        htmlType="submit"
        style={{ marginTop: "5vh" }}
      >
        Add Member
      </Button>
    </div>
  );
}
