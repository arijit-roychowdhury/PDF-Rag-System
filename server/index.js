import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


const pdfQueue = new Queue("file-upload-queue", {
  connection: {
    host: 'localhost',
    port: 6379
  }
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
})

const upload = multer({ storage: storage })

const app = express();
const PORT = 8000;

app.use(cors());

// Middleware to parse JSON bodies
app.get("/api", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

app.get("/chat", async (req, res) => {
  const userQuery = req.query.message;

  // 1. Create embeddings and store in Qdrant
    const embeddings = new OpenAIEmbeddings({ 
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-small",
    });

  // Similarity search from Qdrant would go here
  const qdrantStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    collectionName: 'pdf-documents',
    url: process.env.QDRANT_URL || 'http://localhost:6333',
  });
  const retriever = await qdrantStore.asRetriever({
    k: 2,
  });

  const relevantDocs = await retriever.invoke(userQuery);
  console.log("Relevant documents:", relevantDocs);

  const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based 
  on the provided Context. Use only the information from the Context to 
  answer the question. If you don't know the answer, say you don't know.
  Context: ${relevantDocs.map((doc, i) => `\n[Document ${i+1}]: ${doc.pageContent}`).join("\n")}`;

  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery }
    ]
  });


  res.json({ 
    message: chatResponse.choices[0].message.content, 
    relevantDocs: relevantDocs.map(doc => doc.pageContent)
  });

});


app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  await pdfQueue.add('process-pdf', {
    fileName: req.file.filename,
    destination: req.file.destination,
    path: req.file.path,
  });
  return res.json({ message: 'File uploaded successfully' });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});