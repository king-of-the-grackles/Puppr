/**
 * DogCard - Display dog image with full profile
 */
export default function DogCard({ dog, className = '' }) {
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

        <div className="profile-section">
          <h3 className="section-title">💭 Looking for</h3>
          <p className="looking-for">{profile.lookingFor}</p>
        </div>

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
