import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CListContainer from '../htmlComponent/CListContainer';
import { apiUrl } from '../../utils/utils';

import '../../css/Products.css';

const Projects = () => {
    const navigate = useNavigate();
    const [projects, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login'); // Kullanıcıyı giriş sayfasına yönlendir
                    return;
                }
                const response = await fetch(`${apiUrl}/projects`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Token'ı header'a ekle
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                if (data.success) {
                    setData(data.projects);
                } else {
                    setError('Projeler yüklenirken bir hata oluştu');
                }
            } catch (error) {
                console.error('Projeler yüklenirken hata:', error);
                setError('Sunucu bağlantısı başarısız');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = projects.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            field: 'imageUrls',
            headerName: 'Görsel',
            width: 100,
            renderCell: (params) => (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    
                    {params.value && params.value.length > 0 ? (
                                    <img
                                        src={`http://localhost:5001${params.value[0]}`}
                                        alt={params.row.name}
                                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                ) : (
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#f5f5f5', borderRadius: '4px' }} />
                                )}
                </div>
            )
        },
        {
            field: 'statusType',
            headerName: 'Durumu',
            width: 150,
            valueFormatter: (params) => {
                return params.value === 'true' ? 'Aktif' : 'Pasif';
            }
        },
        {
            field: 'startDate',
            headerName: 'Başlama Tarihi',
            width: 126,
            type: 'datetime',
            valueFormatter: (params) => {
                return new Date(params.value).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            }
        },
        {
            field: 'projectCost',
            headerName: 'Maliyet',
            width: 150,
            valueFormatter: (params) => {
                return new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                }).format(params.value);
            }
        },
        {
            field: 'name',
            headerName: 'Proje Adı',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <div style={{ fontWeight: 'bold', color: '#333' }}>
                    {params.value}
                </div>
            )
        },
        {
            field: 'description',
            headerName: 'Açıklama',
            flex: 1,
            minWidth: 200,
            valueFormatter: (params) => {
                const maxLength = 150;
                const description = params.value || '';
                return description.length > maxLength
                    ? description.substring(0, maxLength) + '...'
                    : description;
            }
            
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 120,
            renderCell: (params) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate('/projectdetail', { state: {projectData: params.row }});
                    }}
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Düzenle
                </button>
            )
        }
    ];

    return (
        <CListContainer pageName={'projects'}
            error={error} 
            searchTerm={searchTerm} 
            handleSearch={handleSearch} 
            url={'/project/new'} 
            filteredData={filteredData} 
            columns={columns} 
            loading={loading} 
            pageSize={10}
        />  
    );
};

export default Projects;
