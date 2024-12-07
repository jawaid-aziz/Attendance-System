import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AttendanceProvider from "./Context/AttendanceProvider.jsx";
import { RoleProvider } from "./Context/RoleProvider.jsx";
import { IdProvider } from "./Context/IdProvider.jsx";
import { AllRoutes } from "./Routes.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(<Main />);

function Main() {
  const router = createBrowserRouter(AllRoutes);

  return (
    <StrictMode>
      <IdProvider>
      <RoleProvider>
      <AttendanceProvider>
        <RouterProvider router={router} />
      </AttendanceProvider>
      </RoleProvider>
      </IdProvider>
    </StrictMode>
  );
}

export default Main;
