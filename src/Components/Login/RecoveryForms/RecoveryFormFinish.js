import React from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";

export default function RecoveryFormFinish() {
  return (
    <div className="header2">
      <span className="passwordResetSuccess">Password Reset successfull</span>
      <br />
      <Link to={"/"}>
        <Button className="continue-button" style={{ marginTop: "3vh" }}>
          Log in
        </Button>
      </Link>
    </div>
  );
}
