import { TextField } from "@mui/material";
import React from "react";

interface Props {
  name: string;
  setName: (name: string) => void;
}

const FirstNameInputMui = ({ name, setName }: Props) => {
  return (
    <TextField
      sx={{
        width: "100%",
        "& .MuiInputLabel-root": {
          color: "#565656",
          fontSize: "20px",
        },
        "& .MuiInputLabel-shrink": {
          fontSize: "20px",
        },
        "& .MuiInputBase-input": {
          padding: "10px 0",
          fontSize: "20px",
          fontWeight: "bold",
        },
      }}
      id="firstName"
      label="영문 이름"
      value={name}
      variant="standard"
      autoComplete="off"
      onChange={(e) => setName(e.target.value.toUpperCase())}
    />
  );
};

export default FirstNameInputMui;