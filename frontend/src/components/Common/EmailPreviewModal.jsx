// src/components/Common/EmailPreviewModal.jsx
import React from 'react';

const EmailPreviewModal = ({ email, onClose }) => {
  if (!email) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Email Preview</h2>
            <p className="text-sm text-gray-500">To: {email.to}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 text-xs rounded-full ${
              email.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {email.status || 'Sent'}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
        </div>
        <div className="p-0 overflow-auto max-h-[calc(90vh-80px)]">
          <iframe
            srcDoc={email.content || email.html}
            title="Email Preview"
            className="w-full h-[600px] border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailPreviewModal;