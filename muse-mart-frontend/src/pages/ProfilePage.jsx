import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex flex-col items-center justify-center">
        <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <p className="text-lg font-semibold">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-background">
      <div className="max-w-xl mx-auto bg-card p-10 rounded-2xl shadow-xl border border-gray-200">
        <h1 className="text-4xl font-bold text-text-DEFAULT mb-8 text-center">My Profile</h1>
        <div className="space-y-6">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="font-semibold text-text-light">Name:</span>
            <span className="text-text-DEFAULT text-lg">{user.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="font-semibold text-text-light">Email:</span>
            <span className="text-text-DEFAULT text-lg">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-semibold text-text-light">Phone:</span>
              <span className="text-text-DEFAULT text-lg">{user.phone}</span>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="mt-10 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;