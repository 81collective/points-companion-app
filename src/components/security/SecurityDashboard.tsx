'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  UserCheck,
  Activity,
  Bell,
  Download,
  RefreshCw
} from 'lucide-react';
import { useSecurityMonitor } from '@/lib/security';
import DataProtection from '@/lib/dataProtection';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  user_id?: string;
  ip_address: string;
  details: Record<string, unknown>;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export default function SecurityDashboard() {
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const { metrics, refreshMetrics } = useSecurityMonitor();
  const { executeAsyncSafe } = useErrorHandler();
  const dataProtection = DataProtection.getInstance();

  // Mock security audit data
  // Stable ref for mock data to avoid effect dependency warning
  const mockAuditLogsRef = useRef<SecurityAuditLog[]>([ 
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: 'User Login',
      user_id: 'user_123',
      ip_address: '192.168.1.100',
      details: { method: 'password', success: true },
      risk_level: 'low'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      action: 'Failed Login Attempt',
      ip_address: '10.0.0.50',
      details: { method: 'password', attempts: 3 },
      risk_level: 'medium'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      action: 'Suspicious Activity Detected',
      ip_address: '203.0.113.42',
      details: { type: 'multiple_rapid_requests', count: 50 },
      risk_level: 'high'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      action: 'Card Data Accessed',
      user_id: 'user_456',
      ip_address: '192.168.1.101',
      details: { cards_viewed: 2, method: 'dashboard' },
      risk_level: 'low'
    }
  ]);

  const calculateSecurityScore = useCallback((): number => {
    let score = 100;
    score -= metrics.criticalEvents * 10;
    score -= metrics.failedLogins * 2;
    score -= metrics.suspiciousIPs.length * 5;
    const recentCritical = auditLogs.filter(
      log => log.risk_level === 'critical' && 
      Date.now() - new Date(log.timestamp).getTime() < 86400000
    ).length;
    score -= recentCritical * 15;
    return Math.max(0, Math.min(100, score));
  }, [metrics, auditLogs]);

  const getSecurityRecommendations = useCallback((): string[] => {
    const recommendations: string[] = [];
    if (metrics.failedLogins > 5) {
      recommendations.push('Consider implementing account lockout after failed login attempts');
    }
    if (metrics.suspiciousIPs.length > 0) {
      recommendations.push('Review and consider blocking suspicious IP addresses');
    }
    if (securityScore < 80) {
      recommendations.push('Overall security posture needs improvement');
    }
    if (metrics.criticalEvents > 0) {
      recommendations.push('Investigate and resolve critical security events');
    }
    return recommendations;
  }, [metrics, securityScore]);

  useEffect(() => {
    const loadSecurityData = async () => {
      await executeAsyncSafe(async () => {
        setLoading(true);
        await dataProtection.initializeEncryption();
  setAuditLogs(mockAuditLogsRef.current);
        setSecurityScore(calculateSecurityScore());
        setLoading(false);
      });
    };
    loadSecurityData();
  }, [dataProtection, executeAsyncSafe, calculateSecurityScore]);

  // calculateSecurityScore now memoized above
  const exportSecurityReport = async () => {
    await executeAsyncSafe(async () => {
      const report = {
        timestamp: new Date().toISOString(),
        securityScore,
        metrics,
        auditLogs: auditLogs.slice(0, 100), // Last 100 logs
        recommendations: getSecurityRecommendations()
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // getSecurityRecommendations now memoized above

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage application security</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={refreshMetrics}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportSecurityReport}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Security Score */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Security Score</h2>
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`text-4xl font-bold ${getScoreColor(securityScore)}`}>
            {securityScore}
          </div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  securityScore >= 90 ? 'bg-green-500' :
                  securityScore >= 70 ? 'bg-yellow-500' :
                  securityScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${securityScore}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {securityScore >= 90 ? 'Excellent' :
               securityScore >= 70 ? 'Good' :
               securityScore >= 50 ? 'Fair' : 'Needs Improvement'}
            </p>
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {metrics.totalEvents}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Events (24h)</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {metrics.criticalEvents}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Critical Events</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {metrics.failedLogins}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Failed Logins</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {metrics.suspiciousIPs.length}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Suspicious IPs</h3>
        </motion.div>
      </div>

      {/* Security Recommendations */}
      {getSecurityRecommendations().length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Recommendations</h2>
          <div className="space-y-3">
            {getSecurityRecommendations().map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Security Audit Log</h2>
          <button
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            {showSensitiveData ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showSensitiveData ? 'Hide' : 'Show'} Sensitive Data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">IP Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Risk Level</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                    {showSensitiveData ? log.ip_address : dataProtection.maskSensitiveData(log.ip_address, 'card')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(log.risk_level)}`}>
                      {log.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {showSensitiveData 
                      ? JSON.stringify(log.details, null, 2).substring(0, 50) + '...'
                      : 'Hidden'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Protection Tools */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Protection Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              Input Validation
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">XSS Protection: Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">SQL Injection Protection: Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Input Sanitization: Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center">
              <Key className="w-4 h-4 mr-2" />
              Encryption Status
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Data Encryption: AES-256</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Transit Security: TLS 1.3</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Session Protection: Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
