import React, { useEffect, useState } from 'react';
import '../../css/imageSlider.css';
import { serverUrl, apiUrl } from '../../utils/utils';


const Footer = () => {
    const [referenceList, setReferenceList] = useState([]);
    const scrollRef = React.useRef(null);  
  useEffect(() => {
    // Sayfa yüklendiğinde referans resimlerini al
    fetchReferenceList();
  }, []);

 useEffect(() => {
  if (referenceList.length > 0) {
    let resetTimeout = null;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        // Toleransı artırın (ör: 30px)
        if (
          scrollRef.current.scrollLeft + scrollRef.current.offsetWidth >=
          scrollRef.current.scrollWidth - 30
        ) {
          // Son resme gelince kısa bir bekleme ile başa dön
          if (!resetTimeout) {
              resetTimeout = setTimeout(() => {
                scrollRef.current.scrollLeft = 0;
                resetTimeout = null;
              }, 500); // 0.5 saniye bekle
          }
        } else {
          scrollRef.current.scrollLeft += 2;
        }
      }
    }, 30);
    return () => {
      clearInterval(interval);
      if (resetTimeout) clearTimeout(resetTimeout);
    };
  }
}, [referenceList]);

  const fetchReferenceList = async () => {
      try {
        const response = await fetch(`${apiUrl}/references/referenceList`);
        const data = await response.json();

        if (data.success) {

          data.references.map(ref => {
             ref.imageUrl = `${serverUrl}${ref.imageUrl}`;
          });

          if(data.references.length > 0){
            setReferenceList(data.references);
          }
        } else {
          console.error('Referans resimleri alınamadı:', data.message);
        }
      } catch (error) {
        console.error('Referans resimleri alınırken hata:', error);
      }
    };

  return ( 

    <div class="footer">   
        {referenceList && referenceList.length > 0 && (
          <div className="image-section-slider">
            <div className="slider-container" ref={scrollRef}>
              {referenceList.map((ref, index) => (
              <div className="slider-feature-card" key={index}>
                {ref.webLink ? (
                  <a href={ref.webLink} target="_blank" rel="noopener noreferrer">
                    <img
                      src={ref.imageUrl}
                      className="slider-image"
                      alt={`Referans ${index + 1}`}
                    />
                  </a>
                ) : (
                  <img
                    src={ref.imageUrl}
                    className="slider-image"
                    alt={`Referans ${index + 1}`}
                  />
                )}
              </div>
            ))}
            </div>
          </div>
        )}
        <div class="copyright">
            <a href="/">@HantSoft </a> telif hakkı ihlali düşündüğünüz içerikler için lütfen 
            <a href="/Contact" style={{color:'darkblue'}}>iletişim sayfamızdan</a> bizimle iletişime geçin.
        </div> 
    </div>
  );
}
export default Footer;