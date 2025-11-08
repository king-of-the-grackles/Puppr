/**
 * BottomNav - Fixed bottom navigation bar
 */
export default function BottomNav({ activeView, onViewChange, likesCount }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-button ${activeView === 'swipe' ? 'active' : ''}`}
        onClick={() => onViewChange('swipe')}
        aria-label="Swipe view"
      >
        <span className="icon">🐕</span>
        <span className="label">Swipe</span>
      </button>

      <button
        className={`nav-button ${activeView === 'gallery' ? 'active' : ''}`}
        onClick={() => onViewChange('gallery')}
        aria-label="Likes gallery"
      >
        <span className="icon">❤️</span>
        <span className="label">Likes</span>
        {likesCount > 0 && (
          <span className="badge">{likesCount}</span>
        )}
      </button>
    </nav>
  );
}
