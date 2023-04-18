import React from "react";
import {Chip} from "@mui/material";
import {FinishReason} from "../utils/types";

interface FinishReasonChipProps {
  finishReason: FinishReason;
}

export default function FinishReasonChip(props: FinishReasonChipProps) {
  if (props.finishReason === "stop") {
    return null;
  }
  if (props.finishReason === "length") {
    return (
      <Chip
        variant={"outlined"}
        label={"Incomplete due to token limit"}
        size={"small"}
        color={"info"}
        sx={{
          marginY: "12px",
        }}
      />
    );
  }
  if (props.finishReason === "content_filter") {
    return (
      <Chip
        variant={"outlined"}
        label={"Omitted content due to content filters"}
        size={"small"}
        color={"warning"}
        sx={{
          marginY: "12px",
        }}
      />
    );
  }
  return (
    <Chip
      variant={"outlined"}
      label={"Response abort or error"}
      size={"small"}
      color={"error"}
      sx={{
        marginY: "12px",
      }}
    />
  );
}
