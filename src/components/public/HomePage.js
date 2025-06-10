import React from 'react';
import { useNavigate } from 'react-router-dom';

import '../../css/HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container"> 
            <div className="main-content">
                <div className="welcome-section">
                    <h1>Dental Ürün Yönetim Sistemine Hoş Geldiniz</h1>
                    <p>Dental ürünlerinizi kolayca yönetin ve takip edin.</p>
                </div>

                <div className="features-section">
                    <div className="feature-card">
                        <i className="fas fa-box"></i>
                        <h3>Ürün Yönetimi</h3>
                        <p>Tüm dental ürünlerinizi tek bir yerden yönetin.</p>
                        <button onClick={() => navigate('/products')} className="feature-button">
                            Ürünleri Görüntüle
                        </button>
                    </div>

                    <div className="feature-card">
                        <i className="fas fa-plus-circle"></i>
                        <h3>Yeni Ürün Ekle</h3>
                        <p>Sisteme hızlıca yeni ürünler ekleyin.</p>
                        <button onClick={() => navigate('/product/new')} className="feature-button">
                            Ürün Ekle
                        </button>
                    </div>

                    <div className="feature-card">
                        <i className="fas fa-project-diagram"></i>
                        <h3>Projeler</h3>
                        <p>Dental projelerinizi takip edin.</p>
                        <button onClick={() => navigate('/projects')} className="feature-button">
                            Projeleri Görüntüle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
