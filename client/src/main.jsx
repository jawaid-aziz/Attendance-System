import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AllRoutes } from './Routes.jsx';
import './index.css'

createRoot(document.getElementById('root')).render(<Main/>)

function Main() {
  const router = createBrowserRouter(AllRoutes);

    return (
        <StrictMode>
            <RouterProvider router={router} />
        </StrictMode>
    )
}

export default Main;
