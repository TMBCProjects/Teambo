import React from "react";
import { Modal } from "antd";
import './main.css'
const Index = ({ loading, text }) => {
  return (
    <Modal
      centered
      width={500}
      open={loading}
      closable={false}
      footer={null}>
      <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <div className="colorful"></div>
      <p
      style={{
        fontSize: "1.2rem",
        marginLeft: "1.5rem",
        fontWeight: "600",
        display:"flex"
      }}>
      
        {text}
        </p>
      </div>
    </Modal>
  );
};

export default Index;
