import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CListContainer from '../htmlComponent/CListContainer';
import { apiUrl } from '../../utils/utils';

const Categories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${apiUrl}/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setCategories(data.categories);
            } else {
                setError(data.message || 'Kategoriler yüklenirken bir hata oluştu');
            }
        } catch (error) {
            console.error('Kategorileri getirme hatası:', error);
            setError('Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = categories.filter(categori =>
        categori.name.toLowerCase().includes(searchTerm.toLowerCase()) 
    );

    const getCategoryTypeName = (typeId) =>{
        if (Number(typeId) === 1) {
            return 'Projeler';
        }else if (Number(typeId) === 2) {
            return 'Kullanıcılar';
        }else if (Number(typeId) === 3) {
            return 'Etkinlikler';
        }
        return 'Tanımsız Kategori';
    }
    const columns = [        
        {
            field: 'name',
            headerName: 'Kategori Adı',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'categoryTypeId',
            headerName: 'Kategori Türü',
            width: 150,
            valueFormatter: (params) => {
                return getCategoryTypeName(Number(params.value));
            }
        },
        {
            field: 'createdAt',
            headerName: 'Kayıt Tarihi',
            width: 150,
            valueFormatter: (params) => new Date(params.value).toLocaleDateString('tr-TR')
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 120,
            renderCell: (params) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/categoies/edit/${params.row._id}`);
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
        <CListContainer pageName={'categories'} 
                error={error} 
                searchTerm={searchTerm} 
                handleSearch={handleSearch} 
                url={'/categories/new'} 
                filteredData={filteredData} 
                columns={columns} 
                loading={loading} 
                pageSize={10}
            />         
    );
};

export default Categories;
