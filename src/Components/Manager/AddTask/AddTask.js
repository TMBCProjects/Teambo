import React, { useRef, useEffect, useState } from "react";
import { LeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { notification } from "antd";
import "../AddTask/main.css";
import {
  Button,
  Form,
  Input,
  Select,
  Checkbox,
  Divider,
  Space,
  DatePicker,
  TimePicker,
  message,
} from "antd";
import dayjs from "dayjs";
import { uid } from "uid";
import Loader from ".././../LoadingModal";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  addNewClient,
  addNewType,
  readClientsByMangerId,
  readTeammatesByMangerId,
  readTypesByMangerId,
} from "../../../DataBase/Manager/manager";
import { addNewTask, addDescription, readTeammateWhatsapp } from "../../../DataBase/Manager/manager";
import axios from "axios";
import moment from "moment/moment";
import sendEmail from "../../../utils/Email";
import { readTeammate } from "../../../DataBase/Login/login";

dayjs.extend(customParseFormat);

const formStyle = {
  width: "100%",
  color: "red",
};

export const timeFormat = (date) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]
    } ${date.getFullYear()} ${date.toTimeString()}`;
};

export default function AddTask() {
  const [messageApi, contextHolder] = message.useMessage();
  const [api, apicontextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const success = (msg) => {
    messageApi.open({
      type: "success",
      content: msg,
    });
  };

  const error = (err) => {
    messageApi.open({
      type: "error",
      content: err,
    });
  };
  const date = new Date();
  const [taskAddMode, setTaskAddMode] = useState(false);
  const [teammateEmail, setTeammateEmail] = useState('');
  const [newTask, setNewTask] = useState({
    assigned: date,
    companyName: "",
    companyId: "",
    clientId: "",
    clientName: "",
    clientEmail: "",
    corrections: 0,
    createdAt: date,
    profileImage: "",
    createdBy: "",
    createdByEmail: "",
    deadline: "",
    isLive: true,
    managerId: "",
    managerName: "",
    status: "ASSIGNED",
    taskId: `t-${uid()}`,
    teammateId: "",
    teammateName: "",
    teammateEmail: "",
    type: "",
    estimatedTime: "",
    highPriority: false,
    title: "",
  });
  const [communication, setCommunication] = useState({
    createdAt: date,
    createdBy: "",
    createdByEmail: "",
    isVisible: true,
    managerId: "",
    teammateId: "",
    corrections: 0,
    teammateName: "",
    description: "",
    type: "DESCRIPTION_ADDED",
  });

  // const [managerInfo, setManagerInfo] = useState();
  const [client, setClient] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [clients, setClients] = useState([]);
  const [type, setType] = useState(null);
  const [types, setTypes] = useState([]);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(sessionStorage.getItem("currentUser"))
  );
  const ipRef2 = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id, data } = JSON.parse(sessionStorage.getItem("userData"));
        const [teammates, clients, types] = await Promise.all([
          readTeammatesByMangerId(id),
          readClientsByMangerId(id),
          readTypesByMangerId(id),
        ]);

        sessionStorage.setItem("teammates", JSON.stringify(teammates));
        setTeammates(teammates);

        sessionStorage.setItem("clients", JSON.stringify(clients));
        setClients(clients);

        sessionStorage.setItem("types", JSON.stringify(types));
        setTypes(types);

        setNewTask((prevState) => ({
          ...prevState,
          managerId: id,
          createdBy: id,
          createdByEmail: data.managerEmail,
          managerName: data.managerName,
          companyName: data.companyName,
          companyId: data.companyId,
        }));

        setCommunication((prevState) => ({
          ...prevState,
          managerId: id,
          createdBy: id,
          createdByEmail: data.managerEmail,
        }));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleTeammateChange = (value) => {
    const valueArr = value.split(",");
    setNewTask({
      ...newTask,
      teammateId: valueArr[0],
      teammateName: valueArr[1],
      teammateEmail: valueArr[3],
      profileImage: valueArr[2],
    });
    setCommunication({
      ...communication,
      teammateId: valueArr[0],
      teammateName: valueArr[1],
    });
    setTeammateEmail(valueArr[3]);
  };
  const handleClientChange = (value) => {
    const valueArr = value.split(",");
    setNewTask({ ...newTask, clientId: valueArr[0], clientName: valueArr[1] });
  };
  const handleTypeChange = (value) => {
    const valueArr = value.split(",");
    setNewTask({ ...newTask, type: valueArr[1] });
  };

  async function sendAddTaskEmail(email, taskTitle) {
    try {
      const subject = "Task Assignment";

      const output = `
      <h4> ${currentUser} assigned a new task to you</h4>
      <h3> ${taskTitle}</h3>
      <a href="https://teambo.app">Go to Teambo</a>
      <br/>
      <p><br/><br/>
        Best regards,<br/>
        Teambo team</p>`;
      const res = await sendEmail(email, subject, output);
      if (res) {
        return true;
      }
    } catch (err) {
      console.log("Email sent failed");
      return false;
    }
  }

  const handleTaskSubmit = async (placement) => {
    if (
      newTask.title === "" ||
      newTask.deadline === "" ||
      teammateEmail === ""
    ) {
      error("Please fill up all fields.");
    } else {
      try {
        setTaskAddMode(true);
        setLoading(true);
        const task = await addNewTask(newTask);
        if (task) {
          await addDescription(communication, task.id);
          setTaskAddMode(false);
          success("Task created successfully");
          const isSent = await sendAddTaskEmail(teammateEmail, newTask.title);
          sessionStorage.removeItem("tasks");
          api.open({
            message: "Great! ",
            description: `Task has been assigned.`,
            placement,
          });
          navigate("/");
        }
      } catch (err) {
        setLoading(false);
        setTaskAddMode(false);
        error("Task creation failed");
      }
    }
    const myObj = await readTeammateWhatsapp(newTask.teammateId);
    const objStr = JSON.stringify(myObj);
    await axios({
      url: "http://localhost:5000/notify",
      method: "POST",
      data: {
        phn: objStr,
        msg: "u were assigned a new task",
      },
    });
  };

  const addClient = async () => {
    try {
      const date = new Date();
      const { id, data } = JSON.parse(sessionStorage.getItem("userData"));

      const newClient = {
        clientName: client,
        companyId: data.companyId,
        companyName: data.companyName,
        createdAt: date,
        createdBy: id,
        isActive: true,
        managerId: id,
        managerName: data.managerName,
      };

      const clientCreated = await addNewClient(newClient);
      const newClientCreated = {
        id: clientCreated.id,
        data: newClient,
      };
      setClients([...clients, newClientCreated]);
      setClient("");
    } catch (err) {
      alert("Client creation failed");
    }
  };

  const addType = async () => {
    try {
      const date = new Date();
      const { id, data } = JSON.parse(sessionStorage.getItem("userData"));
      const newType = {
        type: type,
        companyId: data.companyId,
        companyName: data.companyName,
        createdAt: date,
        createdBy: id,
        isActive: true,
        managerId: id,
        managerName: data.managerName,
      };
      const typeCreated = await addNewType(newType);
      const newTypeCreated = {
        id: typeCreated.id,
        data: newType,
      };
      setTypes([...types, newTypeCreated]);
      setType("");
    } catch (err) {
      alert("Client crfeation failed");
    }
  };

  return (
    <div className="addtask">
      {contextHolder}
      {apicontextHolder}
      {
        <div className="addTaskHead">
          <Link to={"/"}>
            <LeftOutlined className="icon" />
          </Link>

          <span className="Tasktitle">Add a new task here</span>
        </div>
      }

      <div className="Taskform">
        <Form.Item
          name="task title"
          style={formStyle}
          rules={[
            {
              required: true,
              message: "Please enter the task title",
            },
          ]}>
          <Input
            placeholder="Task Title"
            className="login-input"
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
        </Form.Item>

        <Form.Item
          name="description"
          style={formStyle}
          rules={[
            {
              required: true,
              message: "Please enter the description",
            },
          ]}>
          <Input
            placeholder="Description"
            className="login-input"
            onChange={(e) =>
              setCommunication({
                ...communication,
                description: e.target.value,
              })
            }
          />
        </Form.Item>

        <Select
          className="select"
          placeholder="Teammate"
          onChange={handleTeammateChange}
          options={teammates.map((teammate) => {
            return {
              value: `${teammate?.id},${teammate?.data?.teammateName},${teammate?.data?.profileImage},${teammate?.data?.teammateEmail}`,
              label: teammate.data.teammateName,
            };
          })}
        />

        {/* <Select
          className="select"
          placeholder="Status"
          onChange={(value) => setNewTask({ ...newTask, status: value })}
          options={[
            {
              value: "ASSIGNED",
              label: "ASSIGNED",
            },
            {
              value: "ON_GOING",
              label: "ON GOING",
            },
            {
              value: "PAUSED",
              label: "PAUSED",
            },
            {
              value: "DONE",
              label: "DONE",
            },
          ]}
        /> */}
        <Select
          className="select"
          placeholder="Client"
          options={clients
            ?.filter((client) => client.data.clientName)
            ?.map((client) => {
              return {
                value: `${client.id},${client.data.clientName}`,
                label: client.data.clientName,
              };
            })}
          onChange={handleClientChange}
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider
                style={{
                  margin: "8px 0",
                }}
              />
              <Space
                style={{
                  padding: "0 8px 4px",
                }}>
                <Input
                  placeholder="Add new client"
                  ref={ipRef2}
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                />
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={addClient}>
                  Add
                </Button>
              </Space>
            </>
          )}
        />

        <Select
          className="select"
          placeholder="Type"
          options={types.map((type) => {
            return {
              value: `${type.id},${type.data.type}`,
              label: type.data.type,
            };
          })}
          onChange={handleTypeChange}
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider
                style={{
                  margin: "8px 0",
                }}
              />
              <Space
                style={{
                  padding: "0 8px 4px",
                }}>
                <Input
                  placeholder="Add new client"
                  ref={ipRef2}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                />
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={addType}>
                  Add
                </Button>
              </Space>
            </>
          )}
        />

        <DatePicker
          className="select"
          style={{ borderRadius: "7px" }}
          placeholder="Due"
          disabledDate={(current) =>
            current && current < moment().startOf("day")
          }
          onChange={(value) =>
            setNewTask({
              ...newTask,
              deadline: `${value.date()}/${value.month() + 1}/${value.year()}`,
            })
          }
        />
        <TimePicker
          minuteStep={15}
          use12Hours
          format="h:mm"
          className="select time"
          placeholder="Estimated Time"
          style={{ borderRadius: "7px" }}
          onChange={(value) =>
            setNewTask({
              ...newTask,
              estimatedTime: `${value.hour()}:${value.minute()}`,
            })
          }
        />

        <Form.Item
          className="clientemail"
          name="client email"
          style={formStyle}
          rules={[
            {
              required: true,
              message: "Please enter the client email",
            },
          ]}>
          <Input
            placeholder="Client email"
            className="login-input"
            onChange={(e) =>
              setNewTask({ ...newTask, clientEmail: e.target.value })
            }
          />
        </Form.Item>

        <Checkbox
          style={{ marginTop: "2vh" }}
          onChange={(e) =>
            setNewTask({ ...newTask, highPriority: e.target.checked })
          }>
          High Priority
        </Checkbox>

        <Button
          className="submitBtn"
          type="primary"
          htmlType="submit"
          style={{ marginTop: "5vh" }}
          onClick={() => handleTaskSubmit("top")}>
          {taskAddMode ? <div className="dots"></div> : "Assign"}
        </Button>
      </div>
      <Loader
        loading={loading}
        text="Creating task"
      />
    </div>
  );
}
