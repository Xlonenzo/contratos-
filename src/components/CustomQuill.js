import React from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Registrar um novo formato para issues
const Inline = Quill.import('blots/inline');

class IssueBlot extends Inline {
  static create(issueData) {
    let node = super.create();
    node.setAttribute('data-issue-id', issueData.id || 'temp');
    node.setAttribute('class', 'issue-highlight');
    return node;
  }

  static formats(node) {
    return {
      id: node.getAttribute('data-issue-id'),
    };
  }
}

IssueBlot.blotName = 'issue';
IssueBlot.tagName = 'span';

// Registrar o formato customizado
Quill.register('formats/issue', IssueBlot);

const CustomQuill = React.forwardRef(({ value, onChange, onChangeSelection, onIssueClick }, ref) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'background': ['yellow'] }], // Adiciona opção de highlight
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'background',
    'issue'
  ];

  // Handler para cliques em issues
  const handleClick = (event) => {
    const issueElement = event.target.closest('[data-issue-id]');
    if (issueElement) {
      const issueId = issueElement.getAttribute('data-issue-id');
      const rect = issueElement.getBoundingClientRect();
      onIssueClick(issueId, {
        x: rect.left,
        y: rect.bottom,
        width: rect.width,
        height: rect.height
      });
    }
  };

  return (
    <div className="relative">
      <ReactQuill
        ref={ref}
        value={value}
        onChange={onChange}
        onChangeSelection={onChangeSelection}
        modules={modules}
        formats={formats}
        onClick={handleClick}
        className="issue-editor"
      />
      <style jsx global>{`
        .issue-highlight {
          background-color: rgba(255, 255, 0, 0.3);
          cursor: pointer;
          position: relative;
        }
        
        .issue-highlight:hover {
          background-color: rgba(255, 255, 0, 0.5);
        }
        
        .issue-highlight::after {
          content: '!';
          position: absolute;
          right: -4px;
          top: -4px;
          background-color: #f59e0b;
          color: white;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
});

CustomQuill.displayName = 'CustomQuill';

export default CustomQuill; 