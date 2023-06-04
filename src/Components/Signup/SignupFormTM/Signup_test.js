import React, { useState, useRef, useEffect } from "react";
import { Layout, Space, Select } from "antd";
import { Button, Form, Input, Divider, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "../SignupFormTM/main.css";
import { NavLink } from "react-router-dom";
import Loader from "../../LoadingModal";
import {
  registerLogin,
  writeDesignation,
  readCompanies,
  writeCompany,
} from "../../../DataBase/SignUp/signUp";

const formStyle = {
  width: "100%",
  color: "red",
};

const onFinish = (values) => { };
const onFinishFailed = (errorInfo) => {
  message.error("Failed:", errorInfo);
};

export default function Signup_test() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const error = (err) => {
    messageApi.open({
      type: "error",
      content: "Login failed " + err,
    });
  };
  const [companies, setCompanies] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [user, setUser] = useState({
    name: "",
    companyName: "",
    companyId: "",
    designation: "",
    typeofEmployment: "",
    whatsappNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [companyName, setCompanyName] = useState("");
  const [designationName, setDesignationName] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await readCompanies();
        setCompanies(data);
      } catch (err) {
        message.error(err);
      }
    }
    fetchData();
    return () => {
      // error('Error fetching data:')
    };
  }, []);

  const handleChange = (event) => {
    let newInput = { [event.target.name]: event.target.value };
    setUser({ ...user, ...newInput });
  };

  const inputRef = useRef(null);
  const ipRef = useRef(null);

  const onCompanyNameChange = (event) => {
    setCompanyName(event.target.value);
  };
  const onDesignationNameChange = (event) => {
    setDesignationName(event.target.value);
  };
  const onCompanyChange = (event) => {
    user.companyName = event;
    if (user.companyName !== "") {
      user.companyId = companies
        .filter((info) => {
          return info.companyName === user.companyName;
        })
        .map((info) => {
          return info.id;
        })[0];
      if (
        companies
          .filter((info) => {
            return info.companyName === user.companyName;
          })
          .map((info) => {
            return info.designations;
          })[0] !== undefined
      ) {
        companies
          .filter((info) => {
            return info.companyName === user.companyName;
          })
          .map((info) => {
            return setDesignations(info.designations);
          });
      } else {
        setDesignations([]);
      }
    }
  };
  const onDesignationChange = (event) => {
    user.designation = event;
  };
  const onEmploymentTypeChange = (event) => {
    user.typeofEmployment = event;
  }

  const addCompany = async (e) => {
    e.preventDefault();
    if (companyName !== "") {
      const id = await writeCompany(companyName);
      await setCompanies([...companies, { id: id, companyName: companyName }]);
      setCompanyName("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const addDesignation = (e) => {
    e.preventDefault();
    if (designationName !== "") {
      setDesignations([...designations, designationName]);
      const clonedList = [...companies];
      const index = clonedList.findIndex((obj) => obj.id === user.companyId);
      if (clonedList[index].designations === undefined) {
        clonedList[index] = {
          ...clonedList[index],
          designations: [designationName],
        };
      } else {
        clonedList[index] = {
          ...clonedList[index],
          designations: [clonedList[index].designations].push(designationName),
        };
      }
      setCompanies(clonedList);
      writeDesignation(user.companyId, designationName);
      setDesignationName("");
      setTimeout(() => {
        ipRef.current?.focus();
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      user.name === "" ||
      user.companyName === "" ||
      user.designation === "" ||
      user.whatsappNumber === ""
    ) {
      error("Please fill all the fields");
    } else if (user.password.length < 6) {
      error("Password should be atleast 6 characters!!!");
    } else {
      if (user.password === user.confirmPassword) {
        setLoading(true);
        sessionStorage.setItem("currentUser", JSON.stringify(user.name));
        registerLogin(user).then(() => {
          window.location.href = "/successfullSignup";
        });
      } else {
        setLoading(false);
        error("Passwords does not match!!");
      }
    }
    console.log(user)
  };

  return (
    <div className="signup">
      {contextHolder}
      <Space
        direction="vertical"
        style={{
          width: "100%",
        }}
        size={[0, 48]}>
        <Layout>
          <div className="loginForm signupForm">
            <Form
              className="form signup-form"
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
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off">
              <div className="loginHead">
                <span
                  className="signupHeading"
                  style={{ color: "#0F1736", fontWeight: "bold" }}>
                  Sign up a new Teambo account!
                </span>
              </div>
              <Divider
                style={{
                  backgroundColor: "rgb(235 235 235)",
                  marginTop: "5px",
                }}
              />

              <Form.Item
                name="name"
                style={formStyle}
                rules={[
                  {
                    required: true,
                    message: "Please enter your name!",
                  },
                ]}>
                <Input
                  placeholder="Name"
                  name="name"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  className="login-input"
                />
              </Form.Item>

              <Form.Item
                name="email"
                style={formStyle}
                rules={[
                  {
                    required: true,
                    message: "Please enter your email!",
                  },
                ]}>
                <Input
                  placeholder="Email"
                  name="email"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  className="login-input"
                />
              </Form.Item>

              <Select
                style={{ width: "100%", marginBottom: "3vh" }}
                placeholder="Select Company"
                onChange={(e) => {
                  onCompanyChange(e);
                }}
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
                        placeholder="Add new company"
                        ref={inputRef}
                        value={companyName}
                        onChange={(e) => {
                          onCompanyNameChange(e);
                        }}
                      />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={addCompany}>
                        Add
                      </Button>
                    </Space>
                  </>
                )}
                options={companies
                  .filter((item) => {
                    return item.companyName.includes(companyName);
                  })
                  .map((item) => ({
                    label: item.companyName,
                    value: item.companyName,
                  }))}
              />

              <Select
                placeholder="Select Designation"
                disabled={user.companyId === "" ? true : false}
                style={{ width: "100%", marginBottom: "3vh" }}
                onChange={(e) => {
                  onDesignationChange(e);
                }}
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
                        placeholder="Add new designation"
                        ref={ipRef}
                        value={designationName}
                        onChange={(e) => {
                          onDesignationNameChange(e);
                        }}
                      />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={addDesignation}>
                        Add
                      </Button>
                    </Space>
                  </>
                )}
                options={designations
                  .filter((item) => {
                    return item.includes(designationName);
                  })
                  .map((item) => ({
                    label: item,
                    value: item,
                  }))}
              />
              <Select
                defaultValue="Type of Employment"
                style={{ width: "100%", marginBottom: "3vh" }}
                onChange={(e) => {
                  onEmploymentTypeChange(e)
                }}
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
              />
              <Form.Item
                name="whatsappNumber"
                rules={[
                  {
                    required: true,
                    message: "Please enter your new password!",
                  },
                ]}>
                <Input
                  placeholder="Whatsapp Number"
                  name="whatsappNumber"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  className="login-input"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please enter your new password!",
                  },
                ]}>
                <Input.Password
                  placeholder="Password"
                  name="password"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  className="login-input"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                style={formStyle}
                rules={[
                  {
                    required: true,
                    message: "Please re-enter your new password!",
                  },
                ]}>
                <Input.Password
                  placeholder="Re-enter Password"
                  name="confirmPassword"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  className="login-input"
                />
              </Form.Item>

              <div>
                <Button
                  className="submitBtn"
                  onClick={(e) => {
                    handleSubmit(e);
                  }}
                  type="primary"
                  htmlType="submit"
                  style={{ width: "100%" }}>
                  Signup
                </Button>
                <p className="footerText"></p>
              </div>
              <div className="footer">
                <span>
                  Already have an account? <NavLink to="/">Login</NavLink>
                </span>
              </div>
            </Form>
          </div>
        </Layout>
        <Loader
          loading={loading}
          text="Creating account"
        />
      </Space>
    </div>
  );
}
