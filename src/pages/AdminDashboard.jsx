// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import {
  FiTrash2,
  FiEye,
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiBell,
} from "react-icons/fi";

export default function AdminDashboard() {
  const { userProfile, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalAnswers: 0,
    totalMessages: 0,
  });
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("activity");

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users
        const usersSnap = await getDocs(collection(db, "users"));
        const usersData = usersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);

        // Fetch questions
        const questionsSnap = await getDocs(
          query(collection(db, "questions"), orderBy("createdAt", "desc")),
        );
        const questionsData = questionsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuestions(questionsData);

        // Fetch answers
        const answersSnap = await getDocs(
          query(collection(db, "answers"), orderBy("createdAt", "desc")),
        );
        const answersData = answersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAnswers(answersData);

        // Fetch messages
        const messagesSnap = await getDocs(collection(db, "messages"));
        const messagesData = messagesSnap.docs.map((doc) => doc.data());

        // Update stats
        setStats({
          totalUsers: usersData.length,
          totalQuestions: questionsData.length,
          totalAnswers: answersData.length,
          totalMessages: messagesData.length,
        });

        // Build recent activity
        const activity = [];
        questionsData.slice(0, 5).forEach((q) => {
          activity.push({
            id: q.id,
            type: "question",
            title: q.title || 'Untitled',
            author: q.authorName || 'Anonymous',
            timestamp: q.createdAt,
          });
        });
        answersData.slice(0, 5).forEach((a) => {
          activity.push({
            id: a.id,
            type: "answer",
            title: (a.content || '').substring(0, 50) + '...',
            author: a.authorName || 'Anonymous',
            timestamp: a.createdAt,
          });
        });

        activity.sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });
        
        setRecentActivity(activity);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchData();
    }

    // Set up real-time listeners
    if (isAdmin) {
      const questionsUnsub = onSnapshot(collection(db, "questions"), () => {
        fetchData();
      });

      const answersUnsub = onSnapshot(collection(db, "answers"), () => {
        fetchData();
      });

      const usersUnsub = onSnapshot(collection(db, "users"), () => {
        fetchData();
      });

      return () => {
        questionsUnsub();
        answersUnsub();
        usersUnsub();
      };
    }
  }, [isAdmin]);

  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteDoc(doc(db, "questions", questionId));
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    try {
      await deleteDoc(doc(db, "answers", answerId));
      setAnswers((prev) => prev.filter((a) => a.id !== answerId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting answer:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setDeleteConfirm(null);
      setShowUserDialog(false);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (error) {
      console.error("Error changing user role:", error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Access Denied</p>
          <p className="text-gray-500">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-700 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-blue-400">
                  {stats.totalUsers}
                </p>
              </div>
              <FiUsers className="w-12 h-12 text-blue-700" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border border-orange-700 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300 mb-1">Total Questions</p>
                <p className="text-3xl font-bold text-orange-400">
                  {stats.totalQuestions}
                </p>
              </div>
              <FiFileText className="w-12 h-12 text-orange-700" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 border border-green-700 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300 mb-1">Total Answers</p>
                <p className="text-3xl font-bold text-green-400">
                  {stats.totalAnswers}
                </p>
              </div>
              <FiMessageSquare className="w-12 h-12 text-green-700" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-700 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300 mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-purple-400">
                  {stats.totalMessages}
                </p>
              </div>
              <FiBell className="w-12 h-12 text-purple-700" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-gray-800 pb-4">
            {["activity", "users", "questions", "answers"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab
                    ? "bg-orange-500 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-400">No recent activity</p>
                ) : (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-2 ${
                          activity.type === 'question' ? 'bg-orange-500/20 text-orange-400' :
                          activity.type === 'answer' ? 'bg-green-500/20 text-green-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {activity.type}
                        </span>
                        <p className="font-semibold truncate text-white">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-400">
                          by {activity.author} •{" "}
                          {activity.timestamp?.toDate ? 
                            formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true }) : 
                            'Recently'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl overflow-x-auto">
              <h2 className="text-xl font-bold mb-4">User Management</h2>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-800">
                  <tr>
                    <th className="text-left py-3 text-gray-400 font-medium">Name</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Email</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Role</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Joined</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                    >
                      <td className="py-3 text-white">{user.displayName}</td>
                      <td className="py-3 text-gray-300">{user.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin" 
                            ? "bg-orange-500/20 text-orange-400" 
                            : "bg-gray-700 text-gray-300"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-gray-400">
                        {user.createdAt?.toDate ? 
                          formatDistanceToNow(user.createdAt.toDate(), { addSuffix: true }) : 
                          'Unknown'}
                      </td>
                      <td className="py-3 flex gap-2">
                        <button
                          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDialog(true);
                          }}
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-red-400"
                          onClick={() =>
                            setDeleteConfirm({ type: "user", id: user.id })
                          }
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === "questions" && (
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">Questions Moderation</h2>
              <div className="space-y-3">
                {questions.slice(0, 10).map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start justify-between p-4 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{q.title}</h3>
                      <p className="text-sm text-gray-400">
                        by {q.authorName} • {q.answers || 0} answers •{" "}
                        {q.viewCount || 0} views
                      </p>
                    </div>
                    <button
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-red-400"
                      onClick={() =>
                        setDeleteConfirm({ type: "question", id: q.id })
                      }
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answers Tab */}
          {activeTab === "answers" && (
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">Answers Moderation</h2>
              <div className="space-y-3">
                {answers.slice(0, 10).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start justify-between p-4 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold line-clamp-2 text-white">
                        {a.content}
                      </p>
                      <p className="text-sm text-gray-400">
                        by {a.authorName} • {a.lampCount || 0} lamps
                      </p>
                    </div>
                    <button
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-red-400"
                      onClick={() =>
                        setDeleteConfirm({ type: "answer", id: a.id })
                      }
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Detail Dialog */}
        {showUserDialog && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-white">{selectedUser.displayName}</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-300">Email</p>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-300">Role</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedUser.role === "user"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() =>
                        handleChangeUserRole(selectedUser.id, "user")
                      }
                    >
                      User
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedUser.role === "admin"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() =>
                        handleChangeUserRole(selectedUser.id, "admin")
                      }
                    >
                      Admin
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-300">Stats</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div className="bg-gray-800 p-2 rounded">
                      <p className="font-semibold text-white">
                        {selectedUser.achievements?.solved || 0}
                      </p>
                      <p className="text-xs text-gray-400">Questions</p>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <p className="font-semibold text-white">
                        {selectedUser.achievements?.contributions || 0}
                      </p>
                      <p className="text-xs text-gray-400">Answers</p>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <p className="font-semibold text-white">
                        {selectedUser.achievements?.helpful || 0}
                      </p>
                      <p className="text-xs text-gray-400">Lamps</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowUserDialog(false)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirm({ type: "user", id: selectedUser.id });
                      setShowUserDialog(false);
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-red-400 font-semibold py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-2 text-white">Confirm Delete</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 rounded-lg border border-red-500/30"
                  onClick={() => {
                    if (deleteConfirm.type === "user") {
                      handleDeleteUser(deleteConfirm.id);
                    } else if (deleteConfirm.type === "question") {
                      handleDeleteQuestion(deleteConfirm.id);
                    } else if (deleteConfirm.type === "answer") {
                      handleDeleteAnswer(deleteConfirm.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}