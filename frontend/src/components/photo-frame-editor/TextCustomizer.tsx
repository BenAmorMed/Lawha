import React from 'react';
import { TextCustomization } from '@/types/frame';

interface TextCustomizerProps {
  customization: TextCustomization;
  onChange: (customization: TextCustomization) => void;
}

const TextCustomizer: React.FC<TextCustomizerProps> = ({ customization, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...customization, [name]: value });
  };

  const giftNoteLimit = 250;

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-dark mb-4 text-sm uppercase tracking-wider">Personalize Your Frame</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={customization.firstName}
            onChange={handleChange}
            placeholder="e.g. Tysse"
            className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Second Name</label>
          <input
            type="text"
            name="secondName"
            value={customization.secondName}
            onChange={handleChange}
            placeholder="e.g. Öle"
            className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Special Date</label>
        <input
          type="text"
          name="date"
          value={customization.date}
          onChange={handleChange}
          placeholder="e.g. 15.06.2023"
          className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
        />
      </div>

      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between items-end px-1 mb-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gift Note (Optional)</label>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${
            (customization.giftNote?.length || 0) > giftNoteLimit ? 'text-red-500' : 'text-gray-400'
          }`}>
            {customization.giftNote?.length || 0} / {giftNoteLimit}
          </span>
        </div>
        <textarea
          name="giftNote"
          value={customization.giftNote}
          onChange={handleChange}
          rows={4}
          maxLength={giftNoteLimit}
          placeholder="Enter your personalized gift message here..."
          className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm resize-none"
        />
      </div>
    </div>
  );
};

export default TextCustomizer;
