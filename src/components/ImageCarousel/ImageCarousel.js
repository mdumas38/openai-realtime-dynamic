import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';
import './ImageCarousel.scss';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState([]);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const preloadImages = () => {
      images.forEach((image, index) => {
        const img = new Image();
        img.src = image.url;
        img.onload = () => setLoadedImages(prev => [...prev, index]);
      });
    };
    preloadImages();
  }, [images]);

  const handleImageLoad = (index) => {
    if (!loadedImages.includes(index)) {
      setLoadedImages(prev => [...prev, index]);
    }
  };

  const nextImage = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="image-carousel">
      <div className="carousel-content">
        <div className="carousel-container">
          <button onClick={prevImage} className="carousel-button prev" aria-label="Previous image">
            <ChevronLeft />
          </button>
          {images.map((image, index) => (
            <div
              key={image.key}
              className={`carousel-slide ${index === currentIndex ? 'active' : ''} ${
                loadedImages.includes(index) ? 'loaded' : ''
              } ${direction > 0 ? 'slide-next' : direction < 0 ? 'slide-prev' : ''}`}
            >
              <img
                src={image.url}
                alt={`Generated image ${index + 1}`}
                onLoad={() => handleImageLoad(index)}
              />
            </div>
          ))}
          <button onClick={nextImage} className="carousel-button next" aria-label="Next image">
            <ChevronRight />
          </button>
          <div className="carousel-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="image-prompt">
          <h4>Prompt:</h4>
          <p>{images[currentIndex]?.prompt}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
