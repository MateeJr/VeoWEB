import Image from "next/image";
import ChatBox from "@/components/ChatBox";

export default function Home() {
  return (
    <main style={{ backgroundColor: 'var(--background)', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ChatBox />
    </main>
  );
}
