import Clocking from "../Components/Clocking";
import { useParams } from "react-router-dom";

export const UserInterface = () => {
    const { id } = useParams();
    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center justify-center flex-col">
            <h1 className="text-2xl font-bold">User Interface</h1>
            <p>Welcome to the User Interface page.</p>
            </div>
            <Clocking id={id}/>
        </div>
    );
}