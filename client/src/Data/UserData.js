import { useState } from "react";

export const useUserData = () => {
  const [users, setUsers] = useState(USERS_DUMMYDATA);

  const addUser = (newUser) => {
    console.log("Adding user:", newUser); // Debug log
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
    firstName: "Waleed",
    lastName: "Ahmed",
    username: "waleelahmed",
    email: "waleed@firnas.com",
    role: "Admin",
    jobTitle: "Software Engineer",
    gender: "Male",
    contact: "03331234567",
    country: "Pakistan",
    city: "Abbottabad",
    address: "Abbottabad",
    salary: 50000,
    checkedIn: false,
    checkInTime: null,
    halfLeaveCount: 0,
    dailyAttendance: [],
  },
  {
    id: 1,
    firstName: "Javaid",
    lastName: "Memon",
    username: "javaidmemon",
    email: "javaid@firnas.com",
    role: "User",
    jobTitle: "Software Engineer",
    gender: "Male",
    contact: "03331234567",
    country: "Pakistan",
    city: "Abbottabad",
    address: "Abbottabad",
    salary: 50000,
    checkedIn: false,
    checkInTime: null,
    halfLeaveCount: 0,
    dailyAttendance: [],
  },
  {
    id: 2,
    firstName: "Ehtisham",
    lastName: "",
    username: "ehtisham",
    email: "ehtisham@firnas.com",
    role: "User",
    jobTitle: "Software Engineer",
    gender: "Male",
    contact: "03331234567",
    country: "Pakistan",
    city: "Abbottabad",
    address: "Abbottabad",
    salary: 50000,
    checkedIn: false,
    checkInTime: null,
    halfLeaveCount: 0,
    dailyAttendance: [],
  },
  {
    id: 3,
    firstName: "Muhammad",
    lastName: "",
    username: "muhammad",
    email: "muhammad@firnas.com",
    role: "User",
    jobTitle: "Software Engineer",
    gender: "Male",
    contact: "03331234567",
    country: "Pakistan",
    city: "Abbottabad",
    address: "Abbottabad",
    salary: 50000,
    checkedIn: false,
    checkInTime: null,
    halfLeaveCount: 0,
    dailyAttendance: [],
  },
  {
    id: 4,
    firstName: "Huzaifa",
    lastName: "",
    username: "huzaifa",
    email: "huzaifa@firnas.com",
    role: "User",
    jobTitle: "Software Engineer",
    gender: "Male",
    contact: "03331234567",
    country: "Pakistan",
    city: "Abbottabad",
    address: "Abbottabad",
    salary: 50000,
    checkedIn: false,
    checkInTime: null,
    halfLeaveCount: 0,
    dailyAttendance: [],
  },
  {
    id: 5,
    firstName: "Mubarak",
    lastName: "Ali",
    username: "mubarak",
    email: "mubarak@firnas.com",
    role: "User",
    jobTitle: "Software Engineer",
    gender: "Male",
    contact: "03331234567",
    country: "Pakistan",
    city: "Abbottabad",
    address: "Abbottabad",
    salary: 50000,
    checkedIn: false,
    checkInTime: null,
    halfLeaveCount: 0,
    dailyAttendance: [],
  },
];