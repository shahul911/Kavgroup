import React from 'react';
import { Button } from '../../../components/ui/button';
import { FileText, Download, Edit, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { categoryIcons, categoryNames } from '../../constants/reminderConstants';

export const BillReminderCard = ({
  doc,
  status,
  onDownload,
  onEdit,
  onMarkDone,
  onDelete
}) => {
  const CategoryIcon = categoryIcons[doc.documentType] || FileText;

  return (
    <div
      className={`border rounded-lg p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow ${status.color.includes('red') ? 'border-red-200 bg-red-50/30' : status.color.includes('orange') ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200'}`}
      onClick={() => onEdit(doc)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <CategoryIcon className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-semibold text-gray-900">
              {categoryNames[doc.documentType] || doc.documentType}
            </h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${status.color}`}>
              {status.text}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-gray-600">
            <div><span className="font-medium">File:</span> {doc.fileName}</div>
            <div><span className="font-medium">Reminder:</span> {format(new Date(doc.reminderDate), 'MMM dd, yyyy')}</div>
            {doc.dueDate && (
              <div><span className="font-medium">Due:</span> {format(new Date(doc.dueDate), 'MMM dd, yyyy')}</div>
            )}
            {doc.amount && (
              <div><span className="font-medium">Amount:</span> Rs. {doc.amount.toLocaleString()}</div>
            )}
          </div>
          {doc.notes && (
            <p className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">{doc.notes}</p>
          )}
        </div>
        {/* Actions */}
        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            onClick={() => onDownload(doc.fileUrl)}
            className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(doc)}
            className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit / Add New
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMarkDone(doc.id)}
            className="text-green-600 border-green-600 hover:bg-green-50 text-xs"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Done
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(doc.id)}
            className="text-red-600 border-red-600 hover:bg-red-50 text-xs"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
