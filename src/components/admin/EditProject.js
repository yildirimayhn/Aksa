import React, { useState, useEffect } from 'react';
import {useNavigate, useLocation } from 'react-router-dom';

import DatePicker from 'react-datepicker'; // react-datepicker kütüphanesini kullanıyoruz
import { tr } from 'date-fns/locale/tr';
import 'react-datepicker/dist/react-datepicker.css'; // CSS dosyasını ekliyoruz

import Breadcrumbs from '../public/Breadcrumbs';
import CCrousel from '../htmlComponent/CCarousel';

import '../../css/NewProduct.css';
import { Checkbox } from '@mui/material';
import { formatPrice, categoryTypeEnum, apiUrl } from '../../utils/utils';

const EditProject = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [isActive, setIsActive] = useState(true); // Status checkbox için state
    const [isVisibleCost, setIsVisibleCost] = useState(false); // Status checkbox için state
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [categories, setCategories] = useState([]); // Faaliyet türleri için state
    const projectData = location.state?.projectData;
    const [formData, setFormData] = useState({
        name: '',
        typeofActivityId: 0,
        description: '',
        statusType: 'true',
        projectCost: '',
        isVisibleCost: false,
        startDate: '',
        endDate: '',
        imageUrls: []
    });
    

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    useEffect(() => {
        fetchCategories();

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        if (projectData) {
            setFormData({
                id: projectData._id || '',
                name: projectData.name || '',
                statusType: projectData.statusType === 'true' ? true : false,
                typeofActivityId: projectData.typeofActivityId || 0,
                description: projectData.description || '',
                projectCost: projectData.projectCost ? projectData.projectCost.toString() : '',
                isVisibleCost: projectData.isVisibleCost || false,
                startDate: projectData.startDate ? new Date(projectData.startDate) : null,
                endDate: projectData.endDate ? new Date(projectData.endDate) : null,
                imageUrls: projectData.imageUrls || [],
            });

            if (projectData.imageUrls && projectData.imageUrls.length > 0) {
                setImages(projectData.imageUrls.map(url => `http://localhost:5001${url}`)); // Resim URL'lerini ayarlıyoruz
                setImagePreviews(projectData.imageUrls.map(url => `http://localhost:5001${url}`)); // Resim önizlemelerini ayarlıyoruz
            }
        } else {
            console.log('No project data, resetting form'); // Debug için
            setFormData({
                name: '',
                statusType: '',
                description: '',
                projectCost: '',
                typeofActivityId: false,
                startDate: '',
                endDate: '',
                imageUrls: []
            });
            setImages([]);
            setImagePreviews([]);
        }
        }, [projectData]);
        
    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const categoryTypeId = categoryTypeEnum.PROJECT; // Faaliyet türü için ID
            
            const response = await fetch(`${apiUrl}/categories/categorytypes?categoryTypeId=${categoryTypeId}`);
            
            const data = await response.json();
            if (data.success) {
                console.log('Kategoriler:', data.categories); // Debug için

                setCategories(data.categories); // Kategorileri state'e kaydet
            } else {
                console.error('Kategori verileri alınamadı:', data.message);
            }
        } catch (error) {
            console.error('Kategori verileri alınırken hata:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;        
         
        // Price alanı için parasal değer kontrolü
        if (name === 'projectCost') {
            const formattedPrice = formatPrice(value);
            setFormData(prev => ({
                ...prev,
                [name]: formattedPrice
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
 
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
         
        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                setError('Resim boyutu 5MB\'dan küçük olmalıdır');
                return false;
            }
            if (!file.type.startsWith('image/')) {
                setError('Lütfen geçerli bir resim dosyası seçin');
                return false;
            }
            return true;
        });
    
        setImages(validFiles);
        setImagePreviews(validFiles.map(file => URL.createObjectURL(file)));
        setError('');
    };

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
             
            const formDataToSend = new FormData();
            if (projectData?._id) {
                formDataToSend.append('id', projectData._id); // Güncelleme için ID
            }
            if (images.length > 0) {
                const imageSizeValid = images.map((x) => x.size).reduce((a,b)=>a+b, 0) > 5 * 1024 * 1024;// 5MB kontrolü
                if (imageSizeValid) {
                    setError('Resim boyutu 5MB\'dan küçük olmalıdır');
                    return;
                }else {
                    images.forEach(image => formDataToSend.append('images', image)); // Resim dosyaları
                } 
            }
            formDataToSend.append('typeofActivityId', formData.typeofActivityId);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('statusType', isActive ? 'true' : 'false'); // Checkbox durumu
            formDataToSend.append('projectCost', formData.projectCost);
            formDataToSend.append('isVisibleCost', isVisibleCost ? 'true' : 'false'); // Checkbox durumu
            formDataToSend.append('startDate', startDate ? startDate.toISOString() : '');
            formDataToSend.append('endDate', endDate ? endDate.toISOString() : null);
           
            
            const url = projectData?._id
                ? `${apiUrl}/projects/${projectData._id}` // Güncelleme için PUT
                : `${apiUrl}/projects`; // Yeni proje için POST
    
            const response = await fetch(url, {
                method: projectData?._id ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend,
            });
    
            const data = await response.json();
    
            if (data.success) {
                navigate('/projectList'); // Projeler sayfasına yönlendirme
            } else {
                setError(data.message || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Form gönderme hatası:', error);
            setError(error.message || 'Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    };
    
    const pathnames = [
        {
          path: 'Projeler',
          link: '/projects',
        },
        {
          path: (projectData ? 'Proje Düzenle' : 'Yeni Proje'),
          link: '',
        }
    ];
    
    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs breadcrumbs={pathnames} />
                <form id="productForm" onSubmit={handleSubmit} className="new-product-form">
                    <div className="page-header">
                        {/* <h1 className='headerClass'>{projectData ? 'Proje Düzenle' : 'Yeni Proje'}</h1> */}
                        <div className="form-actions">
                            <button 
                                type="submit"
                                form="productForm"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (projectData ? 'Güncelle' : 'Kaydet')}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate(-1)}
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
                        <label htmlFor="name">Proje Adı</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="typeofActivityId">Faaliyet Türü</label>
                        <select
                            id="typeofActivityId"
                            name="typeofActivityId"
                            value={formData.typeofActivityId}
                            onChange={handleInputChange} 
                            required
                        >
                            <option value="">Seçiniz</option>
                            {
                                categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="projectCost">Maliyeti (₺)</label>
                            <input
                                type="text"
                                id="projectCost"
                                name="projectCost"
                                value={formData.projectCost}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                pattern="^\d*\.?\d{0,2}$"
                                inputMode="decimal"
                                required
                            />
                        </div> 
                    </div>  
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="isVisibleCost">Maliyet Görünsün mü?</label>
                            <Checkbox style={{ height: '24px', maxWidth: '24px', color: 'cadetblue' }}
                                type="checkbox"                            
                                id="isVisibleCost"
                                name="isVisibleCost"
                                checked={isVisibleCost}
                                value={formData.isVisibleCost}
                                onChange={(e) => setIsVisibleCost(e.target.checked)}
                            />                     
                        </div>
                    </div> 
                      
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="statusType">Proje Aktif mi?</label>
                            <Checkbox style={{ height: '24px', maxWidth: '24px', color: 'cadetblue' }}
                                type="checkbox"                            
                                id="statusType"
                                name="statusType"
                                checked={isActive}
                                value={formData.statusType}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />                     
                        </div>
                    </div>  

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="startDate">Başlama Tarihi</label>
                             <DatePicker 
                                required
                                isClearable 
                                showYearDropdown={true}
                                showMonthDropdown={true}
                                dropdownMode="select"
                                locale={tr}
                                calendarIconClassname={"calendar-icon"}
                                dateFormat="dd/MM/yyyy"
                                selected={startDate} 
                                maxDate={new Date()} // Bugünden önceki tarihleri seçememek için
                                onChange={(date) => setStartDate(date)} />
                        </div>
                        {!isActive && (
                        <div className="form-group">
                            <label htmlFor="endDate">Bitiş Tarihi</label>
                            <DatePicker 
                                required
                                isClearable 
                                showYearDropdown={true}
                                showMonthDropdown={true}
                                dropdownMode="select"
                                locale={tr}
                                calendarIconClassname={"calendar-icon"}
                                dateFormat="dd/MM/yyyy"
                                selected={endDate}
                                minDate={startDate} // Başlama tarihinden sonra bir tarih seçilmesini sağlıyoruz
                                endDate={startDate} // Bugünden önceki tarihleri seçememek için
                                maxDate={new Date()} // Bugünden önceki tarihleri seçememek için
                                onChange={(date) => setEndDate(date)}
                            />
                        </div>)
                        }
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Açıklama</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="images">Proje Görselleri</label>
                        <div className="avatar-options">
                            <div className="upload-section">
                                <label htmlFor="images" className="upload-label" style={{ textAlign: 'center',width: '100%',color: 'white' }}>
                                    Resim Yükle
                                    <input
                                        type="file"
                                        id="images"                                        
                                        multiple // Eğer birden fazla resim yüklemek istiyorsanız burayı açabilirsiniz.
                                        
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />                                    
                                </label>
                            </div>
                            <div >
                            {imagePreviews && imagePreviews.length > 0 && (
                                <CCrousel  imageList={imagePreviews} />
                            )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProject;
