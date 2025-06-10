import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import CListContainer from '../htmlComponent/CListContainer';
import { serverUrl } from '../../utils/utils';
import { useApiCall } from '../../utils/apiCalls';

const EventList = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [dataList, setData] = useState([]);
    const { apiData, apiError, apiLoading } = useApiCall('/events', 'GET', null, false); 
    
   useEffect(() => {
         if (apiData) { 
             if (apiData.success) {
                 setData(apiData.events);
             } else {
                 setError('Veriler yüklenirken bir hata oluştu');
             }
         }
         if (apiError) {
             console.error('Veriler yüklenirken hata:', apiError);
             setError('Sunucu bağlantısı başarısız');
         }
         setLoading(apiLoading);
     }, [apiData, apiError, apiLoading]);

    

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = dataList.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.distance.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.guide.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.eventNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            field: 'image',
            headerName: 'Resim',
            width: 100,
            renderCell: (params) => (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={params.row.avatar ? `${serverUrl}/${params.row.avatar}` : `${serverUrl}/uploads/avatars/default.jpg`}
                        alt={params.row.fullName}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                        onError={(e) => {
                            console.error('Avatar yükleme hatası:', e);
                            e.target.src = `${serverUrl}/uploads/avatars/default.jpg`;
                        }}
                    />
                </div>
            )
        },
        {
            field: 'title',
            headerName: 'Etkinlik Adı',
            flex: 1            
        },
        {
            field: 'eventNumber',
            headerName: 'Etkinlik No',
            flex: 1            
        },
        {
            field: 'category',
            headerName: 'Etkinlik Türü',
            flex: 1,
            valueGetter: (params) => params.row.category?.name
        },
        {
            field: 'location',
            headerName: 'Etkinlik Yeri',
            flex: 1
        },
        {
            field: 'guide',
            headerName: 'Rehber',
            flex: 1, 
        },
        {
            field: 'date',
            headerName: 'Tarih',
            width: 150,
            valueFormatter: (params) => new Date(params.value).toLocaleDateString('tr-TR')
        },
        {
            field: 'time',
            headerName: 'Saat',
            width: 150,
            valueFormatter: (params) => new Date(params.value).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        },
        {
            field: 'duration',
            headerName: 'Süre',
            flex: 1,
            
        },
        {
            field: 'distance',
            headerName: 'Mesafe',
            flex: 1,
            
        },
        {
            field: 'quota',
            headerName: 'Kontenjan',
            flex: 1,
            
        },
        {
            field: 'remainder',
            headerName: 'Kalan',
            width: 150,
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 120,
            renderCell: (params) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/event/edit/${params.row._id}`);
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
        <CListContainer pageName={'events'}  
            error={error} 
            searchTerm={searchTerm} 
            handleSearch={handleSearch} 
            url={'/event/new'} 
            filteredData={filteredData} 
            columns={columns} 
            loading={loading} 
            pageSize={10}
        /> 
    );
};

export default EventList;
