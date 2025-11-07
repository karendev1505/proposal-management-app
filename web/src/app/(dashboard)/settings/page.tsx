'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: 'Demo User',
    email: 'demo@example.com',
    company: 'Your Company',
    phone: '+1 (555) 123-4567',
    timezone: 'America/New_York',
    language: 'en',
  });

  const [emailSettings, setEmailSettings] = useState({
    signature: 'Best regards,\nDemo User\nYour Company\ndemo@example.com',
    notifications: {
      proposalSigned: true,
      emailDelivered: true,
      reminderDue: true,
      systemUpdates: false,
    },
    autoReply: false,
    autoReplyMessage: '',
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '24',
    loginNotifications: true,
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailSettingChange = (field: string, value: string | boolean) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setEmailSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  const handleSecurityChange = (field: string, value: string | boolean) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (section: string) => {
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`${section} settings saved successfully!`);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Company</label>
                      <Input
                        value={profileData.company}
                        onChange={(e) => handleProfileChange('company', e.target.value)}
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Timezone</label>
                      <Select
                        value={profileData.timezone}
                        onChange={(e) => handleProfileChange('timezone', e.target.value)}
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Language</label>
                      <Select
                        value={profileData.language}
                        onChange={(e) => handleProfileChange('language', e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="uk">Українська</option>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => handleSave('Profile')}>
                      Save Profile Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'email' && (
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Signature</label>
                    <Textarea
                      value={emailSettings.signature}
                      onChange={(e) => handleEmailSettingChange('signature', e.target.value)}
                      placeholder="Your email signature..."
                      rows={6}
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      This signature will be automatically added to all outgoing emails
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="autoReply"
                        checked={emailSettings.autoReply}
                        onChange={(e) => handleEmailSettingChange('autoReply', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="autoReply" className="ml-2 block text-sm font-medium">
                        Enable Auto-Reply
                      </label>
                    </div>
                    {emailSettings.autoReply && (
                      <Textarea
                        value={emailSettings.autoReplyMessage}
                        onChange={(e) => handleEmailSettingChange('autoReplyMessage', e.target.value)}
                        placeholder="Auto-reply message..."
                        rows={4}
                      />
                    )}
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => handleSave('Email')}>
                      Save Email Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Proposal Signed</p>
                          <p className="text-sm text-gray-600">Get notified when a proposal is signed</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailSettings.notifications.proposalSigned}
                          onChange={(e) => handleNotificationChange('proposalSigned', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Delivered</p>
                          <p className="text-sm text-gray-600">Get notified when emails are delivered</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailSettings.notifications.emailDelivered}
                          onChange={(e) => handleNotificationChange('emailDelivered', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Reminder Due</p>
                          <p className="text-sm text-gray-600">Get notified about upcoming reminders</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailSettings.notifications.reminderDue}
                          onChange={(e) => handleNotificationChange('reminderDue', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">System Updates</p>
                          <p className="text-sm text-gray-600">Get notified about system maintenance and updates</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailSettings.notifications.systemUpdates}
                          onChange={(e) => handleNotificationChange('systemUpdates', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => handleSave('Notifications')}>
                      Save Notification Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorEnabled}
                      onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Session Timeout (hours)</label>
                    <Select
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                    >
                      <option value="1">1 hour</option>
                      <option value="8">8 hours</option>
                      <option value="24">24 hours</option>
                      <option value="168">1 week</option>
                      <option value="720">1 month</option>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Login Notifications</p>
                      <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.loginNotifications}
                      onChange={(e) => handleSecurityChange('loginNotifications', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button onClick={() => handleSave('Security')}>
                      Save Security Settings
                    </Button>
                    <div className="pt-2">
                      <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
