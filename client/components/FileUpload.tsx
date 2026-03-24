"use client"
import { Upload } from "lucide-react";

const FileUpload: React.FC = () => {
  const handleFileUpload = () => {
    // Implement file upload logic here
    const el = document.createElement("input");
    el.setAttribute("type", "file");
    el.setAttribute("accept", "application/pdf");
    el.addEventListener("change", async (event) => {
      if(el.files && el.files.length > 0) {
        const file = el.files.item(0);
        console.log("Selected file:", file);

        if (!file) {
          console.error("No file selected");
          return;
        }
        const formData = new FormData();        
        formData.append("pdf", file as Blob);

        const res = await fetch("http://localhost:8000/upload/pdf", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {      
          console.log("Upload successful:", data);
        } else {
          console.error("Upload failed:", data);
        }
      }
    });
    el.click();
  }
  return (
    <div 
    onClick={handleFileUpload}
    className="flex items-center justify-center w-full border-2 gap-4 
    border-dashed border-gray-300 rounded-md p-4 cursor-pointer 
    hover:border-gray-400 transition-colors duration-200">
      <p>Upload Your PDF Here</p>
      <Upload />
    </div>
  )
}

export default FileUpload