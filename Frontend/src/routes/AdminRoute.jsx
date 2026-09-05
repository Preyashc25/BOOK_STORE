import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";


const AdminRoutes = ({children}) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" repalce />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AdminRoutes;
