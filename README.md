# PDF RAG System

A full-stack PDF RAG (Retrieval-Augmented Generation) application built with:

- **Client:** Next.js
- **Server:** Node.js + Express
- **Queue:** BullMQ + Redis
- **Vector DB:** Qdrant
- **LLM / Embeddings:** LangChain + OpenAI
- **File Uploads:** Multer
- **Container Setup:** Docker Compose

This project allows users to upload PDF files from the frontend, process them in the backend, extract and chunk the content, generate embeddings, and store them in Qdrant for later semantic retrieval and question answering.
