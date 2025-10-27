import { useCallback, useState } from "react";
import type { Comment } from "@/types/comment";
import * as DocumentService from "@/services/documentService";
import toast from "react-hot-toast";
export const useNewDocument = (onDocumentCreated?: () => void) => {

  // State för nytt dokument
  const [title, setTitle]           = useState('');
  const [content, setContent]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [comments, setComments]     = useState<Comment[]>([]);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [running, setRunning]       = useState(false);
  const [runOutput, setRunOutput]   = useState<string>('');
  const [type, setType]             = useState<DocumentService.DocumentType>("doc");


  const toggleMode = () => setIsCodeMode(prev => {
    const newMode = !prev;
    setType(newMode ? "code" : "doc");
    return newMode;
  });

  const handleAddComment = (comment: Comment) => {
    setComments(prev => [...prev, comment]);
  };

  const handleSubmit = async () => {
    console.log("Skapar nytt dokument...");
    console.log({ title, content, type });
    setLoading(true);
    setError(null);

    try {
      if (!title.trim() || !content.trim()) {
        throw new Error('Titel & text kan inte lämnas tomt!');
      }

      const createdDoc = await DocumentService.createDocument(title, content, type);
      console.log("------------------", createdDoc);
      setDocumentId(createdDoc.id);
      setTitle('');
      setContent('');
      setComments([]);
      onDocumentCreated?.();
      toast.success("Dokument skapat!", { duration: 2000 });
      
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const shareDocumentHandler = async (email: string) => {
    if (!documentId) {
      alert("Skapa dokument först!");
      return;
    }

    try {
      await DocumentService.shareDocument(documentId, email);
      alert(`Dokument delat med ${email}`);
      setShareEmail('');
    } catch (err: any) {
      console.error(err);
      alert(`Kunde inte dela dokument: ${err.message}`);
    }
  };


  const runCode = useCallback(async () => {
    console.log("Kör kod...");
    if(!isCodeMode) return;

    if(!content.trim()) {
      setRunOutput("Inget att köra");
      return;
    }

    try {
      const content_to_base64 = btoa(content);
      console.log("Innehåll i base64:", content_to_base64);
      const result = await DocumentService.runCode(content_to_base64);
      
      console.log("Kodkörning resultat:", result);
      const new_res = atob(result.data);
      console.log("Dekodad resultat:", new_res);
      setRunOutput(new_res);
    } catch (err: any) {
      console.error(err);
      setRunOutput(`Körning misslyckades: ${err.message}`);
    } finally {
      setRunning(false);
    }
  }, [content, isCodeMode]);

  return {
    title, setTitle,
    content, setContent,
    comments, handleAddComment,
    loading, error,
    isCodeMode, toggleMode,
    handleSubmit,
    shareEmail, setShareEmail,
    shareDocumentHandler,
    running, runOutput, runCode
  };
};
