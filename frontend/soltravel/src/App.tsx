import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainPage from "../src/pages/MainPage";
import Login from "./pages/user/Login";
import SignUp from "./pages/user/SignUp";
import PersonalAccount from "./pages/account/PersonalAccount";
import GeneralAccount from "./pages/account/GeneralAccount";
import ForeignAccount from "./pages/account/ForeignAccount";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";



function App() {
  return (
    <div className="h-full">
      <BrowserRouter>
        <Header></Header>
        <Routes>
          <Route path="/" element={<MainPage />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signup" element={<SignUp />}></Route>
          <Route path="/personalaccount" element={<PersonalAccount />}></Route>
          <Route path="/generalaccount" element={<GeneralAccount />}></Route>
          <Route path="/foreignaccount" element={<ForeignAccount />}></Route>
        </Routes>
        <Footer></Footer>
      </BrowserRouter>
    </div>
  );
}

export default App;
