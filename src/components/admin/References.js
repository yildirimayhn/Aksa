import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CListContainer from '../htmlComponent/CListContainer';
import '../../css/Products.css';
import { apiUrl } from '../../utils/utils';

const References = () => {
    const navigate = useNavigate();
    const [references, setReferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchReferences = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login'); // Kullanıcıyı giriş sayfasına yönlendir
                    return;
                }
                const response = await fetch(`${apiUrl}/references`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                if (data.success) {
                    setReferences(data.references);
                } else {
                    setError('Referanslar yüklenirken bir hata oluştu');
                }
            } catch (error) {
                console.error('Referanslar yüklenirken hata:', error);
                setError('Sunucu bağlantısı başarısız');
            } finally {
                setLoading(false);
            }
        };

        fetchReferences();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = references.filter(reference =>
        reference.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reference.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            field: 'imageUrl',
            headerName: 'Görsel',
            width: 100,
            renderCell: (params) => (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {params.value ? (
                        <img
                            src={`http://localhost:5001${params.value}`}
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
            field: 'name',
            headerName: 'Referans Adı',
            flex: 1,
            minWidth: 200
        }, 
        {
            field: 'description',
            headerName: 'Açıklama',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 120,
            renderCell: (params) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // navigate(`/reference/edit/${params.row._id}`);
                        navigate('/referencedetail', { state: {referenceData: params.row }});
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
        <CListContainer pageName={'references'} 
            error={error} 
            searchTerm={searchTerm} 
            handleSearch={handleSearch} 
            url={'/reference/new'} 
            filteredData={filteredData} 
            columns={columns} 
            loading={loading} 
            pageSize={10}
        />  
    );
};

export default References;
