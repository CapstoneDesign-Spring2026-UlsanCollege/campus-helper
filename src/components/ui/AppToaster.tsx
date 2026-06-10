"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2600,
        style: {
          background: "rgba(7, 11, 21, 0.96)",
          border: "1px solid rgba(124, 233, 208, 0.18)",
          borderRadius: "18px",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.42)",
          color: "#f8fafc",
          fontSize: "14px",
          fontWeight: 700,
          padding: "14px 16px",
        },
        success: {
          iconTheme: {
            primary: "#7ce9d0",
            secondary: "#071018",
          },
        },
        error: {
          iconTheme: {
            primary: "#ff8a8a",
            secondary: "#18070a",
          },
        },
      }}
    />
  );
}
