'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Crown, 
  Share2,
  Eye,
  EyeOff,
  Bell,
  DollarSign,
  CreditCard,
  Award,
  TrendingUp,
  Activity,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HouseholdMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'offline';
  lastActive: string;
  permissions: {
    viewTransactions: boolean;
    manageCards: boolean;
    viewRecommendations: boolean;
    manageHousehold: boolean;
  };
}

interface SharedMetric {
  id: string;
  label: string;
  value: string | number;
  memberContribution: { [key: string]: number };
  visible: boolean;
  trend?: 'up' | 'down' | 'stable';
}

const HouseholdCollaboration: React.FC = () => {
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [sharedMetrics, setSharedMetrics] = useState<SharedMetric[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isOwner] = useState(true); // owner flag retained; setter removed as unused
  const { user } = useAuth();

  useEffect(() => {
    initializeHouseholdData();
  }, [user]);

  const initializeHouseholdData = () => {
    // Mock household data - in real app this would come from API
    setHouseholdMembers([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'owner',
        status: 'active',
        lastActive: new Date().toISOString(),
        permissions: {
          viewTransactions: true,
          manageCards: true,
          viewRecommendations: true,
          manageHousehold: true
        }
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
        status: 'active',
        lastActive: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        permissions: {
          viewTransactions: true,
          manageCards: true,
          viewRecommendations: true,
          manageHousehold: false
        }
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'member',
        status: 'offline',
        lastActive: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        permissions: {
          viewTransactions: false,
          manageCards: false,
          viewRecommendations: true,
          manageHousehold: false
        }
      }
    ]);

    setSharedMetrics([
      {
        id: 'household_spending',
        label: 'Household Spending',
        value: 5247.80,
        memberContribution: { '1': 2500, '2': 1800, '3': 947.80 },
        visible: true,
        trend: 'up'
      },
      {
        id: 'total_points',
        label: 'Total Points Earned',
        value: 89650,
        memberContribution: { '1': 45000, '2': 32000, '3': 12650 },
        visible: true,
        trend: 'up'
      },
      {
        id: 'active_cards',
        label: 'Active Cards',
        value: 12,
        memberContribution: { '1': 5, '2': 4, '3': 3 },
        visible: true,
        trend: 'stable'
      },
      {
        id: 'welcome_bonuses',
        label: 'Welcome Bonuses in Progress',
        value: 4,
        memberContribution: { '1': 2, '2': 1, '3': 1 },
        visible: false
      }
    ]);
  };

  const handleInviteMember = () => {
    if (!inviteEmail) return;

    // In real app, this would send an API request
    console.log('Inviting member:', inviteEmail);
    
    const newMember: HouseholdMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'member',
      status: 'pending',
      lastActive: new Date().toISOString(),
      permissions: {
        viewTransactions: false,
        manageCards: false,
        viewRecommendations: true,
        manageHousehold: false
      }
    };

    setHouseholdMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    setShowInviteForm(false);
  };

  const toggleMetricVisibility = (metricId: string) => {
    setSharedMetrics(prev => prev.map(metric => 
      metric.id === metricId 
        ? { ...metric, visible: !metric.visible }
        : metric
    ));
  };

  const _updateMemberPermissions = (memberId: string, permission: keyof HouseholdMember['permissions']) => {
    setHouseholdMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { 
            ...member, 
            permissions: { 
              ...member.permissions, 
              [permission]: !member.permissions[permission] 
            }
          }
        : member
    ));
  };

  const getRoleIcon = (role: HouseholdMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Settings className="w-4 h-4 text-blue-500" />;
      case 'member':
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: HouseholdMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
    }
  };

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'household_spending':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'total_points':
        return <Award className="w-5 h-5 text-purple-600" />;
      case 'active_cards':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'welcome_bonuses':
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Household Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Household Members</h2>
          </div>
          
          {isOwner && (
            <button
              onClick={() => setShowInviteForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          )}
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div className="flex items-center space-x-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleInviteMember}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Invite
              </button>
              <button
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Members List */}
        <div className="space-y-4">
          {householdMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    {getRoleIcon(member.role)}
                  </div>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <p className="text-xs text-gray-500">Last active: {formatLastActive(member.lastActive)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  member.status === 'active' ? 'bg-green-100 text-green-800' :
                  member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {member.status}
                </span>
                
                {isOwner && member.role !== 'owner' && (
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Share2 className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Shared Metrics</h2>
          </div>
          
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <Settings className="w-4 h-4" />
            <span>Manage Sharing</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sharedMetrics.map((metric) => (
            <motion.div
              key={metric.id}
              className={`p-4 border-2 rounded-lg transition-all ${
                metric.visible 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getMetricIcon(metric.id)}
                  <h3 className="font-medium text-gray-900">{metric.label}</h3>
                </div>
                
                <button
                  onClick={() => toggleMetricVisibility(metric.id)}
                  className={`p-1 rounded transition-colors ${
                    metric.visible 
                      ? 'text-green-600 hover:text-green-700' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {metric.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="mb-3">
                <p className="text-2xl font-bold text-gray-900">
                  {typeof metric.value === 'number' && metric.id === 'household_spending' ? 
                    `$${metric.value.toLocaleString()}` : 
                    metric.value.toLocaleString()
                  }
                </p>
                {metric.trend && (
                  <div className={`flex items-center text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <TrendingUp className={`w-3 h-3 mr-1 ${
                      metric.trend === 'down' ? 'rotate-180' : ''
                    }`} />
                    <span>{metric.trend === 'up' ? 'Increasing' : metric.trend === 'down' ? 'Decreasing' : 'Stable'}</span>
                  </div>
                )}
              </div>

              {metric.visible && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Member Contributions</p>
                  {Object.entries(metric.memberContribution).map(([memberId, contribution]) => {
                    const member = householdMembers.find(m => m.id === memberId);
                    if (!member) return null;
                    
                    const percentage = (contribution / (typeof metric.value === 'number' ? metric.value : 0)) * 100;
                    
                    return (
                      <div key={memberId} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{member.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {metric.id === 'household_spending' ? 
                              `$${contribution.toLocaleString()}` : 
                              contribution.toLocaleString()
                            }
                          </span>
                          <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Collaboration Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <LinkIcon className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Collaboration Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <Bell className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Shared Notifications</h3>
            <p className="text-sm text-gray-600">Get notified when family members make purchases or earn rewards</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Joint Goals</h3>
            <p className="text-sm text-gray-600">Set and track welcome bonus goals together as a household</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <Share2 className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Shared Insights</h3>
            <p className="text-sm text-gray-600">Access combined analytics and recommendations for your household</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseholdCollaboration;
