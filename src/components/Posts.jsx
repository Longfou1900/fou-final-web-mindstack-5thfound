// src/components/Posts.jsx
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

function Posts() {
  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(db, 'posts'))
    querySnapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data())
    })
  }

  return (
    <div>
      <button onClick={fetchPosts}>Load Posts</button>
    </div>
  )
}