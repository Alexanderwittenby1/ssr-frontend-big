"use client";

import { graphqlClient } from "@/lib/graphql-client";
import {
  ADD_COMMENT,
  UPDATE_DOCUMENT,
  SHARE_DOCUMENT,
  CREATE_DOCUMENT,
} from "@/Graphql/mutations";

type Comment = {
  id: string;
  text: string;
  from: number;
  to: number;
};

export type DocumentType = "code" | "doc";

export const addCommentToDocument = async (
  documentId: string,
  comment: Comment
) => {
  const data = await graphqlClient(ADD_COMMENT, {
    documentId,
    text: comment.text,
    from: comment.from,
    to: comment.to,
  });
  return data.addComment;
};

export const updateDocument = async (
  id: string,
  title: string,
  content: string,
  type: DocumentType
) => {
  console.log("Uppdaterar dokument:", { id, title, content, type });
  return await graphqlClient(UPDATE_DOCUMENT, { id, title, content, type });
};

export const shareDocument = async (id: string, email: string) => {
  return await graphqlClient(SHARE_DOCUMENT, { id, email });
};

export const createDocument = async (
  title: string,
  content: string,
  type: DocumentType
) => {
  
  const data = await graphqlClient(CREATE_DOCUMENT, {
    title,
    content,
    type,
  });
  
  const doc = data.createDocument;

  const id = doc.id ?? doc._id;
  
  return {
    id,
    title: doc.title,
    content: doc.content,
    type: doc.type,
  };
};

export const runCode = async (code: string) => {
  const response = await fetch("https://execjs.emilfolino.se/code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error(`Error running code: ${response.statusText}`);
  }

  return await response.json();
};
