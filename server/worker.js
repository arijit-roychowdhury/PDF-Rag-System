import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { Worker } from 'bullmq';
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
// import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter  } from "@langchain/textsplitters";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const worker = new Worker('file-upload-queue', async job => {
  try {
    const { fileName, path } = job.data;

    console.log(`Processing file: ${fileName} at path: ${path}`);

    // 1. Load the PDF and extract text
    const loader = new PDFLoader(path, {
      pdfjs: () => import("pdfjs-dist/legacy/build/pdf.mjs"),
    });
    const docs = await loader.load();
    console.log(`Extracted ${docs.length} documents from the PDF.`);


    // 2. Split the text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter ({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`Split into ${splitDocs.length} chunks.`);

    // 3. Create embeddings and store in Qdrant
    const embeddings = new OpenAIEmbeddings({ 
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-small",
    });

    // 4. Store in Qdrant
    const qdrantStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      collectionName: 'pdf-documents',
      url: process.env.QDRANT_URL || 'http://localhost:6333',
    });
    await qdrantStore.addDocuments(splitDocs);
    console.log(`Stored ${splitDocs.length} chunks in Qdrant.`);

    return {
      success: true,
      fileName,
      chunks: splitDocs.length,
    };
  } catch (err) {
    console.error("❌ WORKER ERROR:", err);
    throw err; // important: let BullMQ mark the job as failed
  }
},
{ connection: {
    host: 'localhost',    
    port: 6379
  },
  concurrency: 2,
}
);

worker.on('completed', job => {
  console.log(`Job completed with result: ${job.returnvalue}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err);
});