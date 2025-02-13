import React, { useState, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Bookmark, AlertTriangle } from 'lucide-react';

// Importar Inline apenas uma vez
const Inline = Quill.import('blots/inline');

// Blot para Issues
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

// Blot para Bookmarks
class BookmarkBlot extends Inline {
  static create() {
    let node = super.create();
    node.setAttribute('class', 'bookmark-highlight');
    return node;
  }
}

// Registrar os Blots
IssueBlot.blotName = 'issue';
IssueBlot.tagName = 'span';
BookmarkBlot.blotName = 'bookmark';
BookmarkBlot.tagName = 'span';

Quill.register('formats/issue', IssueBlot);
Quill.register('formats/bookmark', BookmarkBlot);

// Ícones da toolbar
const icons = Quill.import('ui/icons');
icons['bookmark'] = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EAB308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`;
icons['issue'] = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;

const CustomQuill = React.forwardRef(({ value, onChange, onChangeSelection, onIssueClick }, ref) => {
  const [selectedRange, setSelectedRange] = useState(null);

  // Configuração dos módulos
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['bookmark', 'issue'],
        ['clean']
      ],
      handlers: {
        'bookmark': () => handleMarkClick('bookmark'),
        'issue': () => handleMarkClick('issue')
      }
    }
  };

  // Handler unificado para bookmark e issue
  const handleMarkClick = useCallback((type) => {
    if (!selectedRange || !ref.current) return;

    const quill = ref.current.getEditor();
    const bounds = quill.getBounds(selectedRange.index, selectedRange.length);
    const editorBounds = quill.container.getBoundingClientRect();

    const tooltipPosition = {
      x: editorBounds.left + bounds.left,
      y: editorBounds.top + bounds.top + bounds.height,
      index: selectedRange.index,
      length: selectedRange.length
    };

    onIssueClick(null, tooltipPosition, type);
  }, [selectedRange, ref, onIssueClick]);

  // Handler para seleção de texto
  const handleChangeSelection = useCallback((range) => {
    setSelectedRange(range);
    if (onChangeSelection) {
      onChangeSelection(range);
    }
  }, [onChangeSelection]);

  return (
    <div className="relative">
      <ReactQuill
        ref={ref}
        theme="snow"
        value={value}
        onChange={onChange}
        onChangeSelection={handleChangeSelection}
        modules={modules}
        formats={['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'indent', 'bookmark', 'issue']}
        className="issue-editor"
      />
      <style jsx global>{`
        .bookmark-highlight {
          background-color: rgba(234, 179, 8, 0.2);
          border-bottom: 2px solid #EAB308;
        }
        
        .issue-highlight {
          background-color: rgba(239, 68, 68, 0.2);
          position: relative;
        }
        
        .issue-highlight::after {
          content: '!';
          position: absolute;
          right: -4px;
          top: -4px;
          background-color: #EF4444;
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

        .ql-snow .ql-toolbar button.ql-bookmark,
        .ql-snow .ql-toolbar button.ql-issue {
          width: 28px;
          height: 24px;
          padding: 2px;
        }

        .ql-snow .ql-toolbar button.ql-bookmark svg,
        .ql-snow .ql-toolbar button.ql-issue svg {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </div>
  );
});

CustomQuill.displayName = 'CustomQuill';

export default CustomQuill; 