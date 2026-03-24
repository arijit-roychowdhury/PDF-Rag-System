'use client';

import React, { useState } from 'react';

interface ChatResponse {
  role: 'assistant' | 'user';
  content?: string;
  documents?: string[]; // Optional field for documents related to the response
}

const Chat: React.FC = () => {
  const [query, setQuery] = useState('');
  const [allResponses, setAllResponses] = useState<ChatResponse[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAllResponses(prev => [...prev, { role: 'user', content: query }]);
      const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(query)}`);
      const data = await res.json();
      console.log("Chat response:", data);
      setAllResponses(prev => [...prev, { role: 'assistant', content: data.message , documents: data.relevantDocs }]);
      console.log("Updated all responses:", allResponses); 
    }
    catch (error) {
      console.error("Error fetching chat response:", error);
      setAllResponses(prev => [...prev, { role: 'assistant', content: "Error fetching response" }]);
    }
  };

  return (
    <div className='w-full'>
      <pre
      className='text-left text-sm my-5 overflow-x-auto whitespace-pre-wrap'
      >
        {allResponses.map((resp, index) => (
          <div key={index} className={`mb-4 ${resp.role === 'user' ? 'text-right' : 'text-left'}`}>
            <p className={`inline-block px-4 py-2 rounded-lg ${resp.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {resp.content}
            </p>
          </div>
        ))}

      </pre>
      <h1>Chat with PDF RAG</h1>
      <form onSubmit={handleSubmit} className='flex gap-2 mt-4 '>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about the PDF..."
          className='w-full p-2.5 text-black bg-amber-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <button 
        type="submit" 
        className='bg-blue-500 text-white p-2.5 rounded hover:bg-blue-600'
        disabled={!query.trim()}
        >
          Send
        </button>
      </form>
      
    </div>
  );
}

export default Chat;