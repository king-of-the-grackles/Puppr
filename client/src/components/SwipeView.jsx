import { useState } from 'react';
import DogCard from './DogCard';

/**
 * SwipeView - Main swipe interface with Pass/Like buttons
 */
export default function SwipeView({ currentDog, onSwipe, loading, isAutoRefetching, error }) {
  const [swipeDirection, setSwipeDirection] = useState(null);

  const handleSwipe = (direction) => {
    setSwipeDirection(direction);

    // Wait for animation to complete
    setTimeout(() => {
      onSwipe(direction);
      setSwipeDirection(null);
    }, 300);
  };

  if (error) {
    return (
      <div className="swipe-view">
        <div className="error-state">
          <p className="error-message">❌ {error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state (either initial load or auto-refetch)
  if ((loading || isAutoRefetching) && !currentDog) {
    const message = loading
      ? "Sniffing out the best pups..."
      : "Finding more dogs...";

    return (
      <div className="swipe-view">
        <div className="loading-state">
          <div className="dog-spinner">🐕</div>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  if (!currentDog) {
    return null; // Should not happen, but safety fallback
  }

  const cardClassName = swipeDirection ? `swiping-${swipeDirection}` : 'entering';

  return (
    <div className="swipe-view">
      <DogCard
        key={currentDog.id}
        dog={currentDog}
        className={cardClassName}
        onSwipe={handleSwipe}
        swipeDirection={swipeDirection}
      />
    </div>
  );
}
