import React, {useState} from "react";
import {Card, TextField, useMediaQuery} from "@mui/material";
import {narrowPageWidth} from "../utils/utils";

interface SearchInputCardProps {
  handleInputChange: (text: string) => void;
}

export default function SearchInputCard(props: SearchInputCardProps) {
  const isNarrowPage = !useMediaQuery(`(min-width:${narrowPageWidth}px)`)

  const [input, setInput] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
    props.handleInputChange(event.target.value);
  }

  return (
    <Card
      elevation={4}
      sx={{
        marginX: isNarrowPage ? "0px" : "16px",
        padding: "16px",
        borderRadius: "0px",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
      }}
    >
      <TextField
        variant={"standard"}
        fullWidth={true}
        placeholder={"Search conversations..."}
        value={input}
        autoFocus={true}
        onChange={handleInputChange}
      />
    </Card>
  );
}
