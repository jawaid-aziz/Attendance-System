import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Clocking from "../Components/Clocking";
import { useUserData } from "../Data/UserData";

export const AdminInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users } = useUserData();

  // Function to handle navigation to the AddEmployee page
  const handleAddEmployee = () => {
    navigate("/add-employee"); // Adjust the path based on your routes configuration
  };

  const handleShowEmployees = () => {
    navigate("/employees-data");
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-center flex-col">
        <h1 className="text-2xl font-bold">Admin Interface</h1>
        <p>Welcome to the Admin Interface page.</p>
      </div>
      <Clocking id={id} />

      {/* Add Employee Button */}
      <div className="flex items-center justify-center mt-8">
        <button
          onClick={handleAddEmployee}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
        >
          Add Employee
        </button>
        <button
          onClick={handleShowEmployees}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Show Employees
        </button>
      </div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
};
