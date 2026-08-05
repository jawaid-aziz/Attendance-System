import React from "react";
import Clocking from "../Components/Clocking";
import { useId } from "../Context/IdProvider";
import { useCompany } from "../Context/CompanyProvider";

export const Home = () => {
  const { id, loading: idLoading } = useId();
  const { company } = useCompany();

  if (idLoading) {
    return <div>Loading...</div>;
  }

  if (!id) {
    return <div>Error: User ID not found. Please log in again.</div>;
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto p-4 flex">
      <div className="flex-1 flex flex-col items-center justify-start ml-4">
        {company?.name && (
          <p className="text-sm text-gray-500 mb-1">
            {company.name} &middot; {today}
          </p>
        )}
        <Clocking id={id} />
      </div>
    </div>
  );
};

// export default Home;
