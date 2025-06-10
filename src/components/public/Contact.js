import React, { useState } from 'react';
import { Helmet} from 'react-helmet-async';

import Breadcrumbs from '../public/Breadcrumbs';
import { apiUrl } from '../../utils/utils';

import '../../css/HomePage.css';   

const Contact = () => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        succesMessage:''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/contact/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {

                setShowSuccess(true);
                setFormData({ name: '', email: '', message: '', succesMessage: 'Mesajınız başarıyla gönderilmiştir.' });
                setTimeout(() => setShowSuccess(false), 5000);
            } else {
                alert('Mail gönderilemedi: ' + data.message);
            }
        } catch (err) {
            alert('Sunucu hatası: ' + err.message);
        }
    }; 
    
    const pathnames = [
        {
          path: 'İletişim',
          link: '',
        }
    ];

    return (
        <>
        <Helmet>
            <script type="application/ld+json">
                {`
                {
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    "name": "Aksa İnşaat",
                    "image": "https://www.aksainsaat.com.tr/aksa-insaat.png",
                    "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Bektaş Sk No:6/18",
                    "addressLocality": "Kartal",
                    "addressRegion": "İstanbul",
                    "postalCode": "34880",
                    "addressCountry": "TR"
                    },
                    "telephone": "+902164511313",
                    "url": "https://www.aksainsaat.com.tr",
                    "aggregateRating": {
                    "@type": "AggregateRating",
                    }
                }
                `}
            </script>
            
            {/* "ratingValue": "4.9", google da işletmeye verilen puan 
            "reviewCount": "141" google da işletmeye verilen puan veya yorum sayisi */}
            </Helmet>

            <div className="home-container">
                <div className="main-content">
                    <Breadcrumbs breadcrumbs={pathnames} />
                    <div className="form-container" >
                        <form onSubmit={handleSubmit}>
                            <div className='succes-message' style={{display: showSuccess ? 'block' : 'none'}} >
                                {formData.succesMessage}
                            </div>
                            <div className="form-group">
                                <label htmlFor="name">Adınız:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    maxLength={250}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">E-posta:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    maxLength={250}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Mesajınız:</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="10"
                                    required
                                ></textarea>
                            </div>
                            <div className="form-actions">
                                <div className="form-group">
                                    <label htmlFor='submit' ></label>
                                    <button id='submit' type="submit" className="submit-button">
                                        Gönder
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
            </div>
        </>
        );
};

export default Contact;
