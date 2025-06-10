import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import CListContainer from '../htmlComponent/CListContainer';
import { apiUrl } from '../../utils/utils';

const Users = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(`${apiUrl}/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    setUsers(data.users);
                } else {
                    setError(data.message || 'Kullanıcılar yüklenirken bir hata oluştu');
                }
            } catch (error) {
                console.error('Kullanıcıları getirme hatası:', error);
                setError('Sunucu bağlantısı başarısız');
            } finally {
                setLoading(false);
            }
        };
        
        fetchUsers();
    }, []);

    

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            field: 'avatar',
            headerName: 'Avatar',
            width: 120,
            renderCell: (params) => (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={params.row.avatar ? `http://localhost:5001${params.row.avatar}` : `http://localhost:5001/uploads/avatars/default.jpg`}
                        alt={params.row.fullName}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                        onError={(e) => {
                            console.error('Avatar yükleme hatası:', e);
                            e.target.src = `http://localhost:5001/uploads/avatars/default.jpg`;
                        }}
                    />
                </div>
            )
        },
        {
            field: 'fullName',
            headerName: 'Ad Soyad',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'email',
            headerName: 'E-posta',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'role',
            headerName: 'Yetki',
            width: 120,
            valueGetter: (params) => params.row.role || 'user'
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
                        navigate(`/users/edit/${params.row._id}`);
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

    if (!currentUser || currentUser.role !== 'admin') {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
    }
    if (loading) {
        return <div className="loading">Yükleniyor...</div>;
    }

    return (
        <CListContainer pageName={'users'}  
            error={error} 
            searchTerm={searchTerm} 
            handleSearch={handleSearch} 
            url={'/users/new'} 
            filteredData={filteredData} 
            columns={columns} 
            loading={loading} 
            pageSize={10}
        /> 
    );
};

export default Users;
