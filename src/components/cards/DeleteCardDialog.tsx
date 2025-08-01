// DeleteCardDialog.tsx: confirmation dialog for deleting a card
import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Trash2 } from 'lucide-react'

interface DeleteCardDialogProps {
  open: boolean
  onClose: () => void
  onDelete: () => void
  loading?: boolean
  error?: string
}

const DeleteCardDialog: React.FC<DeleteCardDialogProps> = ({ open, onClose, onDelete, loading, error }) => (
  <Dialog.Root open={open} onOpenChange={onClose}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30 z-50" />
      <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
          <Trash2 className="w-10 h-10 text-red-600 mb-2" />
          <h2 className="text-lg font-bold text-red-700 mb-2">Delete Card?</h2>
          <p className="text-gray-700 text-center mb-2">Are you sure you want to delete this card? This action cannot be undone.</p>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex gap-2 mt-2 w-full">
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition flex-1"
              onClick={onDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)

export default DeleteCardDialog
