import { Avatar } from "antd";
import React from "react";
import { useLocation } from "react-router-dom";
import ProfilePic from "../Common/ProfilePic/ProfilePic";
import "./main.css";
import Card from "../WorkInProgress/Card/index";
const ProfileTask = () => {
  const { state } = useLocation();
  const { tasks, data } = state;
  return (
    <div className="WIPmanager">
      <div className="profiletask-header">
        <div className="profile">
          {data.profileImage ? (
            <Avatar size={60} src={data?.profileImage} />
          ) : (
            <ProfilePic initial={data.teammateName} />
          )}
          <div className="profileDetails">
            <span style={{ color: "#000" }}>{data.teammateName}</span> <br />
            <p style={{ fontSize: "1rem", color: "GrayText" }}>
              {data.designation}
            </p>
          </div>
        </div>
      </div>
      <div className="profiletask-tasks">
        <p>Tasks</p>
        <hr />
        <div className="WIPCards">
          {tasks.map((info, count) => {
            return (
              <div key={count}>
                <Card index={count} task={info} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileTask;
