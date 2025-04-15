"use client";

import React from 'react';

import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TiptapViewerProps {
  content: string;
}

export default function TiptapViewer({ content }: TiptapViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Link.configure({
        openOnClick: true,
      }),
      Heading.configure({
        levels: [1, 2],
      }),
      Image,
    ],
    content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none',
      },
    },
  });

  return <EditorContent editor={editor} />;
} 