import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RoleProvider } from "./Context/RoleProvider.jsx";
import { IdProvider } from "./Context/IdProvider.jsx";
import { ThemeProvider } from "./Context/theme-provider.jsx";
import { AllRoutes } from "./Routes.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(<Main />);

function Main() {
  const router = createBrowserRouter(AllRoutes);

  return (
    <StrictMode>
      <IdProvider>
        <RoleProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <RouterProvider router={router} />
          </ThemeProvider>
        </RoleProvider>
      </IdProvider>
    </StrictMode>
  );
}

export default Main;
