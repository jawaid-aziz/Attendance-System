import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RoleProvider } from "./Context/RoleProvider.jsx";
import { IdProvider } from "./Context/IdProvider.jsx";
import { CompanyProvider } from "./Context/CompanyProvider.jsx";
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
          <CompanyProvider>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <RouterProvider router={router} />
            </ThemeProvider>
          </CompanyProvider>
        </RoleProvider>
      </IdProvider>
    </StrictMode>
  );
}

export default Main;
