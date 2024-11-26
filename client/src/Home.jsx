import React from "react";
import { useNavigate } from "react-router-dom";
navigate=useNavigate();
const Home = () => {
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200">
      <h1 className="text-2xl font-bold">Welcome, Admin!</h1>
      <div className="flex">

   
      <button onClick={handleLogout} className=" font-bold mt-4 p-3 bg-blue-600 rounded-lg">Logout</button>
      </div>
    </div>
  );
};

export default Home;
