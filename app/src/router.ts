import { createBrowserRouter } from "react-router-dom";
import StudentData, {loader as studentloader} from "./studentData";

const router = createBrowserRouter([
    {
        index: true,
        Component: StudentData,
        loader: studentloader
    }
]);

export default router;