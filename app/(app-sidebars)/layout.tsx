import LeftSidebar from "@/components/left-sidebar";
import { PlayerControls } from "@/components/player-controls";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="h-dvh flex w-full">
        <LeftSidebar />
        <main className="flex-1">{children}</main>
      </div>
      <PlayerControls />
    </>
  );
}
