import { useState } from 'react';
import DogCard from './DogCard';

/**
 * SwipeView - Main swipe interface with Pass/Like buttons
 */
export default function SwipeView({ currentDog, onSwipe, loading, error }) {
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

  if (loading && !currentDog) {
    return (
      <div className="swipe-view">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Finding your next match...</p>
        </div>
      </div>
    );
  }

  if (!currentDog) {
    return (
      <div className="swipe-view">
        <div className="empty-state">
          <p>No more dogs available</p>
        </div>
      </div>
    );
  }

  const cardClassName = swipeDirection ? `swiping-${swipeDirection}` : 'entering';

  return (
    <div className="swipe-view">
      <DogCard
        dog={currentDog}
        className={cardClassName}
        onSwipe={handleSwipe}
        swipeDirection={swipeDirection}
      />
    </div>
  );
}
