import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { createEditor, Transforms, Editor, Range, Text } from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import { 
  Bookmark, 
  AlertTriangle, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Copy,
  ClipboardPaste
} from 'lucide-react';
import IssueTooltip from './IssueTooltip';

// Valor inicial padrão
const DEFAULT_VALUE = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

// Componente do botão da toolbar
const ToolbarButton = ({ icon: Icon, format, tooltip, color, isBlock = false, onClick }) => {
  const editor = useSlate();
  
  const isActive = useCallback(() => {
    if (onClick) return false;
    if (isBlock) {
      const [match] = Editor.nodes(editor, {
        match: n => n.type === format,
      });
      return !!match;
    }
    const marks = Editor.marks(editor);
    return marks ? marks[format] : false;
  }, [editor, format, isBlock, onClick]);

  const handleClick = useCallback((e) => {
    e.preventDefault();
    if (onClick) {
      onClick(editor);
      return;
    }
    
    if (isBlock) {
      const isActive = Editor.marks(editor)?.[format];
      const newProperties = {
        type: isActive ? 'paragraph' : format,
      };
      Transforms.setNodes(editor, newProperties);
    } else {
      const isActive = Editor.marks(editor)?.[format];
      if (isActive) {
        Editor.removeMark(editor, format);
      } else {
        Editor.addMark(editor, format, true);
      }
    }
  }, [editor, format, isBlock, onClick]);

  return (
    <button
      className={`p-2 rounded hover:bg-gray-100 ${isActive() ? 'text-blue-500' : 'text-gray-600'}`}
      onMouseDown={handleClick}
      title={tooltip}
    >
      <Icon size={18} color={isActive() ? color : 'currentColor'} />
    </button>
  );
};

