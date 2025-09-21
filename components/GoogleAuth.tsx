import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from './Spinner';

export const GoogleAuth: React.FC = () => {
  const { user, isLoggedIn, isAuthReady, signIn, signOut } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center bg-gray-700 text-white font-semibold py-2 px-4 rounded-full text-sm w-44 h-10">
        <Spinner size="sm" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-2">
        <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
        <span className="text-sm font-medium text-gray-300 hidden sm:inline">{user.name}</span>
        <button
          onClick={signOut}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      className="flex items-center justify-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md hover:bg-gray-200 transition-colors text-sm"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M24 9.5c3.23 0 6.13 1.11 8.4 3.29l6.3-6.3C34.92 2.77 29.83 0 24 0 14.52 0 6.46 5.82 2.75 14.33l7.63 5.92C12.14 13.99 17.61 9.5 24 9.5z"></path>
        <path fill="#34A853" d="M46.25 24c0-1.56-.14-3.08-.4-4.56H24v8.63h12.47c-.55 2.78-2.14 5.15-4.5 6.78l7.26 5.65C43.43 36.63 46.25 30.82 46.25 24z"></path>
        <path fill="#FBBC05" d="M10.38 28.25c-.49-1.47-.78-3.04-.78-4.69s.29-3.22.78-4.69l-7.63-5.92C.92 16.24 0 20.02 0 24c0 3.98.92 7.76 2.75 11.08l7.63-5.83z"></path>
        <path fill="#EA4335" d="M24 48c5.83 0 10.92-1.92 14.56-5.18l-7.26-5.65c-1.92 1.29-4.38 2.06-7.3 2.06-6.39 0-11.86-4.49-13.62-10.43l-7.63 5.92C6.46 42.18 14.52 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
      </svg>
      Sign in with Google
    </button>
  );
};
