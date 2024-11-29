import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AttendanceProvider from "./Context/AttendanceProvider.jsx";
import { AllRoutes } from "./Routes.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(<Main />);

function Main() {
  const router = createBrowserRouter(AllRoutes);

  return (
    <StrictMode>
      <AttendanceProvider>
        <RouterProvider router={router} />
      </AttendanceProvider>
    </StrictMode>
  );
}

export default Main;
