import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import { apiUrl } from '../../utils/utils';

const Product = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try { 
            setLoading(true);
            setError('');

            const response = await fetch(`${apiUrl}/products/productList`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                setLoading(false);
                throw new Error('Ürünler yüklenirken bir hata oluştu');
            }
    
            const data = await response.json();
            setProducts(data.products); // Ürünleri state'e ekle

        } catch (error) {
            setError('Ürünler yüklenirken bir hata oluştu : ' + error);
        } finally {
            setLoading(false);
        }
    }; 

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    const pathnames = [
        {
          path: 'Ürünler',
          link: '',
        }
    ];
    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs breadcrumbs={pathnames} />
                <div className="page-header">
                    {/* <h1 className='headerClass'><i class="fa-solid fa-toolbox"></i> Ürünler</h1>  */}
                    <div className="header-actions">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Ara..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="search-input"
                            />
                        </div>
                    </div>
                </div>
                <hr></hr>
                <br></br>
                <div className="projects-grid">
                    {products.filter(x => x.name.toLowerCase().includes(searchTerm.toLowerCase()) || x.description.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                       
                        <div key={p.id} className="project-card">
                        <div className="project-image">
                            <img loading="lazy" alt={p.name} src={`http://localhost:5001${p.imageUrl}`} />
                        </div>
                        <div className="project-content">
                            <h3>{p.name}</h3>
                            <p>{p.description}</p>
                            <button 
                                className="project-details-btn"
                                onClick={() => navigate('/product-detail', { state: {productData: p }})}
                            >
                                Detayları Gör
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
};

export default Product;
