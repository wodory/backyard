"use client";

import React, { useCallback, useEffect } from 'react'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Heading from '@tiptap/extension-heading'
import Image from '@tiptap/extension-image'
import { Button } from '@/components/ui/button'
import { 
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Link as LinkIcon,
  Heading1 as H1Icon,
  Heading2 as H2Icon,
  List as ListIcon,
  ListOrdered as OrderedListIcon,
  Image as ImageIcon
} from 'lucide-react'
import Placeholder from '@tiptap/extension-placeholder'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  showToolbar?: boolean
}

export default function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = '내용을 입력하세요...', 
  showToolbar = true 
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Image,
      Placeholder.configure({
        placeholder: placeholder || '내용을 입력하세요...',
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[150px] prose dark:prose-invert focus:outline-none max-w-none p-4 border rounded-md',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL 입력', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    
    const url = window.prompt('이미지 URL 입력');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor">
      {showToolbar && (
        <div className="toolbar border rounded-md mb-2 p-1 flex flex-wrap gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-secondary' : ''}
          >
            <BoldIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-secondary' : ''}
          >
            <ItalicIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={setLink}
            className={editor.isActive('link') ? 'bg-secondary' : ''}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-secondary' : ''}
          >
            <H1Icon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-secondary' : ''}
          >
            <H2Icon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-secondary' : ''}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-secondary' : ''}
          >
            <OrderedListIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={addImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Bubble Menu */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex bg-background shadow-lg border rounded-md p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-secondary' : ''}
            >
              <BoldIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-secondary' : ''}
            >
              <ItalicIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={setLink}
              className={editor.isActive('link') ? 'bg-secondary' : ''}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      {/* Floating Menu */}
      {editor && (
        <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex bg-background shadow-lg border rounded-md p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <H1Icon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <H2Icon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <OrderedListIcon className="h-4 w-4" />
            </Button>
          </div>
        </FloatingMenu>
      )}

      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  )
} 