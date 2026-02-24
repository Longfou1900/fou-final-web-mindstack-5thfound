// src/components/QuestionCard.jsx
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FiMessageCircle, FiEye } from 'react-icons/fi';

export default function QuestionCard({
  id,
  title,
  description,
  author,
  tags,
  createdAt,
  viewCount,
  answerCount,
  status,
}) {
  const timeAgo = createdAt?.toDate ? formatDistanceToNow(createdAt.toDate(), { addSuffix: true }) : 'Recently';

  const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <Link to={`/question/${id}`} className="block">
      <div className="bg-gray-900 p-4 rounded-xl hover:shadow-lg transition-shadow cursor-pointer border border-gray-800">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-white hover:text-orange-400 line-clamp-2 flex-1">
            {title}
          </h3>
          <span className={`ml-2 flex-shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
            {status}
          </span>
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs border border-gray-700">
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs border border-gray-700">
              +{tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <FiMessageCircle className="w-4 h-4" />
              <span>{answerCount} answer{answerCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiEye className="w-4 h-4" />
              <span>{viewCount} views</span>
            </div>
          </div>
          <div className="text-xs">
            by <span className="font-semibold text-gray-300">{author}</span> {timeAgo}
          </div>
        </div>
      </div>
    </Link>
  );
}