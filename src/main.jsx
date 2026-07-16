import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppRouter from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <AppRouter />

  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3000,
      style: {
        borderRadius: "10px",
        background: "#fff",
        color: "#111827",
      },
    }}
  />
</React.StrictMode>
);
