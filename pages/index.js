import Motion from "@/components/Motion";
import { useState } from "react";
import Still from "@/components/Still";

export default function Home() {
  const [showMotion, setShowMotion] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4 bg-gray-300 shadow-md">
        <h1 className="text-2xl font-bold">Facial Emotion</h1>
        <div className="flex items-center bg-green-600">
          <span className="mr-4">Image</span>
          <label
            className="switch relative inline-block w-12 h-6"
            aria-label="Toggle Motion"
          >
            <input
              type="checkbox"
              checked={showMotion}
              onChange={() => setShowMotion(!showMotion)}
              className="hidden peer"
            />
            <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-all peer-checked:bg-blue-500"></span>
            <span className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full transition-all peer-checked:translate-x-full"></span>
          </label>
          <span className="ml-4">Video</span>
        </div>
      </header>
      <main className="flex flex-col items-center flex-grow overflow-auto pb-5">
        <div className="relative w-full max-h-[calc(100vh-8rem)] p-4">
          {showMotion ? <Motion /> : <Still />}
        </div>
      </main>

      <footer className="p-4 bg-gray-200 text-center fixed bottom-0 w-full">
        © {new Date().getFullYear()} My Website. All rights reserved.
        <div className="mt-2">
          Contact me:
          <a
            href="https://wa.me/+233548336362"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-500 hover:underline"
          >
            WhatsApp
          </a>{" "}
          |
          <a
            href="https://www.linkedin.com/in/ridwan-ibraheem-3088bb1a4/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-500 hover:underline"
          >
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}
