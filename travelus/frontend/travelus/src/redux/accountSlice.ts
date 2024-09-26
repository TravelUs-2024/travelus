import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AccountInfo, AccountInfoNew, MeetingAccountInfo, GeneralMeetingAccountDetail } from "../types/account";

export interface AccountState {
  isKeyboard: boolean;
  accountPassword: string;
  accountList: Array<AccountInfo>;
  foreignAccountList: Array<AccountInfo>;
  joinedAccountList: Array<MeetingAccountInfo>;
  generalMeetingAccountDetail: GeneralMeetingAccountDetail;
}

const initialState: AccountState = {
  isKeyboard: false,
  accountPassword: "",
  accountList: [],
  foreignAccountList: [],
  joinedAccountList: [],
  generalMeetingAccountDetail: {
    generalMeetingAccountName: "",
    generalMeetingAccountIcon: "",
    generalMeetingAccountUserName: "",
    generalMeetingAccountUserResidentNumber: "",
    generalMeetingAccountPassword: "",
    generalMeetingAccountMemberList: [],
  },
};
    
export const userSilce = createSlice({
  name: "account",
  initialState,
  reducers: {
    setIsKeyboard: (state, action: PayloadAction<boolean>) => {
      state.isKeyboard = action.payload;
    },
    setAccountPassword: (state, action: PayloadAction<string>) => {
      state.accountPassword = action.payload;
    },
    editAccountList: (state, action: PayloadAction<Array<AccountInfo>>) => {
      state.accountList = action.payload;
    },
    editForeingAccountList: (state, action: PayloadAction<Array<AccountInfo>>) => {
      state.foreignAccountList = action.payload;
    },
    editJoinedAccountList: (state, action: PayloadAction<Array<MeetingAccountInfo>>) => {
      state.joinedAccountList = action.payload;
    },
    editGeneralMeetingAccountList: (state, action: PayloadAction<GeneralMeetingAccountDetail>) => {
      state.generalMeetingAccountDetail = action.payload;
    },
  },
});

export const { setIsKeyboard, setAccountPassword, editAccountList, editForeingAccountList, editGeneralMeetingAccountList, editJoinedAccountList } = userSilce.actions;

export default userSilce.reducer;