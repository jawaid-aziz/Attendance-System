import React, { createContext, useContext, useState } from "react";
import { USERS_DUMMYDATA } from "../Data/UserData"; // Adjust the path as needed
import { useUserData } from "../Data/UserData";

const AttendanceContext = createContext();

 const AttendanceProvider = ({ children }) => {
  // Use the imported data as the initial state
  const { users } = useUserData(); 

  const [user, setUser] = useState(users);

  // Function to fetch a user by ID
  const getUserById = (id) => {
    const numericId = parseInt(id, 10); // Ensure ID is a number
    return user.find((user) => user.id === numericId);
  };

  // Function to update a user in the state
  const updateUser = (updatedUser) => {
    setUser((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  const updateAttendance = (id, updatedAttendance) => {
    setUser((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id
          ? { ...user, dailyAttendance: updatedAttendance }
          : user
      )
    );
  };

  return (
    <AttendanceContext.Provider value={{ users, getUserById, updateUser, updateAttendance }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
    const context = useContext(AttendanceContext);
    if (!context) {
      throw new Error("useAttendance must be used within an AttendanceProvider");
    }
    return context;
  };

  export default AttendanceProvider;