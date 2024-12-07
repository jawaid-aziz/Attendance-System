import { NavLink } from "react-router-dom";
import { useId } from "../Context/IdProvider";

export const Sidebar = ({ role }) => {
  const { id } = useId();

  return (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-300 p-4">
      <div className="mb-6">
        <ul>
          <li className="mb-2">
            <NavLink to={`/${role}-interface/${id}`}>
              <button className="w-full font-bold text-lg text-left px-4 py-2 rounded bg-white border border-gray-300 shadow-sm hover:bg-gray-200">
                Home
              </button>
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Attendance Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-2">Attendance</h2>
        <ul>
          <li className="mb-2">
            <NavLink to={`/attendance-history/${id}`}>
              <button className="w-full text-left px-4 py-2 rounded bg-white border border-gray-300 shadow-sm hover:bg-gray-200">
                Show Attendance
              </button>
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Employees Section - Only for Admin */}
      {role === "admin" && (
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">Employees</h2>
          <ul>
            <li className="mb-2">
              <NavLink to="/employees-data">
                <button className="w-full text-left px-4 py-2 rounded bg-white border border-gray-300 shadow-sm hover:bg-gray-200">
                  Employee List
                </button>
              </NavLink>
            </li>
            <li>
              <NavLink to="/add-employee">
                <button className="w-full text-left px-4 py-2 rounded bg-white border border-gray-300 shadow-sm hover:bg-gray-200">
                  Add Employee
                </button>
              </NavLink>
            </li>
          </ul>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-2">Settings</h2>
        <ul>
          <li className="mb-2">
            <NavLink to={`/profile`}>
              <button className="w-full text-left px-4 py-2 rounded bg-white border border-gray-300 shadow-sm hover:bg-gray-200">
                Profile
              </button>
            </NavLink>
          </li>
          {role === "admin" && (
            <li className="mb-2">
              <NavLink to={`/system-settings`}>
                <button className="w-full text-left px-4 py-2 rounded bg-white border border-gray-300 shadow-sm hover:bg-gray-200">
                  System
                </button>
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
