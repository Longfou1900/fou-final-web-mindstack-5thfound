// src/scripts/makeAdmin.js
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

const makeAdmin = async (email, password) => {
  try {
    // First login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    // Update user role in Firestore
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role: 'admin'
    });
    
    console.log('User successfully set as admin!');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run this in browser console after logging in
// makeAdmin('your-email@example.com', 'your-password');