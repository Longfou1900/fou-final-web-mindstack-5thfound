// src/pages/QuestionDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { FiArrowLeft, FiSun, FiHeart, FiCopy, FiMessageCircle, FiEye } from 'react-icons/fi';

export default function QuestionDetailPage() {
  const { id } = useParams(); // Changed from params.id
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [answerCode, setAnswerCode] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [userLamps, setUserLamps] = useState(new Set());
  const [userFavorites, setUserFavorites] = useState(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);

        // Fetch question
        const questionRef = doc(db, 'questions', id);
        const questionSnap = await getDoc(questionRef);

        if (questionSnap.exists()) {
          const questionData = { id: questionSnap.id, ...questionSnap.data() };
          setQuestion(questionData);

          // Update view count
          await updateDoc(questionRef, {
            viewCount: increment(1),
          });

          // Fetch answers
          const answersRef = collection(db, 'answers');
          const q = query(answersRef, where('questionId', '==', id));
          const answersSnap = await getDocs(q);
          const answersData = answersSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sort by lamp count
          answersData.sort((a, b) => (b.lampCount || 0) - (a.lampCount || 0));
          setAnswers(answersData);

          // Fetch user lamps and favorites
          if (currentUser) {
            const lampsSet = new Set();
            const favoritesSet = new Set();

            answersData.forEach((answer) => {
              if (answer.userLamps && answer.userLamps[currentUser.uid]) {
                lampsSet.add(answer.id);
              }
            });

            const favoritesRef = collection(db, 'favorites');
            const fq = query(favoritesRef, where('userId', '==', currentUser.uid));
            const favoritesSnap = await getDocs(fq);
            favoritesSnap.docs.forEach((doc) => {
              favoritesSet.add(doc.data().answerId);
            });

            setUserLamps(lampsSet);
            setUserFavorites(favoritesSet);
          }
        }
      } catch (error) {
        console.error('Error fetching question:', error);
        setError('Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser]);

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to post an answer');
      return;
    }

    if (!answerContent.trim()) {
      setError('Answer cannot be empty');
      return;
    }

    setSubmittingAnswer(true);
    setError('');

    try {
      const answersRef = collection(db, 'answers');
      await addDoc(answersRef, {
        questionId: id,
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || currentUser.email,
        content: answerContent.trim(),
        code: answerCode.trim() || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        comments: 0,
        lampCount: 0,
        userLamps: {},
      });

      // Update question answer count
      const questionRef = doc(db, 'questions', id);
      await updateDoc(questionRef, {
        answers: increment(1),
      });

      setAnswerContent('');
      setAnswerCode('');

      // Refresh answers
      const answersRef2 = collection(db, 'answers');
      const q = query(answersRef2, where('questionId', '==', id));
      const answersSnap = await getDocs(q);
      const answersData = answersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      answersData.sort((a, b) => (b.lampCount || 0) - (a.lampCount || 0));
      setAnswers(answersData);
    } catch (err) {
      console.error('Error posting answer:', err);
      setError('Failed to post answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleLamp = async (answerId) => {
    if (!currentUser) {
      alert('Please log in to add a lamp');
      return;
    }

    try {
      const answerRef = doc(db, 'answers', answerId);
      const answerSnap = await getDoc(answerRef);
      const answerData = answerSnap.data();

      if (userLamps.has(answerId)) {
        // Remove lamp
        const newUserLamps = { ...answerData?.userLamps };
        delete newUserLamps[currentUser.uid];
        await updateDoc(answerRef, {
          userLamps: newUserLamps,
          lampCount: increment(-1),
        });
        setUserLamps((prev) => {
          const newSet = new Set(prev);
          newSet.delete(answerId);
          return newSet;
        });
      } else {
        // Add lamp
        await updateDoc(answerRef, {
          [`userLamps.${currentUser.uid}`]: true,
          lampCount: increment(1),
        });
        setUserLamps((prev) => new Set(prev).add(answerId));
      }

      // Refresh answers
      const answersRef = collection(db, 'answers');
      const q = query(answersRef, where('questionId', '==', id));
      const answersSnap = await getDocs(q);
      const answersData = answersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      answersData.sort((a, b) => (b.lampCount || 0) - (a.lampCount || 0));
      setAnswers(answersData);
    } catch (error) {
      console.error('Error updating lamp:', error);
    }
  };

  const handleFavorite = async (answerId) => {
    if (!currentUser) {
      alert('Please log in to save favorites');
      return;
    }

    try {
      if (userFavorites.has(answerId)) {
        // Remove favorite
        const favoritesRef = collection(db, 'favorites');
        const q = query(
          favoritesRef,
          where('userId', '==', currentUser.uid),
          where('answerId', '==', answerId)
        );
        const favoritesSnap = await getDocs(q);
        favoritesSnap.docs.forEach(async (doc) => {
          await doc.ref.delete();
        });
        setUserFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(answerId);
          return newSet;
        });
      } else {
        // Add favorite
        const favoritesRef = collection(db, 'favorites');
        await addDoc(favoritesRef, {
          userId: currentUser.uid,
          answerId,
          addedAt: Timestamp.now(),
        });
        setUserFavorites((prev) => new Set(prev).add(answerId));
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Question not found</p>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
          >
            Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-6">
          <FiArrowLeft size={18} />
          Back to Questions
        </Link>

        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-white flex-1">{question.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              question.status === 'open' ? 'bg-blue-100 text-blue-800' :
              question.status === 'resolved' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {question.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags?.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs border border-gray-700">
                {tag}
              </span>
            ))}
          </div>

          <div className="text-sm text-gray-400 mb-6">
            Asked by <span className="font-semibold text-gray-300">{question.authorName}</span> •{' '}
            {formatDistanceToNow(question.createdAt.toDate(), { addSuffix: true })} • {question.viewCount} views
          </div>

          <div className="prose prose-invert max-w-none mb-6">
            <p className="whitespace-pre-wrap text-gray-300">{question.description}</p>
            {question.code && (
              <div className="bg-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto mt-4 text-gray-300">
                <pre>{question.code}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-white">{answers.length} Answers</h2>

          <div className="space-y-6">
            {answers.map((answer) => (
              <div key={answer.id} className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleLamp(answer.id)}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded transition ${
                        userLamps.has(answer.id)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                      title="Mark as helpful"
                    >
                      <FiSun size={20} />
                      <span className="text-xs font-semibold">{answer.lampCount || 0}</span>
                    </button>
                    <button
                      onClick={() => handleFavorite(answer.id)}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded transition ${
                        userFavorites.has(answer.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                      title="Save to favorites"
                    >
                      <FiHeart size={20} />
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="prose prose-invert max-w-none mb-4">
                      <p className="whitespace-pre-wrap text-gray-300">{answer.content}</p>
                      {answer.code && (
                        <div className="bg-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto mt-4">
                          <div className="flex justify-between items-start">
                            <pre className="flex-1 text-gray-300">{answer.code}</pre>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(answer.code);
                                alert('Code copied!');
                              }}
                              className="ml-2 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded flex-shrink-0"
                              title="Copy code"
                            >
                              <FiCopy size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-400">
                      Answered by <span className="font-semibold text-gray-300">{answer.authorName}</span> •{' '}
                      {formatDistanceToNow(answer.createdAt.toDate(), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Post Answer Section */}
        {currentUser ? (
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold mb-6 text-white">Your Answer</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handlePostAnswer} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Solution</label>
                <textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="Share your solution..."
                  className="w-full min-h-32 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={submittingAnswer}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Code (Optional)</label>
                <textarea
                  value={answerCode}
                  onChange={(e) => setAnswerCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="w-full min-h-24 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={submittingAnswer}
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submittingAnswer}
              >
                {submittingAnswer ? 'Posting...' : 'Post Answer'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 text-center">
            <p className="text-gray-400 mb-4">Sign in to post an answer</p>
            <Link 
              to="/login" 
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}