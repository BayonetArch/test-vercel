import TestDB from "./components/testDB";

export default function Home() {
  return (
    <div className="flex flex-col flex-1  justify-center bg-zinc-50 font-sans dark:bg-black">
      <TestDB />
    </div>
  );
}