// Componente do Editor
const CustomEditor = ({ value, onChange, onMarkClick }) => {
  // Inicializar editor
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  // Estado interno simplificado
  const [editorValue, setEditorValue] = useState(() => {
    // Se o valor inicial for válido, use-o
    if (value && Array.isArray(value) && value.length > 0) {
      return value;
    }
    // Caso contrário, use o valor padrão
    return DEFAULT_VALUE;
  });

  // Estado para controlar o tooltip
  const [tooltipData, setTooltipData] = useState(null);

  // Atualizar quando o valor da prop mudar
  useEffect(() => {
    if (value && Array.isArray(value) && value.length > 0) {
      setEditorValue(value);
    }
  }, [value]);

  // Funções de edição
  const handleUndo = useCallback(editor => {
    editor.undo();
  }, []);

  const handleRedo = useCallback(editor => {
    editor.redo();
  }, []);

  const handleCopy = useCallback(editor => {
    if (!editor.selection) return;
    const text = Editor.string(editor, editor.selection);
    navigator.clipboard.writeText(text);
  }, []);

  const handlePaste = useCallback(async (editor) => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      
      const lines = text.split('\n');
      Transforms.insertNodes(
        editor,
        lines.map(line => ({
          type: 'paragraph',
          children: [{ text: line }],
        }))
      );
    } catch (err) {
      console.error('Erro ao colar texto:', err);
    }
  }, []);

  // Renderizar elementos
  const renderElement = useCallback(({ attributes, children, element }) => {
    switch (element.type) {
      case 'heading-one':
        return <h1 {...attributes} className="text-2xl font-bold mb-4">{children}</h1>;
      case 'heading-two':
        return <h2 {...attributes} className="text-xl font-bold mb-3">{children}</h2>;
      case 'bulleted-list':
        return <ul {...attributes} className="list-disc pl-4 mb-4">{children}</ul>;
      case 'numbered-list':
        return <ol {...attributes} className="list-decimal pl-4 mb-4">{children}</ol>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      default:
        return <p {...attributes} className="mb-4">{children}</p>;
    }
  }, []);

  // Renderizar folhas (texto com marcações)
  const renderLeaf = useCallback(({ attributes, children, leaf }) => {
    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }
    if (leaf.italic) {
      children = <em>{children}</em>;
    }
    if (leaf.underline) {
      children = <u>{children}</u>;
    }
    if (leaf.bookmark) {
      children = (
        <span 
          className="bg-yellow-100 border-b-2 border-yellow-400 cursor-pointer"
          onClick={() => {
            if (leaf.bookmark.id) {
              // Abrir tooltip com dados do bookmark existente
              setTooltipData({
                type: 'bookmark',
                data: leaf.bookmark,
                rect: attributes.ref.current?.getBoundingClientRect()
              });
            }
          }}
        >
          {children}
        </span>
      );
    }
    if (leaf.issue) {
      children = (
        <span 
          className="bg-red-100 relative cursor-pointer"
          onClick={() => {
            if (leaf.issue.id) {
              // Abrir tooltip com dados da issue existente
              setTooltipData({
                type: 'issue',
                data: leaf.issue,
                rect: attributes.ref.current?.getBoundingClientRect()
              });
            }
          }}
        >
          {children}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            !
          </span>
        </span>
      );
    }
    return <span {...attributes}>{children}</span>;
  }, []);

  // Handler para mudança de seleção
  const handleSelectionChange = useCallback(() => {
    const { selection } = editor;
    
    if (selection && !Range.isCollapsed(selection)) {
      try {
        const domRange = ReactEditor.toDOMRange(editor, selection);
        const rect = domRange.getBoundingClientRect();
        
        // Armazenar dados da seleção para uso no tooltip
        setTooltipData({
          rect,
          range: domRange,
          text: Editor.string(editor, selection)
        });
      } catch (err) {
        console.error('Erro ao processar seleção:', err);
      }
    } else {
      setTooltipData(null);
    }
  }, [editor]);

  // Função para alternar marcação
  const toggleMark = useCallback((format) => {
    const isActive = Editor.marks(editor)?.[format];
    
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  }, [editor]);

  // Atalhos de teclado
  const handleKeyDown = useCallback((event) => {
    if (!event.ctrlKey) return;

    switch (event.key) {
      case 'b': {
        event.preventDefault();
        toggleMark('bold');
        break;
      }
      case 'i': {
        event.preventDefault();
        toggleMark('italic');
        break;
      }
      case 'u': {
        event.preventDefault();
        toggleMark('underline');
        break;
      }
      default:
        // Nenhuma ação para outras teclas
        break;
    }
  }, [toggleMark]);

  // Handler para aplicar marcação
  const handleMarkText = useCallback((type, data) => {
    if (!editor.selection) return;

    // Aplicar a marcação ao texto selecionado
    Editor.addMark(editor, type, data);
    
    // Limpar tooltip
    setTooltipData(null);
  }, [editor]);

  // Modificar o handler do botão da toolbar para abrir o tooltip
  const handleToolbarClick = useCallback((type) => {
    const { selection } = editor;
    if (!selection || Range.isCollapsed(selection)) return;

    try {
      const domRange = ReactEditor.toDOMRange(editor, selection);
      const rect = domRange.getBoundingClientRect();
      const editorRect = document.querySelector('.editor-container').getBoundingClientRect();
      
      setTooltipData({
        type,
        rect: {
          left: rect.left + (rect.width / 2) - 160, // Centralizar tooltip (320px / 2 = 160)
          bottom: rect.bottom - editorRect.top
        },
        text: Editor.string(editor, selection)
      });
    } catch (err) {
      console.error('Erro ao processar seleção:', err);
    }
  }, [editor]);

  return (
    <div className="border border-gray-100 rounded-lg bg-white relative shadow-sm">
      <Slate 
        editor={editor} 
        initialValue={editorValue}
        onChange={newValue => {
          setEditorValue(newValue);
          if (onChange) {
            onChange(newValue);
          }
        }}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-100">
          {/* Grupo de Histórico */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-100">
            <ToolbarButton
              icon={Undo}
              tooltip="Desfazer (Ctrl+Z)"
              onClick={handleUndo}
            />
            <ToolbarButton
              icon={Redo}
              tooltip="Refazer (Ctrl+Y)"
              onClick={handleRedo}
            />
          </div>

          {/* Grupo de Formatação */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-100">
            <ToolbarButton
              icon={Type}
              format="heading-one"
              tooltip="Título 1"
              isBlock
            />
            <ToolbarButton
              icon={Bold}
              format="bold"
              tooltip="Negrito (Ctrl+B)"
            />
            <ToolbarButton
              icon={Italic}
              format="italic"
              tooltip="Itálico (Ctrl+I)"
            />
            <ToolbarButton
              icon={Underline}
              format="underline"
              tooltip="Sublinhado (Ctrl+U)"
            />
          </div>

          {/* Grupo de Alinhamento */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-100">
            <ToolbarButton
              icon={AlignLeft}
              format="align-left"
              tooltip="Alinhar à Esquerda"
              isBlock
            />
            <ToolbarButton
              icon={AlignCenter}
              format="align-center"
              tooltip="Centralizar"
              isBlock
            />
            <ToolbarButton
              icon={AlignRight}
              format="align-right"
              tooltip="Alinhar à Direita"
              isBlock
            />
          </div>

          {/* Grupo de Lista */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-100">
            <ToolbarButton
              icon={List}
              format="bulleted-list"
              tooltip="Lista"
              isBlock
            />
          </div>

          {/* Grupo de Clipboard */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-100">
            <ToolbarButton
              icon={Copy}
              tooltip="Copiar (Ctrl+C)"
              onClick={handleCopy}
            />
            <ToolbarButton
              icon={ClipboardPaste}
              tooltip="Colar (Ctrl+V)"
              onClick={handlePaste}
            />
          </div>
          
          {/* Grupo de Marcações */}
          <div className="flex items-center gap-1 pl-2">
            <button
              className="p-2 rounded hover:bg-gray-100 text-gray-600"
              onClick={() => handleToolbarClick('bookmark')}
              title="Adicionar bookmark"
            >
              <Bookmark size={18} />
            </button>
            <button
              className="p-2 rounded hover:bg-gray-100 text-gray-600"
              onClick={() => handleToolbarClick('issue')}
              title="Marcar issue"
            >
              <AlertTriangle size={18} />
            </button>
          </div>
        </div>

        {/* Editor container */}
        <div className="editor-container relative">
          <Editable
            className="p-4 min-h-[400px] prose max-w-none focus:outline-none"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={handleKeyDown}
            onSelect={handleSelectionChange}
            placeholder="Digite ou cole o texto do contrato aqui..."
          />

          {/* Tooltip centralizado */}
          {tooltipData && (
            <IssueTooltip
              position={{
                x: tooltipData.rect.left,
                y: tooltipData.rect.bottom
              }}
              selectedText={tooltipData.text}
              type={tooltipData.type}
              data={tooltipData.data}
              onSubmit={(data) => {
                handleMarkText(tooltipData.type, {
                  id: Date.now(),
                  ...data
                });
              }}
              onClose={() => setTooltipData(null)}
            />
          )}
        </div>
      </Slate>
    </div>
  );
};

export default CustomEditor; 