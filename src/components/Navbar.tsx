import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:pl-0">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="lg:hidden -m-2.5 p-2.5 text-gray-700"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-x-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="bg-primary-100 p-2 rounded-full">
                <User className="h-5 w-5 text-primary-700" />
              </div>
              <span className="hidden lg:block">{user?.full_name || user?.email}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    <p className="font-medium">{user?.full_name}</p>
                    <p className="text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
