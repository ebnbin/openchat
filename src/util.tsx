import React from "react";

export function Json({ value }: { value: any }) {
  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(value, null, 2)}
    </div>
  )
}
