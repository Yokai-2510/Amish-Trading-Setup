import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newItem: { type: 'stock' | 'option'; name: string }) => void;
  currentItem: { id: number; type: 'stock' | 'option'; name: string } | undefined;
}

const stocks = ['Reliance', 'TCS', 'HDFC Bank', 'Infosys', 'India VIX'];
const options = ['Nifty 50', 'Bank Nifty'];

const SelectionModal: React.FC<SelectionModalProps> = ({ isOpen, onClose, onSave, currentItem }) => {
  const [selectedType, setSelectedType] = useState<'stock' | 'option'>('stock');
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    if (currentItem) {
      setSelectedType(currentItem.type);
      setSelectedValue(currentItem.name);
    }
  }, [currentItem]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedValue) {
      onSave({ type: selectedType, name: selectedValue });
      onClose();
    }
  };

  const list = selectedType === 'stock' ? stocks : options;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Edit Instrument</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Instrument Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                    setSelectedType('stock');
                    setSelectedValue('');
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                  selectedType === 'stock'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                Stock
              </button>
              <button
                onClick={() => {
                    setSelectedType('option');
                    setSelectedValue('');
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                  selectedType === 'option'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                Option
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Instrument</label>
            <select
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="" disabled>-- Select --</option>
              {list.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
            disabled={!selectedValue}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectionModal;