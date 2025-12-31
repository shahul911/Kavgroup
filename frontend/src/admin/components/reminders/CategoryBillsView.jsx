import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { ArrowLeft, Plus, FileText, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { categoryIcons } from '../../constants/reminderConstants';

export const CategoryBillsView = ({
  category,
  bills,
  isLoading,
  onBack,
  onAddBill,
  onDownload,
  onDelete
}) => {
  const CategoryIcon = categoryIcons[category.id] || FileText;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <CategoryIcon className="w-6 h-6 text-[#D4AF37]" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{category.name}</h2>
          </div>
        </div>
        <Button
          onClick={onAddBill}
          className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Bill
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">Loading bills...</div>
      ) : bills.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <CategoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No bills yet</h3>
            <p className="text-gray-600 mb-4">Upload your first {category.name.toLowerCase()} record</p>
            <Button
              onClick={onAddBill}
              className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Bill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bills.map((bill) => (
            <Card key={bill.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#D4AF37]" />
                    <span className="font-medium text-gray-900 text-sm truncate max-w-[150px]">
                      {bill.fileName}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-blue-600"
                      onClick={() => onDownload(bill.fileUrl)}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600"
                      onClick={() => onDelete(bill.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {bill.billDate && (
                    <p><span className="font-medium">Bill Date:</span> {format(new Date(bill.billDate), 'MMM dd, yyyy')}</p>
                  )}
                  {bill.amount && (
                    <p><span className="font-medium">Amount:</span> Rs. {bill.amount.toLocaleString()}</p>
                  )}
                  {bill.notes && (
                    <p className="text-xs text-gray-500 truncate">{bill.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
