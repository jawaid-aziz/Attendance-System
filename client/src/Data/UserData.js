import { useState, useEffect } from "react";

export const useUserData = () => {

    const [users, setUsers] = useState(() => {
        // Load users from localStorage or fallback to default dummy data
        const storedUsers = localStorage.getItem("users");
        return storedUsers ? JSON.parse(storedUsers) : USERS_DUMMYDATA;
      });
  
      useEffect(() => {
        // Save users to localStorage whenever it changes
        localStorage.setItem("users", JSON.stringify(users));
      }, [users]);

    const addUser = (newUser) => {
      setUsers((prevUsers) => [...prevUsers, newUser]);
    };

    const generateUniqueId = () => {
      let id;
      do {
        id = Math.floor(Math.random() * 1000); // Generate a random ID
      } while (users.some((user) => user.id === id)); // Ensure ID is unique
      return id;
    };
  
    return {
      users,
      addUser,
      generateUniqueId,
    };
  };

export const USERS_DUMMYDATA = [
    {
        id: 100,
        name: "Waleed",
        email: "waleed@firnas.com",
        salary: 50000,
        role: "Manager",
        checkedIn: false,
        checkInTime: null,
        halfLeaveCount: 0,
        dailyAttendance: [],
    },
    {
        id: 1,
        name: "Javaid Memon",
        email: "javaid@firnas.com",
        salary: 50000,
        role: "Backend Developer",
        checkedIn: false,
        checkInTime: null,
        halfLeaveCount: 0,
        dailyAttendance: [],
    },
    {
        id: 2,
        name: "Ahtisham",
        email: "ahtisham@firnas.com",
        salary: 50000,
        role: "Frontend Developer",
        checkedIn: false,
        checkInTime: null,
        halfLeaveCount: 0,
        dailyAttendance: [],
    },
    {
        id: 3,
        name: "Muhammad",
        email: "muhammad@firnas.com",
        salary: 50000,
        role: "Software Engineer",
        checkedIn: false,
        checkInTime: null,
        halfLeaveCount: 0,
        dailyAttendance: [],
    },
    {
        id: 4,
        name: "Ali",
        email: "ali@firnas.com",
        salary: 50000,
        role: "Software Developer",
        checkedIn: false,
        checkInTime: null,
        halfLeaveCount: 0,
        dailyAttendance: [],
    },
    {
        id: 5,
        name: "Umar",
        email: "umar@firnas.com",
        salary: 50000,
        role: "Software Developer",
        checkedIn: false,
        checkInTime: null,
        halfLeaveCount: 0,
        dailyAttendance: [],
    }
];