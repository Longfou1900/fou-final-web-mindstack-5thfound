//src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../firebase/config";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { Card } from "../components/ui/card";  
import { Button } from "../components/ui/button";  
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../components/ui/avatar";

import { FiEdit2, FiSave } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { currentUser, userProfile, logout, loading: authLoading } = useAuth();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const [userQuestions, setUserQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);

  // Load profile data
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setBio(userProfile.bio || "");
    }
  }, [userProfile]);

  // Load user content
  useEffect(() => {
    const fetchUserContent = async () => {
      if (!currentUser) return;

      const qSnap = await getDocs(
        query(
          collection(db, "questions"),
          where("authorId", "==", currentUser.uid)
        )
      );

      setUserQuestions(qSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const aSnap = await getDocs(
        query(
          collection(db, "answers"),
          where("authorId", "==", currentUser.uid)
        )
      );

      setUserAnswers(aSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    fetchUserContent();
  }, [currentUser]);

  // Update profile
  const handleUpdateProfile = async () => {
    if (!currentUser || !displayName.trim()) return;

    setLoading(true);

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName: displayName.trim(),
        bio: bio.trim(),
      });

      setEditing(false);
    } finally {
      setLoading(false);
    }
  };
  // Prevent rendering if data isn't ready
  if (authLoading || !userProfile) {
    return <div className="text-center py-20 text-white">Loading user data...</div>;
  }

  // Avatar initials
  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* PROFILE HEADER */}
          <Card className="p-6 rounded-2xl shadow-sm border bg-white mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userProfile?.avatar} />
                <AvatarFallback className="text-xl font-bold bg-indigo-100 text-indigo-600">
                  {getInitials(userProfile?.displayName || "User")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                {editing ? (
                  <div className="space-y-2">
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="text-2xl font-bold"
                      disabled={loading}
                    />

                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      disabled={loading}
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold">
                      {userProfile?.displayName}
                    </h1>

                    <p className="text-gray-500 text-sm">
                      {userProfile?.email}
                    </p>

                    {bio && (
                      <p className="text-sm mt-2 text-gray-700">{bio}</p>
                    )}
                  </>
                )}
              </div>

              {editing ? (
                <Button onClick={handleUpdateProfile} disabled={loading}>
                  <FiSave className="mr-2" /> Save
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  <FiEdit2 className="mr-2" /> Edit
                </Button>
              )}
            </div>

            {/* LEVEL BAR */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-1 text-gray-600">
                <span>Level 12</span>
                <span>720 / 1000 XP</span>
              </div>

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-[72%] bg-gradient-to-r from-blue-500 to-purple-500" />
              </div>
            </div>
          </Card>

          {/* BADGES */}
          <Card className="p-6 rounded-2xl shadow-sm border bg-white mb-6">
            <h2 className="font-semibold mb-4">Badges</h2>

            <div className="grid grid-cols-3 gap-4 text-center">
              <BadgeBox value="3" label="Gold" color="yellow" />
              <BadgeBox value="8" label="Silver" color="gray" />
              <BadgeBox value="15" label="Bronze" color="orange" />
            </div>
          </Card>

          {/* STATS */}
          <Card className="p-6 rounded-2xl shadow-sm border bg-white mb-6">
            <h2 className="font-semibold mb-4">Stats</h2>

            <div className="grid grid-cols-4 gap-4 text-center">
              <StatBox value="4,720" label="XP Earned" />
              <StatBox value={userQuestions.length} label="Questions" />
              <StatBox value={userAnswers.length} label="Answers" />
              <StatBox value="12" label="Challenges" />
            </div>
          </Card>

          {/* QUESTIONS TAB */}
          <Card className="p-6 rounded-2xl shadow-sm border bg-white">
            <div className="flex gap-6 border-b mb-6 pb-2 text-sm font-medium">
              <span className="text-blue-600 border-b-2 border-blue-600 pb-2">
                Questions
              </span>
              <span className="text-gray-500">Answers</span>
              <span className="text-gray-500">Achievements</span>
              <span className="text-gray-500">Activity</span>
            </div>

            {userQuestions.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                Questions content coming soon...
              </p>
            ) : (
              userQuestions.map((q) => (
                <Link key={q.id} to={`/question/${q.id}`}>
                  <div className="p-4 rounded-lg border hover:bg-gray-50 mb-3">
                    <h3 className="font-semibold">{q.title}</h3>
                  </div>
                </Link>
              ))
            )}
          </Card>

          {/* LOGOUT */}
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={logout}
              className="text-red-600 border-red-300"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
  );
}

// -------- Components --------

function StatBox({ value, label }) {
  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function BadgeBox({ value, label, color }) {
  const colors = {
    yellow: "bg-yellow-50 text-yellow-600",
    gray: "bg-gray-100 text-gray-700",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}