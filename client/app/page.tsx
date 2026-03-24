import Chat from "@/components/Chat";
import FileUpload from "@/components/FileUpload";

export default function Home() {
  return (
    <div className="flex flex-col h-[88vh] mx-4 bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 flex-row w-full h-full gap-4 items-stretch bg-white dark:bg-black">
        
        {/* Left panel */}
        <div className="flex flex-col w-[30vw] h-full justify-end mt-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <FileUpload />
        </div>

        {/* Right panel */}
        <div className="flex w-[70vw] h-full items-end mt-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <Chat />
        </div>

      </main>
    </div>
  );
}
