import { motion, AnimatePresence } from 'framer-motion';
import { NotebookEditor } from './NotebookEditor';
import type { NotebookEntry } from '@/types';

interface EditNotebookModalProps {
  isOpen: boolean;
  entry: NotebookEntry | null;
  onClose: () => void;
}

export function EditNotebookModal({ isOpen, entry, onClose }: EditNotebookModalProps) {
  if (!isOpen || !entry) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute inset-4 md:inset-10 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          <NotebookEditor
            mode="edit"
            entry={entry}
            onClose={onClose}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}