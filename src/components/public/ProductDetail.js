import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import CCrousel from '../htmlComponent/CCarousel';

import '../../css/HomePage.css';
import '../../css/Projects.css';

const ProductDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const productData = location.state?.productData;
    
    const [formData, setFormData] = useState({
            name: '',
            category: '',
            description: '',
            price: '',
            stockQuantity: ''
        });
        const [imagePreview, setImagePreview] = useState(null);
    
    useEffect(() => {

        if (productData) {
            setFormData({
                name: productData.name || '',
                category: productData.category || '',
                description: productData.description || '',
                price: productData.price ? productData.price.toString() : '',
                stockQuantity: productData.stockQuantity ? productData.stockQuantity.toString() : ''
            });

            if (productData.imageUrl) {
                setImagePreview(`http://localhost:5001${productData.imageUrl}`);
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
            setImagePreview(null);
        }
    }, [productData]);
    
    
    const pathnames = [
        {
          path: 'Ürünler',
          link: '/product',
        },
        {
          path: 'Ürün Detayı',
          link: '',
        }
    ];

    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs breadcrumbs={pathnames} />
                <div className="page-header">
                    {/* <h1 className='headerClass'><i class="fa-solid fa-circle-info"></i> Ürün Detay</h1>  */}
                    <div className="header-actions">
                       <button className="btn btn-primary" onClick={() => navigate(-1)}>
                         <i class="fa-solid fa-hand-back-point-left" >Geri</i>
                        </button>
                    </div>
                </div>                   
                <hr></hr>
                <br></br>
                <div className="features-section">
                    <div className="feature-card">   
                       
                        <div className="row">
                                
                            <div className="col-3" style={{ row: '20px' }}>
                                <div className="form-group">
                                    <div className="avatar-options">
                                        <div className="upload-section">    
                                            {imagePreview && (
                                                <CCrousel imageList={[imagePreview]} />
                                            )}                                   

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-9">

                                <div className="form-group">
                                    <label htmlFor="category">Kategori</label>
                                    <label className='justifyLabel' id="category"name="category">{formData.category}</label>                                                     
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="name">Ürün Adı</label>
                                    <label className='justifyLabel' id="name" name="name"> {formData.name}</label>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="price">Fiyat (₺)</label>
                                    <label className='justifyLabel' id="price"name="price">{formData.price}</label>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="stockQuantity">Stok Miktarı</label>
                                    <label className='justifyLabel' id="stockQuantity" name="stockQuantity">{formData.stockQuantity}</label>
                                    
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Açıklama</label>
                                    <label className='justifyLabel'
                                        id="description"
                                        name="description"
                                    >{formData.description}
                                     
                                    </label>
                                </div>
                            </div>
                            
                        </div> 
                    </div> 
                </div>
            </div>
            
        </div>
    );
};

export default ProductDetail;
