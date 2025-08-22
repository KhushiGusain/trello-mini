'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'

export default function BoardMembersModal({ 
  isOpen, 
  onClose, 
  boardId, 
  currentUser,
  onMemberUpdate 
}) {
  const [members, setMembers] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchMembers()
    }
  }, [isOpen, boardId])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}/members`)
      if (!response.ok) throw new Error('Failed to fetch members')
      const data = await response.json()
      setMembers(data)
    } catch (err) {
      console.error('Error fetching members:', err)
      setError('Failed to load members')
    }
  }

  const handleInviteMember = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/boards/${boardId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite member')
      }

      setSuccess('Member invited successfully')
      setInviteEmail('')
      fetchMembers()
      if (onMemberUpdate) onMemberUpdate()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this board?`)) {
      return
    }

    try {
      const response = await fetch(`/api/boards/${boardId}/members?member_id=${memberId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member')
      }

      setSuccess('Member removed successfully')
      fetchMembers()
      if (onMemberUpdate) onMemberUpdate()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Board Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Member</h3>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !inviteEmail.trim()}
                className="w-full"
              >
                {loading ? 'Inviting...' : 'Invite Member'}
              </Button>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Members</h3>
            <div className="space-y-3">
              {members.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No members found</p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {member.display_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.display_name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <p className="text-xs text-gray-400">
                          {member.role === 'owner' ? 'Owner' : 'Editor'}
                        </p>
                      </div>
                    </div>
                    {member.id !== currentUser?.id && member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.display_name)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
