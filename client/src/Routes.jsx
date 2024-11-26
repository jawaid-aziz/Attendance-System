import Attendance from "./Common/Attendance";
import AdminLogin from "./AdminLogin";
import Home from "./Home";
export const AllRoutes =[
    {
         path:"/admin" ,
         element:<AdminLogin/>,
    },
      {  path:"/home",
         element:<Home />,
      },
      {
        path: '/',
        element: <Attendance />,
    },
]