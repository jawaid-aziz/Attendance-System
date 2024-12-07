import { useNavigate } from "react-router-dom";
import { useUserData } from "../Data/UserData";

export const EmployeesData = () => {
  const { users } = useUserData();
  const navigate = useNavigate();

  const handleEdit = (id) => {
     // Navigate to an edit page, adjust route as needed
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
       // Call `removeUser` if available, or implement deletion logic
      alert("Employee deleted successfully!");
    }
  };

  const handleViewAttendance = (id) => {
    navigate(`/attendance-history/${id}`); // Navigate to the attendance page, adjust route as needed
  };

  return (
    <div className="container mx-auto p-4">


      {/* Page Header */}
      <div className="flex items-center justify-center flex-col">
        <h1 className="text-2xl font-bold">Employees Data</h1>
        <p>Welcome to the Employees Data page.</p>
      </div>

      {/* Employees List */}
      <ul className="mt-6 space-y-4">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center justify-between bg-white p-4 rounded-md shadow-md"
          >
            {/* User Info */}
            <div>
              <p className="font-bold text-gray-800">{user.firstName} {user.lastName}</p>
              <p className="text-gray-600">{user.role}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
                {/* View Button */}
              <button
                onClick={() => handleViewProfile(user.id)}
                className="bg-blue-800 text-white px-3 py-2 rounded-md hover:bg-blue-500 transition"
              >
                View Profile
              </button>
              {/* Edit Button */}
              <button
                onClick={() => handleEdit(user.id)}
                className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-800 transition"
              >
                Edit
              </button>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(user.id)}
                className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition"
              >
                Delete
              </button>

              {/* View Attendance Button */}
              <button
                onClick={() => handleViewAttendance(user.id)}
                className="bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition"
              >
                View Attendance
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
