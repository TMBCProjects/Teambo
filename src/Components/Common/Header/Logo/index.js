import React from "react";
import "./main.css";
import { Link } from "react-router-dom";

const index = () => {
  return (
    <div className="logo">
      <div className="logo-icon">
        <div className="logo-icon-row1">
          <div></div>
          <div></div>
        </div>
        <div className="logo-icon-row1 logo-icon-row2">
          <div></div>
        </div>
      </div>
      <div className="logo-text">
        <Link to="/">Teambo</Link>
      </div>
    </div>
  );
};

export default index;
