import NicknameForm, { NicknameFormType } from "@ai/components/nickname-form";
import SocketInitializer from "@ai/components/socket-initializer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-center">
      <section className="container mx-auto px-4">
        <h1 className="mb-8 text-6xl">beeeeeeeep</h1>
        <NicknameForm submitLabel="Start Game" type="HOME" />
      </section>
      <SocketInitializer />
    </main>
  );
}
