import React, { useState, useEffect } from "react";
import "../../css/imageSlider.css";
import "../../css/Banner.css";

const CCrousel = ({ imageList }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const visibleImagesCount = 8; // Görüntülenecek resim sayısı

    // Eğer imageList değişirse, index sıfırlansın
    useEffect(() => {
        setCurrentImageIndex(0);
         if (!isModalOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsModalOpen(false);
                setSelectedImage(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isModalOpen]);

    const handleNextImage = () => {
        if (currentImageIndex < imageList.length - visibleImagesCount) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    const handlePrevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };

    const visibleImages = imageList.slice(
        currentImageIndex,
        Math.min(currentImageIndex + visibleImagesCount, imageList.length)
    );

    return (
        <div className="image-slider">
            {imageList && imageList.length > 0 && (
                <>
                    {currentImageIndex > 0 && (
                        <button type="button" className="prev-button" onClick={handlePrevImage}>
                            &#10094;
                        </button>
                    )}
                    <div className="image-slider-container">
                        {visibleImages.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`${currentImageIndex + index + 1}`}
                                className="slider-image"
                                onClick={() => handleImageClick(image)}
                            />
                        ))}
                    </div>
                    {currentImageIndex < imageList.length - visibleImagesCount && (
                        <button type="button" className="next-button" onClick={handleNextImage}>
                            &#10095;
                        </button>
                    )}
                </>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" style={{ zIndex: '5000' }} onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" style={{fontSize:50}} onClick={handleCloseModal}>
                            &times;
                        </button>
                        <img loading="lazy" src={selectedImage} style={{maxWidth:450}} alt="Büyütülmüş Görsel" className="modal-image" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CCrousel;