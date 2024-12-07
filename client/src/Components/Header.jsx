import { useNavigate } from "react-router-dom";

export const Header = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/"); // Redirect to the login page
  }

  return (
    <div className="flex items-center justify-between px-4">
      <div className="flex flex-col items-center w-full">
        <h1 className="text-2xl font-bold">
          {role === "admin" ? "Admin Dashboard" : "User Dashboard"}
        </h1>
      </div>
      
        <button
          onClick={handleLogout}
          className="absolute right-0 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition ml-auto"
        >
          Log Out
        </button>
      
    </div>
  );
};
