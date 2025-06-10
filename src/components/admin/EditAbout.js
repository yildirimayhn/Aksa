import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from '../public/Breadcrumbs';
import '../../css/EditUser.css';
import { useApiCall } from '../../utils/apiCalls';
import {apiUrl} from '../../utils/utils';


const EditAbout = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({
        aboutText:'',
        visionText:'',
        missionText:''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { apiData, apiError, apiLoading } = useApiCall('/abouts', 'GET', null, true);

    useEffect(() => {
        if (apiData && apiData.about) {
            if (apiData.success && apiData.about.length > 0) {    
                setFormData(apiData.about[0]);
            } 
        }
        if (apiError) {
            console.error('Sayfa yüklenirken hata:', apiError);
            setError('Sunucu bağlantısı başarısız');
        }
        setLoading(apiLoading);
    }, [apiData, apiError, apiLoading]);

  
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const url = formData?._id ? '/abouts/' + formData._id : '/abouts';
            const apiCallUrl = apiUrl + url;
            
            const response = await fetch(apiCallUrl, {
                method: formData?._id ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    aboutText: formData.aboutText,
                    visionText: formData.visionText,
                    missionText: formData.missionText,

                })
            });

            const data = await response.json();

            if (data.success) { 
                setFormData(data.about);
                setError('');
                navigate('/about');
            } else {
                setError(data.message || 'Veri kaydedilirken bir hata oluştu');
            }
        } catch (error) {
            console.error('Form gönderme hatası:', error);
            setError('Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || currentUser.role !== 'admin') {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
    }
    if (loading) {
        return <div className="loading">Yükleniyor...</div>;
    }
    
    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs breadcrumbs={[{path:'Biz Kimiz', link:''}]} />
                <form id="formPage" onSubmit={handleSubmit} className="edit-user-form">
                    <div className="page-header">
                        {/* <h1 className='headerClass'>Biz Kimiz</h1> */}
                        <div className="form-actions">
                            <button 
                                type="submit"
                                form="formPage"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (formData?._id ? 'Güncelle' : 'Kaydet')}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/')}
                                className="cancel-button"
                            >
                                İptal
                            </button>
                        </div>
                    </div>                
                    <hr></hr>
                    <br></br>
                    {error && <div className="error-message">{error}</div>}
                
                    <div className="form-group">
                        <label htmlFor="aboutText">Hakkımızda</label>
                        <textarea
                            id="aboutText"
                            name="aboutText"
                            required
                            value={formData.aboutText} 
                            onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="visionText">Vizyonumuz</label>
                        <textarea
                            id="visionText"
                            name="visionText"
                            required
                            value={formData.visionText} 
                            onChange={(e) => setFormData({ ...formData, visionText: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="missionText">Misyonumuz</label>
                        <textarea
                            id="missionText"
                            name="missionText"
                            required
                            value={formData.missionText} 
                            onChange={(e) => setFormData({ ...formData, missionText: e.target.value })}
                        />
                    </div>
                </form>
            </div>
            
        </div>
    );
};

export default EditAbout;
