import { useRef, useEffect, useCallback } from "react";

interface useChatScrollOptions {
  messagesCount: number;
  hasMore: boolean;
  loadingMore: boolean;
  loading: boolean;
  loadMore: () => void;
}

export function useChatScroll({ 
  messagesCount, 
  hasMore, 
  loadingMore, 
  loading, 
  loadMore 
}: useChatScrollOptions) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  const isInitialLoad = useRef(true);

  // Adjust scroll position when historical messages are loaded,
  // or auto-scroll to bottom for new messages/initial load
  useEffect(() => {
    if (!scrollAreaRef.current) return;
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    if (previousScrollHeight.current > 0) {
      // Historical messages were added at the top
      const newScrollHeight = viewport.scrollHeight;
      const heightDifference = newScrollHeight - previousScrollHeight.current;

      // Keep scroll position relative to the elements that were previously there
      viewport.scrollTop = viewport.scrollTop + heightDifference;
      previousScrollHeight.current = 0; // Reset
    } else if (messagesCount > 0) {
      // Normal new message or first load - scroll to bottom
      if (isInitialLoad.current) {
        // Skip smooth scroll animation on initial load to just "be" at the bottom
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        isInitialLoad.current = false;
      } else {
        // Smooth scroll for subsequent new messages sent or received
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messagesCount]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;

    // Ensure we are only responding to the main scroll viewport
    if (!target.hasAttribute('data-radix-scroll-area-viewport')) {
      return;
    }

    if (target.scrollTop < 100 && hasMore && !loadingMore && !loading) {
      previousScrollHeight.current = target.scrollHeight;
      loadMore();
    }
  }, [hasMore, loadingMore, loading, loadMore]);

  return {
    scrollAreaRef,
    messagesEndRef,
    handleScroll
  };
}
