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
        <svg
          className="w-9 h-9 text-blue-500"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Saunter logo"
        >
          <path
            d="M16 2C9.4 2 4 7.4 4 14c0 9 12 16 12 16s12-7 12-16c0-6.6-5.4-12-12-12z"
            fill="currentColor"
          />
          <circle cx="16" cy="14" r="6" fill="white" />
          <path
            d="M14 11.5c0-.55.45-1 1-1s1 .45 1 1v3c0 .55-.45 1-1 1s-1-.45-1-1v-3z"
            fill="#3b82f6"
          />
          <circle cx="18" cy="11.5" r="1" fill="#3b82f6" />
          <circle cx="18" cy="14.5" r="1" fill="#3b82f6" />
          <circle cx="18" cy="17.5" r="1" fill="#3b82f6" />
        </svg>
        <div>
          <div className="font-bold text-lg">Saunter</div>
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
