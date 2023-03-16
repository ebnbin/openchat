import React from "react";
import {Paper, Typography} from "@mui/material";

/**
 * Convert object to json and log it using a monospace font.
 */
export function JsonLog({ object }: { object: any }) {
  if (!object) {
    return <></>
  }
  return (
    <Paper
      variant={'outlined'}>
      <Typography
        variant={'body2'}
        style={{ whiteSpace: 'pre-wrap' }}
        fontFamily={'monospace'}
      >
        {JSON.stringify(object, null, 2)}
      </Typography>
    </Paper>
  )
}
