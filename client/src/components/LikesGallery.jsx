import { useState } from 'react';
import DogCard from './DogCard';

/**
 * LikesGallery - Display all liked dogs in a grid
 */
export default function LikesGallery({ likedDogs }) {
  const [selectedDog, setSelectedDog] = useState(null);

  if (likedDogs.length === 0) {
    return (
      <div className="likes-gallery">
        <div className="empty-state">
          <p className="empty-message">No likes yet! Start swiping 🐕</p>
        </div>
      </div>
    );
  }

  return (
    <div className="likes-gallery">
      <div className="gallery-header">
        <h2>Your Matches</h2>
        <p className="likes-count">{likedDogs.length} {likedDogs.length === 1 ? 'dog' : 'dogs'}</p>
      </div>

      <div className="gallery-grid">
        {likedDogs.map((dog) => (
          <div
            key={dog.id}
            className="gallery-item"
            onClick={() => setSelectedDog(dog)}
          >
            <img
              src={dog.imageUrl}
              alt={`${dog.breed} dog`}
              className="gallery-image"
            />
            <div className="gallery-overlay">
              <p className="gallery-name">{dog.profile.name}</p>
              <p className="gallery-age">{dog.profile.age} years</p>
            </div>
          </div>
        ))}
      </div>

      {selectedDog && (
        <div className="modal-overlay" onClick={() => setSelectedDog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedDog(null)}
              aria-label="Close"
            >
              ✖️
            </button>
            <DogCard dog={selectedDog} />
          </div>
        </div>
      )}
    </div>
  );
}
