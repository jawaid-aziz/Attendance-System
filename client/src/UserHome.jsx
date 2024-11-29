import React from "react";

const UserHome = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200">
      <h1 className="text-2xl font-bold">Welcome, {user.firstName}!</h1>
      <p className="text-gray-700">Your email: {user.email}</p>
    </div>
  );
};

export default UserHome;
