import React from "react";
import Clocking from "../Components/Clocking";
import { useId } from "../Context/IdProvider";

export const UserInterface = () => {
  const { id } = useId();

  return (
    <div className="container mx-auto p-4 flex">

      {/* Main Content - Center Aligned */}
      <div className="flex-1 flex flex-col items-center justify-start ml-4">
        <Clocking id={id} />
      </div>
    </div>
  );
};
