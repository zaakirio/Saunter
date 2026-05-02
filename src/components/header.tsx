"use client";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Heart, History, Search } from "lucide-react";

type Props = {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
  onSavedClick: () => void;
  onHistoryClick: () => void;
};

export function Header({ searchQuery, onSearchChange, onSearchSubmit, onSavedClick, onHistoryClick }: Props) {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b bg-white flex items-center px-6 gap-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-500" />
        <div>
          <div className="font-bold text-lg">WalkGuide</div>
          <div className="text-xs text-muted-foreground">Explore. Walk. Discover.</div>
        </div>
      </div>

      <form
        className="flex-1 max-w-2xl mx-auto"
        onSubmit={e => { e.preventDefault(); onSearchSubmit(); }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search for places, landmarks, city..."
            className="w-full pl-10 pr-4 py-2 rounded-full border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onSavedClick}><Heart className="size-4 mr-1" />Saved</Button>
        <Button variant="ghost" size="sm" onClick={onHistoryClick}><History className="size-4 mr-1" />History</Button>
        {session ? (
          <>
            <a href="/preferences" className="rounded-full hover:opacity-80">
              <img src={session.user.image ?? ""} alt="" className="w-7 h-7 rounded-full" />
            </a>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>Sign out</Button>
          </>
        ) : (
          <Button size="sm" onClick={() => signIn.social({ provider: "google" })}>Sign in</Button>
        )}
      </div>
    </header>
  );
}
