import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, Activity, Heart, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useHealthData } from '../../contexts/HealthDataContext';
import { format } from 'date-fns';

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'tip' | 'achievement';
  read: boolean;
  timestamp: Date;
  link?: string;
}

// Utility functions
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'reminder':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'alert':
      return <Activity className="h-5 w-5 text-red-500" />;
    case 'tip':
      return <Calendar className="h-5 w-5 text-green-500" />;
    case 'achievement':
      return <Heart className="h-5 w-5 text-purple-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { healthMetrics } = useHealthData();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate notifications based on health data
  useEffect(() => {
    if (user && healthMetrics.length > 0) {
      generateNotifications();
    }
  }, [user, healthMetrics]);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];
    
    // Check if user hasn't added metrics in the last 2 days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const latestMetric = healthMetrics[0];
    if (latestMetric && new Date(latestMetric.date) < twoDaysAgo) {
      newNotifications.push({
        id: 'reminder-log-metrics',
        title: 'Time to log your health metrics',
        message: "It's been a while since you last logged your health data. Regular tracking helps you stay on top of your health.",
        type: 'reminder',
        read: false,
        timestamp: new Date(),
        link: '/dashboard'
      });
    }
    
    // Check for high blood glucose
    const highGlucoseReadings = healthMetrics
      .filter(metric => metric.blood_glucose && metric.blood_glucose > 180)
      .slice(0, 3);
      
    if (highGlucoseReadings.length >= 2) {
      newNotifications.push({
        id: 'alert-high-glucose',
        title: 'High Blood Glucose Alert',
        message: "You've had multiple high blood glucose readings recently. Consider checking in with your healthcare provider.",
        type: 'alert',
        read: false,
        timestamp: new Date(),
        link: '/dashboard'
      });
    }
    
    // Add daily tip
    newNotifications.push({
      id: `tip-${new Date().toDateString()}`,
      title: 'Daily Health Tip',
      message: "Drinking water before meals can help regulate blood sugar and reduce hunger, leading to better meal choices.",
      type: 'tip',
      read: false,
      timestamp: new Date()
    });
    
    // Check for achievement (e.g., 7 days of logging data)
    const uniqueDates = new Set(healthMetrics.map(metric => metric.date));
    if (uniqueDates.size >= 7) {
      newNotifications.push({
        id: 'achievement-week-streak',
        title: 'Week-long Tracking Streak!',
        message: "You've tracked your health metrics for a full week. Consistent tracking is key to managing your health!",
        type: 'achievement',
        read: false,
        timestamp: new Date()
      });
    }
    
    // Add reminder for medication if user has diabetes medications
    newNotifications.push({
      id: `reminder-medication-${new Date().toDateString()}`,
      title: 'Medication Reminder',
      message: "Don't forget to take your medication as prescribed by your healthcare provider.",
      type: 'reminder',
      read: false,
      timestamp: new Date()
    });
    
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      {/* Notification bell with badge */}
      <button 
        className="relative p-1.5 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Notifications</h3>
            <div className="flex space-x-2">
              <button 
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 hover:bg-gray-50 transition-colors ${notification.read ? 'opacity-70' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 mt-0.5 mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm">{notification.title}</p>
                        <p className="text-gray-600 text-xs mt-0.5">{notification.message}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-500 text-xs">
                            {format(notification.timestamp, 'MMM d, h:mm a')}
                          </span>
                          {notification.link && (
                            <a 
                              href={notification.link} 
                              className="text-blue-600 text-xs flex items-center hover:text-blue-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            )}
          </div>
          
          <div className="p-3 bg-gray-50 border-t">
            <button 
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;