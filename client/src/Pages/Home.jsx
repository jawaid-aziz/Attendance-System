import React from "react";
import Clocking from "../Components/Clocking";
import { useId } from "../Context/IdProvider";

export const Home = () => {
  const { id, loading: idLoading } = useId();

  if (idLoading) {
    return <div>Loading...</div>;
  }

  if (!id) {
    return <div>Error: User ID not found. Please log in again.</div>;
  }

  return (
    <div className="container mx-auto p-4 flex">
      
      <div className="flex-1 flex flex-col items-center justify-start ml-4">
        <Clocking id={id} />
      </div>
    </div>
  );
};

// export default Home;
