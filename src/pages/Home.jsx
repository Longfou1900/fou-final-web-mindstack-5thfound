// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";
import QuestionCard from "../components/QuestionCard";
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const questionsRef = collection(db, 'questions');
        
        let q;
        if (sortBy === 'newest') {
          q = query(questionsRef, orderBy('createdAt', 'desc'), limit(20));
        } else if (sortBy === 'views') {
          q = query(questionsRef, orderBy('viewCount', 'desc'), limit(20));
        } else {
          q = query(questionsRef, orderBy('answers', 'desc'), limit(20));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [sortBy]);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome{user ? `, ${user.displayName || user.email}` : ''}!
            </h1>
            <p className="text-gray-400">Browse and find solutions from the community</p>
          </div>
          {user ? (
            <Link to="/ask">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition">
                <span>Ask a Question</span>
                <FiArrowRight size={18} />
              </button>
            </Link>
          ) : (
            <Link to="/signup">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition">
                Join the Community
              </button>
            </Link>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
          {['newest', 'views', 'answers'].map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                sortBy === option
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800/50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-lg mb-4">No questions yet</p>
            {user ? (
              <Link to="/ask">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold">
                  Ask the first question
                </button>
              </Link>
            ) : (
              <p className="text-gray-400">Please log in to ask questions and interact with the community.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                id={question.id}
                title={question.title}
                description={question.description}
                author={question.authorName}
                tags={question.tags || []}
                createdAt={question.createdAt}
                viewCount={question.viewCount || 0}
                answerCount={question.answers || 0}
                status={question.status || 'open'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}