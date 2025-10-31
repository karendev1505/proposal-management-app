import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProfileView from '@/components/profile/ProfileView';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <ProfileView />
      </div>
    </ProtectedRoute>
  );
}
