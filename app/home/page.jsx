import AuthCheck from "../components/authCheck";
import UserDashboard from "../components/userPage";

export default function HomePage() {
  return (
    <AuthCheck>
      <UserDashboard />
    </AuthCheck>
  );
}


