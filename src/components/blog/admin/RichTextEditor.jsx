import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import { Label } from '@/components/ui/label';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    [{ direction: 'rtl' }],
    ['clean'],
  ],
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'align',
  'blockquote', 'code-block', 'link', 'image', 'direction',
];

export default function RichTextEditor({ value, onChange, label = 'محتوا', placeholder = 'محتوای خود را بنویسید...' }) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="border rounded-lg overflow-hidden bg-background quill-wrapper">
        <style>{`.quill-wrapper .ql-container { min-height: 300px; font-family: var(--font-vazir); } .quill-wrapper .ql-editor { min-height: 300px; }`}</style>
        <ReactQuill
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
