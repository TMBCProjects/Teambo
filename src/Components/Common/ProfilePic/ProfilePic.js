import { Avatar } from "antd";
import React from "react";

export default function ProfilePic(props) {
  return (
    <div className="DefaultprofilePicture">
      <Avatar
        shape="circle"
        size={60}
        style={{ backgroundColor: "#fcad00" }}>
        <span style={{ fontSize: 30 }}>
          {String(props.initial).slice(0, 1).toUpperCase()}
        </span>
      </Avatar>
    </div>
  );
}
