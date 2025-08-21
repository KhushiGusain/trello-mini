'use client'

import { useState } from 'react'

export default function ActivitySidebar({ isCollapsed, onToggleCollapse }) {
  const [showAllActivities, setShowAllActivities] = useState(false)

  const toggleShowAllActivities = () => {
    setShowAllActivities(!showAllActivities)
  }

  if (isCollapsed) {
    return (
      <div className="bg-white border-l border-[#e5e7eb] transition-all duration-300 ease-in-out w-16">
        <div className="p-4">
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 bg-[#3a72ee] text-white rounded-lg flex items-center justify-center hover:bg-[#2456f1] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-l border-[#e5e7eb] transition-all duration-300 ease-in-out w-80">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-[#e5e7eb] flex items-center justify-between">
          <h3 className="text-[#0c2144] font-semibold text-sm">Activity</h3>
          <button
            onClick={onToggleCollapse}
            className="w-6 h-6 text-[#6b7a90] hover:text-[#0c2144] hover:bg-gray-100 rounded flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">KG</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0c2144]">
                  <span className="font-medium">khushi gusain</span> added <span className="text-[#3a72ee] font-medium">"Design new landing page"</span> to <span className="text-[#3a72ee] font-medium">"In Progress"</span>
                </p>
                <p className="text-xs text-[#6b7a90] mt-1">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">KG</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0c2144]">
                  <span className="font-medium">khushi gusain</span> added <span className="text-[#3a72ee] font-medium">"Fix login bug"</span> to <span className="text-[#3a72ee] font-medium">"To Do"</span>
                </p>
                <p className="text-xs text-[#6b7a90] mt-1">5 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">KG</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0c2144]">
                  <span className="font-medium">khushi gusain</span> added <span className="text-[#3a72ee] font-medium">"Update user dashboard"</span> to <span className="text-[#3a72ee] font-medium">"Testing"</span>
                </p>
                <p className="text-xs text-[#6b7a90] mt-1">12 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">KG</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0c2144]">
                  <span className="font-medium">khushi gusain</span> created <span className="text-[#3a72ee] font-medium">"Testing"</span> list
                </p>
                <p className="text-xs text-[#6b7a90] mt-1">25 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">KG</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0c2144]">
                  <span className="font-medium">khushi gusain</span> added this board to <span className="text-[#3a72ee] font-medium">"Trello Workspace"</span>
                </p>
                <p className="text-xs text-[#6b7a90] mt-1">1 hour ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">KG</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0c2144]">
                  <span className="font-medium">khushi gusain</span> moved <span className="text-[#3a72ee] font-medium">"API documentation"</span> to <span className="text-[#3a72ee] font-medium">"Done"</span>
                </p>
                <p className="text-xs text-[#6b7a90] mt-1">1.5 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">KG</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0c2144]">
                  <span className="font-medium">khushi gusain</span> updated <span className="text-[#3a72ee] font-medium">"Database optimization"</span>
                </p>
                <p className="text-xs text-[#6b7a90] mt-1">2 hours ago</p>
              </div>
            </div>

            {!showAllActivities && (
              <button
                onClick={toggleShowAllActivities}
                className="w-full text-xs text-[#3a72ee] hover:text-[#2456f1] font-medium transition-colors cursor-pointer py-2 hover:bg-gray-50 rounded"
              >
                Show more activities
              </button>
            )}

            {showAllActivities && (
              <>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">KG</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0c2144]">
                      <span className="font-medium">khushi gusain</span> renamed <span className="text-[#3a72ee] font-medium">"Backlog"</span> to <span className="text-[#3a72ee] font-medium">"To Do"</span>
                    </p>
                    <p className="text-xs text-[#6b7a90] mt-1">2.5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">KG</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0c2144]">
                      <span className="font-medium">khushi gusain</span> archived <span className="text-[#3a72ee] font-medium">"Old feature request"</span>
                    </p>
                    <p className="text-xs text-[#6b7a90] mt-1">3 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">KG</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0c2144]">
                      <span className="font-medium">khushi gusain</span> set due date for <span className="text-[#3a72ee] font-medium">"User testing"</span> to <span className="text-[#3a72ee] font-medium">Dec 15</span>
                    </p>
                    <p className="text-xs text-[#6b7a90] mt-1">4 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">KG</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0c2144]">
                      <span className="font-medium">khushi gusain</span> added label <span className="text-[#3a72ee] font-medium">"Bug"</span> to <span className="text-[#3a72ee] font-medium">"Fix navigation"</span>
                    </p>
                    <p className="text-xs text-[#6b7a90] mt-1">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">KG</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0c2144]">
                      <span className="font-medium">khushi gusain</span> commented on <span className="text-[#3a72ee] font-medium">"API Integration"</span>
                    </p>
                    <p className="text-xs text-[#6b7a90] mt-1">6 hours ago</p>
                  </div>
                </div>

                <button
                  onClick={toggleShowAllActivities}
                  className="w-full text-xs text-[#6b7a90] hover:text-[#0c2144] font-medium transition-colors cursor-pointer py-2 hover:bg-gray-50 rounded"
                >
                  Show less
                </button>
              </>
            )}

            <div className="text-center">
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
