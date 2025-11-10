/**
 * DogCard - Display dog image with full profile
 */
export default function DogCard({ dog, className = '', onSwipe, swipeDirection }) {
  if (!dog) return null;

  const { imageUrl, breed, profile } = dog;

  return (
    <div className={`dog-card ${className}`}>
      <div className="dog-image-container">
        <img
          src={imageUrl}
          alt={`${breed} dog`}
          className="dog-image"
          loading="lazy"
        />

        {onSwipe && (
          <div className="dog-card-actions">
            <button
              className="action-button pass-button"
              onClick={() => onSwipe('left')}
              aria-label="Pass"
              disabled={swipeDirection !== null}
            >
              <span className="button-icon">✖️</span>
              <span className="button-label">Pass</span>
            </button>

            <button
              className="action-button like-button"
              onClick={() => onSwipe('right')}
              aria-label="Like"
              disabled={swipeDirection !== null}
            >
              <span className="button-icon">❤️</span>
              <span className="button-label">Like</span>
            </button>
          </div>
        )}
      </div>

      <div className="dog-profile">
        <div className="profile-header">
          <h2 className="dog-name">{profile.name}, {profile.age}</h2>
          <p className="dog-breed">{breed}</p>
        </div>

        <div className="profile-section">
          <p className="bio">{profile.bio}</p>
        </div>

        <div className="profile-section">
          <h3 className="section-title">💼 Interests</h3>
          <ul className="interests-list">
            {profile.interests.map((interest, index) => (
              <li key={index}>{interest}</li>
            ))}
          </ul>
        </div>

        {profile.lookingFor && (
          <div className="profile-section">
            <h3 className="section-title">💭 Looking for</h3>
            <p className="looking-for">{profile.lookingFor}</p>
          </div>
        )}

        <div className="profile-section">
          <h3 className="section-title">✨ Personality</h3>
          <div className="traits">
            {profile.traits.map((trait, index) => (
              <span key={index} className="trait">{trait}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
