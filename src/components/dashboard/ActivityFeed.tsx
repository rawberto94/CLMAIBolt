import React from 'react';
import { UserPlus, FileText, Eye, Edit, Download, MessageSquare } from 'lucide-react';

interface ActivityItem {
  id: string;
  action: 'uploaded' | 'viewed' | 'edited' | 'commented' | 'downloaded' | 'added';
  user: {
    name: string;
    avatar: string;
  };
  subject: string;
  timestamp: string;
}

const activities: ActivityItem[] = [
  {
    id: 'act1',
    action: 'uploaded',
    user: {
      name: 'Jane Smith',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120',
    },
    subject: 'Q1 Financial Compliance Report',
    timestamp: '20 minutes ago',
  },
  {
    id: 'act2',
    action: 'commented',
    user: {
      name: 'Robert Wilson',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=120',
    },
    subject: 'Service Agreement - Tech Partners',
    timestamp: '1 hour ago',
  },
  {
    id: 'act3',
    action: 'edited',
    user: {
      name: 'Sarah Zhang',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120',
    },
    subject: 'NDA Template',
    timestamp: '2 hours ago',
  },
  {
    id: 'act4',
    action: 'viewed',
    user: {
      name: 'Mike Johnson',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120',
    },
    subject: 'Intellectual Property Agreement',
    timestamp: '3 hours ago',
  },
  {
    id: 'act5',
    action: 'downloaded',
    user: {
      name: 'Alex Nguyen',
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=120',
    },
    subject: 'Insurance Policy Contract',
    timestamp: '5 hours ago',
  },
  {
    id: 'act6',
    action: 'added',
    user: {
      name: 'Emily Davis',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120',
    },
    subject: 'New Team Member',
    timestamp: '1 day ago',
  },
];

const getActionIcon = (action: string) => {
  switch (action) {
    case 'uploaded':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'viewed':
      return <Eye className="h-4 w-4 text-gray-500" />;
    case 'edited':
      return <Edit className="h-4 w-4 text-yellow-500" />;
    case 'commented':
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    case 'downloaded':
      return <Download className="h-4 w-4 text-purple-500" />;
    case 'added':
      return <UserPlus className="h-4 w-4 text-indigo-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

const ActivityFeed: React.FC = () => {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <img
                    className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white"
                    src={activity.user.avatar}
                    alt={activity.user.name}
                  />
                  <span className="absolute -bottom-0.5 -right-1 bg-white rounded-tl p-0.5">
                    {getActionIcon(activity.action)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <a href="#user" className="font-medium text-gray-900">
                        {activity.user.name}
                      </a>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{activity.timestamp}</p>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>
                      {activity.action === 'added' ? 'Added ' : ''}
                      {activity.action === 'added' ? (
                        <span className="font-medium text-gray-900">{activity.subject}</span>
                      ) : (
                        <>
                          {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}{' '}
                          <span className="font-medium text-gray-900">{activity.subject}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;