'use client';
import { io, Socket } from 'socket.io-client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Menubar from './menubar';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Code from '@tiptap/extension-code';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Button } from '../ui/button';
import { CommentMark } from '../commentMark';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import debounce from 'lodash/debounce';

interface Comment {
  id: string;
  text: string;
  from: number;
  to: number;
}

interface TiptapProps {
  content: string;
  id: string;
  title?: string;
  setContent: (content: string) => void;
  setTitle?: (title: string) => void;
  onSave?: () => void;
  onAddComment?: (comment: Comment) => void;
  incomingComment?: Comment | null;
  comments?: Comment[];
  shareDocument?: (email: string) => void;
  users?: { email: string }[];
}

const Tiptap = ({
  content,
  id: documentId,
  title,
  setContent,
  setTitle,
  onSave,
  onAddComment,
  incomingComment,
  comments = [],
  shareDocument,
  users,
}: TiptapProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [localComment, setLocalComment] = useState('');
  const [hoveredComment, setHoveredComment] = useState<Comment | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const isRemoteRef = useRef(false);
  const lastSentLiveRef = useRef<string>('');

 
  const pushContent = useMemo(
    () => debounce((html: string) => setContent(html), 300),
    [setContent]
  );
  useEffect(() => () => pushContent.cancel(), [pushContent]);

  
  const sendLiveUpdate = useMemo(
    () =>
      debounce((html: string) => {
        if (!socketRef.current) return;
        if (html !== lastSentLiveRef.current) {
          socketRef.current.emit('message', { documentId, content: html });
          lastSentLiveRef.current = html;
        }
      }, 500),
    [documentId]
  );
  useEffect(() => () => sendLiveUpdate.cancel(), [sendLiveUpdate]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: 'list-disc ml-3' } },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ HTMLAttributes: { class: 'bg-yellow-200 rounded px-1' } }),
      Code.configure({ HTMLAttributes: { class: 'bg-slate-100 rounded px-1 font-mono' } }),
      CommentMark,
    ],
    content,

    
    onUpdate: ({ editor }) => {
      if (isRemoteRef.current) return;
      const html = editor.getHTML();
      pushContent(html);      
      sendLiveUpdate(html);   
    },

   
    onBlur: ({ editor }) => {
      if (isRemoteRef.current) return;
      pushContent.flush();
      setContent(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class:
          'focus:outline-none bg-white p-6 rounded-2xl shadow-inner border border-slate-200 min-h-[500px]',
      },
      handleDOMEvents: {
        mouseover: (_, event) => {
          const target = event.target as HTMLElement;
          const mark = target.closest('.comment-mark') as HTMLElement | null;
          if (mark) {
            setHoveredComment({
              id: mark.getAttribute('data-comment-id') || '',
              text: mark.getAttribute('data-comment-text') || '',
              from: 0,
              to: 0,
            });
          }
          return false;
        },
        mouseout: (_, event) => {
          const target = event.target as HTMLElement;
          if (target.closest('.comment-mark')) {
            setHoveredComment(null);
          }
          return false;
        },
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    const socket = io("https://min-webb-app-ardhcjbkhgfkdzd2.northeurope-01.azurewebsites.net");
    socketRef.current = socket;

    socket.emit('join', { documentId });

    socket.on('comment', (data: { comment: Comment }) => {
      onAddComment?.(data.comment);
    });

    const onDocContent = (data: { content: string }) => {
      if (!editor) return;

      const incoming = data.content;
      const current = editor.getHTML();
      if (incoming === current) return;

      const { from, to } = editor.state.selection;

      isRemoteRef.current = true;
      
      editor.commands.setContent(incoming);
      try {
        editor.commands.setTextSelection({ from, to });
      } catch {
       
      }
      setTimeout(() => {
        isRemoteRef.current = false;
      }, 0);
    };

    socket.on('message', onDocContent);

    return () => {
      socket.off('comment');
      socket.off('message', onDocContent);
      socket.disconnect();
    };
  }, [documentId, onAddComment, editor]);

  
  useEffect(() => {
    if (!editor) return;
    comments.forEach((c) => {
      editor
        .chain()
        .setTextSelection({ from: c.from, to: c.to })
        .extendMarkRange('comment')
        .setMark('comment', { id: c.id, text: c.text })
        .run();
    });
  }, [editor, comments]);

  
  useEffect(() => {
    if (!editor || !incomingComment) return;
    editor
      .chain()
      .setTextSelection({ from: incomingComment.from, to: incomingComment.to })
      .extendMarkRange('comment')
      .setMark('comment', { id: incomingComment.id, text: incomingComment.text })
      .run();
  }, [incomingComment, editor]);

  if (!editor) return null;

  const addComment = () => {
    if (!editor || !localComment.trim()) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;

    const id = crypto.randomUUID();
    const newComment: Comment = { id, text: localComment, from, to };

    editor.chain().focus().extendMarkRange('comment').setMark('comment', newComment).run();
    onAddComment?.(newComment);

    socketRef.current?.emit('comment', { documentId, comment: newComment });
    setLocalComment('');
  };

  const handleShare = () => {
    if (!shareDocument) return;
    if (!shareEmail) return;
    shareDocument(shareEmail);
    setShareEmail('');
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      {/* Title + actions */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <Menubar editor={editor} />
        {setTitle && onSave && (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Titel..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
              Spara
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-slate-700 hover:bg-slate-800 text-white text-sm rounded-lg">
                  Dela
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dela dokument</DialogTitle>
                  <DialogDescription>Välj en användare att dela dokumentet med.</DialogDescription>
                </DialogHeader>
                <select
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded mt-2"
                >
                  <option value="">Välj användare</option>
                  {users?.map((u) => (
                    <option key={u.email} value={u.email}>
                      {u.email}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleShare}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Skicka
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Editor + Comments */}
      <div className="flex gap-6 items-start">
        <div className="flex-1">
          <EditorContent editor={editor} />
        </div>

        <aside className="w-[280px] bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col">
          <h3 className="font-semibold mb-2 text-slate-700">Kommentar</h3>
          {hoveredComment ? (
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 text-sm mb-2">
              {hoveredComment.text}
            </div>
          ) : (
            <p className="text-slate-400 text-sm mb-2">Markera text för att se kommentar</p>
          )}
          <textarea
            value={localComment}
            onChange={(e) => setLocalComment(e.target.value)}
            placeholder="Markera text & skriv en kommentar..."
            className="w-full h-24 p-2 border border-slate-300 rounded-lg resize-none text-sm bg-slate-50"
          />
          <Button onClick={addComment} className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
            Skicka
          </Button>
        </aside>
      </div>
    </div>
  );
};

export default Tiptap;
