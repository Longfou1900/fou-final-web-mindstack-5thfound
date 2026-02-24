// src/pages/SetupAdmin.jsx
import { useState } from 'react';
import { auth, db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

export default function SetupAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleMakeAdmin = async (e) => {
    e.preventDefault();
    try {
      // Get current user
      const user = auth.currentUser;
      
      if (!user) {
        setMessage('Please log in first');
        return;
      }
      
      // Update user role
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: 'admin'
      });
      
      setMessage('Success! You are now an admin. Remove this component after use.');
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-white">Admin Setup</h1>
        <p className="text-gray-400 mb-4">This is a temporary page. Remove after setting admin.</p>
        
        <form onSubmit={handleMakeAdmin}>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg"
          >
            Make Me Admin
          </button>
        </form>
        
        {message && (
          <div className="mt-4 p-3 bg-gray-800 rounded text-gray-300">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}