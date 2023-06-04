import React from "react";
import "./main.css";
import BlurShapesTest from "../../Components/Common/Blur_Shapes/Blur_Shapes_test";
import Header from "../../Components/Common/Header";


const login_test = () => {
  return (
    <>
    <Header />
    <div className="login-container">
        <BlurShapesTest />
      </div>
    </>
  );
};

export default login_test;
