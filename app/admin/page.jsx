import AuthCheck from "../components/authCheckAdmin";
import AdminResourcesPage from "../components/adminPage";

export default function adminPage() {
  return (
      <AuthCheck>
      <AdminResourcesPage />
    </AuthCheck>
  );
}


