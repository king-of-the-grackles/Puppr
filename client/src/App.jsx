import { useState, useEffect, useRef } from 'react';
import SwipeView from './components/SwipeView';
import LikesGallery from './components/LikesGallery';
import BottomNav from './components/BottomNav';
import TopNav from './components/TopNav';
import { fetchDog } from './services/api';
import { loadLikes, saveLikes } from './services/storage';

const QUEUE_SIZE = 5;
const PREFETCH_THRESHOLD = 3;

function App() {
  const [view, setView] = useState('swipe');
  const [dogQueue, setDogQueue] = useState([]);
  const [likedDogs, setLikedDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [isAutoRefetching, setIsAutoRefetching] = useState(false);
  const prefetchingRef = useRef(false);
  const autoRefetchRef = useRef(false);
  const hasInitialized = useRef(false);

  // Load likes from session storage on mount
  useEffect(() => {
    const savedLikes = loadLikes();
    setLikedDogs(savedLikes);
  }, []);

  // Initialize: fetch initial queue of dogs
  useEffect(() => {
    // Prevent double-fetch in React Strict Mode
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    async function init() {
      setLoading(true);
      setError(null);
      try {
        // Fetch 5 dogs in parallel
        const dogPromises = Array(QUEUE_SIZE).fill(null).map(() => fetchDog());
        const dogs = await Promise.all(dogPromises);
        setDogQueue(dogs);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    init();
  }, []);

  // Background prefetch to maintain queue size (only when queue has dogs)
  useEffect(() => {
    // Don't prefetch if already prefetching, still loading initial queue, or queue is empty
    if (prefetchingRef.current || loading || dogQueue.length === 0) {
      return;
    }

    // Start prefetching when queue drops below threshold
    if (dogQueue.length <= PREFETCH_THRESHOLD) {
      prefetchingRef.current = true;
      setIsPrefetching(true);

      // Always fetch full batch of 5 dogs
      const dogPromises = Array(QUEUE_SIZE).fill(null).map(() =>
        fetchDog().catch(err => {
          console.error('Prefetch failed:', err);
          return null; // Return null for failed fetches
        })
      );

      Promise.all(dogPromises).then(newDogs => {
        // Filter out any failed fetches
        const validDogs = newDogs.filter(dog => dog !== null);

        if (validDogs.length > 0) {
          setDogQueue(prev => [...prev, ...validDogs]);
        } else {
          // All prefetch attempts failed
          setError('Failed to load more dogs. Please check your connection.');
        }
      }).finally(() => {
        prefetchingRef.current = false;
        setIsPrefetching(false);
      });
    }
  }, [dogQueue.length, loading]);

  // Automatic refetch when queue empties
  useEffect(() => {
    // Don't auto-refetch if already refetching, initial load, or if we have dogs
    if (autoRefetchRef.current || loading || dogQueue.length > 0) {
      return;
    }

    // Queue is empty and we're not in initial load - automatically fetch more
    async function autoRefetch() {
      autoRefetchRef.current = true;
      setIsAutoRefetching(true);
      setError(null);

      try {
        const dogPromises = Array(QUEUE_SIZE).fill(null).map(() =>
          fetchDog().catch(err => {
            console.error('Auto-refetch failed:', err);
            return null;
          })
        );

        const dogs = await Promise.all(dogPromises);
        const validDogs = dogs.filter(dog => dog !== null);

        if (validDogs.length > 0) {
          setDogQueue(validDogs);
        } else {
          setError('Failed to load more dogs. Please check your connection.');
        }
      } catch (err) {
        setError('Failed to load more dogs. Please try again.');
      } finally {
        autoRefetchRef.current = false;
        setIsAutoRefetching(false);
      }
    }

    autoRefetch();
  }, [dogQueue.length, loading]);

  const handleSwipe = (direction) => {
    const currentDog = dogQueue[0];

    // Allow swipe even if queue is empty (will show empty state)
    if (!currentDog) return;

    // If liked, add to likes
    if (direction === 'right') {
      const updatedLikes = [...likedDogs, currentDog];
      setLikedDogs(updatedLikes);
      saveLikes(updatedLikes);
    }

    // Remove current dog from queue
    setDogQueue(prev => prev.slice(1));
  };

  // Debug logging
  useEffect(() => {
    console.log('State:', {
      queueLength: dogQueue.length,
      loading,
      isAutoRefetching,
      prefetching: prefetchingRef.current
    });
  }, [dogQueue.length, loading, isAutoRefetching]);

  return (
    <div className="app">
      <TopNav />
      <div className="content-area">
        {view === 'swipe' ? (
          <SwipeView
            currentDog={dogQueue[0]}
            onSwipe={handleSwipe}
            loading={loading}
            isAutoRefetching={isAutoRefetching}
            error={error}
          />
        ) : (
          <LikesGallery likedDogs={likedDogs} />
        )}
      </div>

      <BottomNav
        activeView={view}
        onViewChange={setView}
        likesCount={likedDogs.length}
      />
    </div>
  );
}

export default App;
