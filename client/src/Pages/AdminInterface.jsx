import React from "react";
import Clocking from "../Components/Clocking";
import { useId } from "../Context/IdProvider";

export const AdminInterface = () => {
  const { id } = useId();

  return (
    <div className="container mx-auto p-4 flex bg-black-100">

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start ml-4">
        
        <Clocking/>
      </div>
    </div>
  );
};
