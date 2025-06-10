import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumbs from '../public/Breadcrumbs';
import '../../css/NewProduct.css';
import { Checkbox } from '@mui/material';
import { serverUrl, apiUrl } from '../../utils/utils';

const NewProduct = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const productData = location.state?.productData;

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        statusType: 'true',
        stockQuantity: ''
    });
    const [isActive, setIsActive] = useState(true); // Status checkbox için state
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('useEffect triggered with productData:', productData); // Debug için

        if (productData) {
            console.log('Setting form data with:', productData); // Debug için
            setFormData({
                name: productData.name || '',
                category: productData.category || '',
                description: productData.description || '',
                price: productData.price ? productData.price.toString() : '',
                stockQuantity: productData.stockQuantity ? productData.stockQuantity.toString() : ''
            });

            if (productData.imageUrl) {
                setImagePreview(`${serverUrl}${productData.imageUrl}`);
            }
        } else {
            console.log('No product data, resetting form'); // Debug için
            setFormData({
                name: '',
                category: '',
                description: '',
                price: '',
                stockQuantity: ''
            });
            setImage(null);
            setImagePreview(null);
        }
    }, [productData]);

    const formatPrice = (value) => {
        // Sayı ve nokta dışındaki karakterleri temizle
        let cleanValue = value.replace(/[^0-9.]/g, '');
        
        // Birden fazla noktayı engelle
        const parts = cleanValue.split('.');
        if (parts.length > 2) {
            cleanValue = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Kuruş kısmını 2 basamakla sınırla
        if (parts.length === 2 && parts[1].length > 2) {
            cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
        }

        // Başındaki sıfırları temizle (0 ve 0. hariç)
        if (cleanValue.length > 1 && cleanValue[0] === '0' && cleanValue[1] !== '.') {
            cleanValue = cleanValue.replace(/^0+/, '');
        }

        return cleanValue;
    };

    const formatStock = (value) => {
        // Sayı dışındaki karakterleri temizle
        const numericValue = value.replace(/[^0-9]/g, '');
        
        // Başındaki sıfırları temizle
        const cleanValue = numericValue.replace(/^0+/, '') || '0';
        
        // Binlik ayracı ekle
        return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Stock alanı için sayı formatı kontrolü
        if (name === 'stockQuantity') {
            const formattedStock = formatStock(value);
            setFormData(prev => ({
                ...prev,
                [name]: formattedStock
            }));
            return;
        }

        // Price alanı için parasal değer kontrolü
        if (name === 'price') {
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
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Resim boyutu 5MB\'dan küçük olmalıdır');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('Lütfen geçerli bir resim dosyası seçin');
                return;
            }

            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
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
            
            if (!imagePreview) {
                setError('Lütfen bir resim yükleyin');
                return;
            }
            
            // Form verilerini hazırlama
            const formDataToSend = new FormData();
            if (productData?._id) {
                formDataToSend.append('id', productData._id); // Güncelleme için ID
            }
            formDataToSend.append('name', formData.name);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('stockQuantity', formData.stockQuantity.replace(/,/g, '')); // Sayısal formata çevir
            formDataToSend.append('statusType', isActive ? 'true' : 'false'); // Checkbox durumu
            
            if (image) {
                formDataToSend.append('image', image); // Resim dosyası
            }
    
            // API URL'sini belirleme
            const url = productData?._id
                ? `${apiUrl}/products/${productData._id}` // Güncelleme için PUT
                : `${apiUrl}/products`; // Yeni ürün için POST
    
            // API çağrısı
            const response = await fetch(url, {
                method: productData?._id ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend
            });
    
            const data = await response.json();
    
            if (data.success) {
                navigate('/products'); // Ürünler sayfasına yönlendirme
            } else {
                setError(data.message || 'Bir hata oluştu');
            }
        } catch (error) {
            setLoading(false);            
            setError(error.message || 'Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    };
    
    const pathnames = [
        {
          path: 'Ürünler',
          link: '/products',
        },
        {
          path: (productData ? 'Ürün Düzenle' : 'Yeni Ürün'),
          link: '',
        }
    ];

    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs breadcrumbs={pathnames} />
                <form id="productForm" onSubmit={handleSubmit} className="new-product-form">
                    <div className="page-header">
                        {/* <h1 className='headerClass'>{productData ? 'Ürün Düzenle' : 'Yeni Ürün'}</h1> */}
                        <div className="form-actions">
                            <button 
                                type="submit"
                                form="productForm"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (productData ? 'Güncelle' : 'Kaydet')}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/products')}
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
                        <label htmlFor="category">Kategori</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Kategori Seçin</option>
                            <option value="Endodonti">Endodonti</option>
                            <option value="Restoratif">Restoratif</option>
                            <option value="Protetik">Protetik</option>
                            <option value="Cerrahi">Cerrahi</option>
                            <option value="Ortodonti">Ortodonti</option>
                            <option value="Periodonti">Periodonti</option>
                            <option value="Pedodonti">Pedodonti</option>
                            <option value="İmplant">İmplant</option>
                            <option value="Genel">Genel</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Ürün Adı</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="price">Fiyat (₺)</label>
                            <input
                                type="text"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                pattern="^\d*\.?\d{0,2}$"
                                inputMode="decimal"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="stockQuantity">Stok Miktarı</label>
                            <input
                                type="text"
                                id="stockQuantity"
                                name="stockQuantity"
                                value={formData.stockQuantity}
                                onChange={handleInputChange}
                                pattern="[0-9,]*"
                                inputMode="numeric"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="statusType">Ürün Aktif mi?</label>
                            <Checkbox style={{ height: '24px', maxWidth: '24px', color: 'white' }}
                                type="checkbox"                            
                                id="statusType"
                                name="statusType"
                                checked={isActive}
                                value={formData.statusType}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />                     
                        </div>
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
                        <label htmlFor="image">Ürün Görseli</label>
                        <div className="avatar-options">
                            <div className="upload-section">
                                <label htmlFor="image" className="upload-label" style={{ textAlign: 'center',width: '100%',color: 'white' }}>
                                    Resim Yükle
                                    <input
                                        type="file"
                                        id="image"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />                                    
                                </label>                                
                                {imagePreview && (
                                    <div className="image-preview">
                                        <img loading="lazy" src={imagePreview} alt="Ürün önizleme" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProduct;
