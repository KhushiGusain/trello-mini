'use client'

import { Modal, Button } from '@/components/ui'

export function DeleteBoardModal({ 
  isOpen, 
  onClose, 
  boardToDelete, 
  onConfirmDelete, 
  isDeleting 
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete board">
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <div className="w-10 h-10 rounded" style={{ backgroundColor: boardToDelete?.backgroundColor }} />
          <div>
            <p className="font-medium" style={{ color: 'var(--color-navy)' }}>
              {boardToDelete?.title}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {boardToDelete?.workspace} • {boardToDelete?.visibility}
            </p>
          </div>
        </div>
        
        <p className="text-sm" style={{ color: 'var(--color-navy)' }}>
          Are you sure you want to delete this board? This action cannot be undone and will permanently remove all lists, cards, and comments.
        </p>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={onConfirmDelete}
            disabled={isDeleting}
            style={{ backgroundColor: 'var(--color-error)' }}
            className="hover:bg-red-600"
          >
            {isDeleting ? 'Deleting...' : 'Delete board'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
