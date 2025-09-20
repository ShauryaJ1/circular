'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  return (
    <MainLayout title="Settings">
      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Project Name</label>
              <Input defaultValue="Circular Browser Testing" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Default Timeout (ms)</label>
              <Input defaultValue="30000" type="number" className="mt-1" />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="auto-retry" defaultChecked />
              <label htmlFor="auto-retry" className="text-sm">
                Enable automatic retry on failure
              </label>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Provider</label>
              <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Anthropic Claude</option>
                <option>Google Gemini</option>
                <option>OpenAI GPT</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">API Key</label>
              <Input type="password" placeholder="Enter your API key" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Model</label>
              <Input defaultValue="claude-sonnet-4-20250514" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Browser Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="headless" />
              <label htmlFor="headless" className="text-sm">
                Run browser in headless mode
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="devtools" defaultChecked />
              <label htmlFor="devtools" className="text-sm">
                Enable DevTools
              </label>
            </div>
            <div>
              <label className="text-sm font-medium">Browser Executable Path</label>
              <Input placeholder="Auto-detect" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="email-notifications" defaultChecked />
              <label htmlFor="email-notifications" className="text-sm">
                Email notifications for failed runs
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="slack-notifications" />
              <label htmlFor="slack-notifications" className="text-sm">
                Slack notifications
              </label>
            </div>
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" placeholder="your@email.com" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>Save Settings</Button>
        </div>
      </div>
    </MainLayout>
  )
}
