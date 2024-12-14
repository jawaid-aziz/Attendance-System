import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
          <RouterProvider router={router} />
        </RoleProvider>
      </IdProvider>
    </StrictMode>
  );
}

export default Main;
