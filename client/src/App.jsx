import { useState, useEffect } from 'react';
import SwipeView from './components/SwipeView';
import LikesGallery from './components/LikesGallery';
import BottomNav from './components/BottomNav';
import { fetchDog } from './services/api';
import { loadLikes, saveLikes } from './services/storage';

function App() {
  const [view, setView] = useState('swipe');
  const [currentDog, setCurrentDog] = useState(null);
  const [nextDog, setNextDog] = useState(null);
  const [likedDogs, setLikedDogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load likes from session storage on mount
  useEffect(() => {
    const savedLikes = loadLikes();
    setLikedDogs(savedLikes);
  }, []);

  // Initialize: fetch first two dogs
  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const first = await fetchDog();
        const second = await fetchDog();
        setCurrentDog(first);
        setNextDog(second);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Prefetch next dog when nextDog is used
  useEffect(() => {
    if (currentDog && !nextDog && !loading) {
      fetchDog()
        .then(setNextDog)
        .catch(err => console.error('Prefetch failed:', err));
    }
  }, [currentDog, nextDog, loading]);

  const handleSwipe = (direction) => {
    if (!currentDog) return;

    // If liked, add to likes
    if (direction === 'right') {
      const updatedLikes = [...likedDogs, currentDog];
      setLikedDogs(updatedLikes);
      saveLikes(updatedLikes);
    }

    // Move to next dog
    setCurrentDog(nextDog);
    setNextDog(null); // Triggers prefetch in useEffect
  };

  return (
    <div className="app">
      <div className="content-area">
        {view === 'swipe' ? (
          <SwipeView
            currentDog={currentDog}
            onSwipe={handleSwipe}
            loading={loading}
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
