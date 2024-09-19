import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainPage from "../src/pages/MainPage";
import Login from "./pages/user/Login";
import SignUp from "./pages/user/SignUp";
import SignUpBasicInformation from "./pages/user/SignUpBasicInformation";
import SignUpAddress from "./pages/user/SignUpAddress";
import MyPage from "./pages/user/MyPage";
import UserUpdate from "./pages/user/UserUpdate";
import UserPhoneUpdate from "./pages/user/UserPhoneUpdate";
import UserAddressUpdate from "./pages/user/UserAddressUpdate";
import UserPasswordUpdate from "./pages/user/UserPasswordUpdate";
import MeetingAccountList from "./pages/account/MeetingAccountList";
import MeetingAccountDetail from "./pages/account/MeetingAccountDetail";
import JoinedMeetingAccountDetail from "./pages/account/JoinedMeetingAccountDetail";
import AccountHistory from "./pages/accountHistory/AccountHistory";
import ViewAccount from "./pages/viewaccount/Account";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import AccountCreate from "./pages/account/AccountCreate";
import ExchangeRate from "./pages/exchange/ExchangeRate";
import Exchange from "./pages/exchange/Exchange";
import SelectAccount from "./pages/exchange/SelectAccount";
import Settlement from "./pages/settle/Settlement";
import Detail from "./pages/viewaccount/Detail";
import GroupAccountPage from "./pages/viewaccount/ViewAccount";
import AccountCreateComplete from "./pages/account/AccountCreateComplete";
import GeneralMeetingAccountCreate from "./pages/account/GeneralMeetingAccountCreate";
import MeetingAccountCreatePrepare from "./pages/account/MeetingAccountCreatePrepare";
import ForeignMeetingAccountCreate from "./pages/account/ForeignMeetingAccountCreate";
import MeetingAccountCreateComplete from "./pages/account/MeetingAccountCreateComplete";
import AccountBookDetail from "./pages/accountBook/AccountBookDetail";
import Transaction from "./pages/transaction/Transaction";
import PrivateRoute from "./pages/user/PrivateRoute";
import { Sign } from "crypto";
import SelectSettlementAmount from "./pages/settlement/SelectSettlementAmount";

function App() {
  return (
    <div className="h-full">
      <BrowserRouter>
        <Routes>
          <Route
            path="/*"
            element={
              <>
                {/* 페이지에 Header와 Footer가 모두 포함된 경로 */}
                <Header />
                <div style={{ paddingBottom: "64px", backgroundColor: "#F3F4F6", minHeight: "100vh" }}>
                  <Routes>
                    <Route element={<PrivateRoute />}>
                      {/* 메인페이지 */}
                      <Route path="/" element={<MainPage />} />

                      {/* 모임통장 목록 */}
                      <Route path="/meetingaccountlist" element={<MeetingAccountList />} />

                      {/* 가계부 */}
                      <Route path="/accountbookdetail" element={<AccountBookDetail />} />

                      {/* 환율 */}
                      <Route path="/exchangerate" element={<ExchangeRate />} />
                      {/* Add other protected routes here */}
                    </Route>
                  </Routes>
                </div>
                <Footer />
              </>
            }
          />

          {/* 회원 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup/basicinformation" element={<SignUpBasicInformation />} />
          <Route path="/signup/address" element={<SignUpAddress />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/userupdate" element={<UserUpdate />} />
          <Route path="/userupdate/phone" element={<UserPhoneUpdate />} />
          <Route path="/userupdate/address" element={<UserAddressUpdate />} />
          <Route path="/userupdate/password" element={<UserPasswordUpdate />} />

          {/* 모임통장 생성 */}
          <Route path="/accountcreate" element={<AccountCreate />} />
          <Route path="/meetingaccountcreateprepare" element={<MeetingAccountCreatePrepare />} />
          <Route path="/generalmeetingaccountcreate" element={<GeneralMeetingAccountCreate />} />
          <Route path="/foreignmeetingaccountcreate" element={<ForeignMeetingAccountCreate />} />
          <Route path="/accountcreatecomplete" element={<AccountCreateComplete />} />
          <Route path="/meetingaccountcreatecomplete" element={<MeetingAccountCreateComplete />} />

          {/* 모임통장 상세 */}
          <Route path="/account/:userId" element={<GroupAccountPage />} />
          <Route path="/meetingaccount/:id" element={<MeetingAccountDetail />} />
          <Route path="/joinedmeetingaccount/:id" element={<JoinedMeetingAccountDetail />} />
          <Route path="/account" element={<ViewAccount />} />
          <Route path="/accounthistory/:accountNo" element={<AccountHistory />} />

          {/* 환전 */}
          <Route path="/exchange" element={<Exchange />}></Route>
          <Route path="/selectaccount/:userId" element={<SelectAccount />}></Route>
          <Route path="/detail" element={<Detail />}></Route>
          <Route path="/transaction" element={<Transaction />}></Route>

          {/* 정산 */}
          <Route path="/selectsettlementamount" element={<SelectSettlementAmount />}></Route>
          <Route path="/settlement" element={<Settlement />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
