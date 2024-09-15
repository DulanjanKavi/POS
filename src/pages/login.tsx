/* eslint-disable react-refresh/only-export-components */
import React, { useState, createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    LOGIN_API: any; // Adjust the type as needed
  }
}


// Create a context for the user ID
export const UserIDContext = createContext<{ userID: string | null; setUserID: React.Dispatch<React.SetStateAction<string | null>> } | undefined>(undefined);

// Create a custom hook to use the UserIDContext
export const useUserID = () => {
  const context = useContext(UserIDContext);
  if (!context) {
    throw new Error('useUserID must be used within a UserIDContext.Provider');
  }
  return context;
};

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [userID, setUserID] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const result = await window.LOGIN_API.getUserID(username, password);
      if (result === null) {
        setLoginStatus('Username or password is incorrect.');
      } else {
        console.log(result);
        setUserID(result);
        navigate('/bill');
        setLoginStatus('Logged in successfully');
      }
    } catch (error) {
      console.error(error);
      setLoginStatus('An error occurred during login.');
    }
  };


  // check auto login -- if already logged in, redirect to bill page
  useEffect(() => {
    window.LOGIN_API.userAutoLogin().then(
      (result: string | null) => {
        if (result !== null) {
          setUserID(result);
          navigate('/bill');
        }
      }
    )
  }, [])

  return (
    <UserIDContext.Provider value={{ userID, setUserID }}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-sm w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            {loginStatus && <p className="text-center text-red-500">{loginStatus}</p>}
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserIDContext.Provider>
  );
}

export default Login;
