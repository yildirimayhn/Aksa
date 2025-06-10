import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from '../public/Breadcrumbs';
import { apiUrl, serverUrl, categoryTypeEnum, formatPrice,formatTL } from '../../utils/utils';

import DatePicker from 'react-datepicker'; // react-datepicker kütüphanesini kullanıyoruz
import { tr } from 'date-fns/locale/tr';
import 'react-datepicker/dist/react-datepicker.css'; // CSS dosyasını ekliyoruz

import '../../css/EditUser.css';
import '../../css/HomePage.css';
 
const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [categories, setCategories] = useState([]);
    const [description, setDescription] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        date: new Date(),
        time: '',
        duration: null,
        distance: '',
        location:'',
        guide:'',
        quota:'',
        price:'',
        eventNumber:'',
        description:'',
        summary:'',
        program:'',
        includedInTheFee:'',
        cancelDeadline: null,

    });
    
    const [eventDate, setEventDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isNewData, seIsNewData] = useState(!id);

    useEffect(() => {
        fetchCategories();
        if (id) {
            fetchUser();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const categoryTypeIdList = [categoryTypeEnum.EVENT, categoryTypeEnum.DISTANCE]; // Faaliyet türü için ID
            
            const response = await fetch(`${apiUrl}/categories/categorytypes?categoryTypeIdList=${categoryTypeIdList}`);
            
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

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${apiUrl}/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setFormData({
                    title: data.title,
                    category: data.category,
                    date: data.date,
                    time: data.time,
                    duration: data.duration,
                    distance: data.distance,
                    location: data.location,
                    guide: data.guide,
                    quota: data.quota,
                    price: data.price,
                    eventNumber: data.eventNumber,
                    description: data.description,
                    summary: data.summary,
                    program: data.program,
                    includedInTheFee:data.includedInTheFee,
                    cancelDeadline: data.cancelDeadline,
                });
                
                if (data.events.imageFile) {
                    setImagePreview(`${serverUrl}${data.events.imageFile}`);
                }
            } else {
                setError(data.message || 'Etkinlik bilgileri yüklenemedi');
            }
        } catch (error) {
            console.error('Etkinlik bilgileri getirme hatası:', error);
            setError('Sunucu bağlantısı başarısız');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'price') {
            const formattedPrice = formatTL(value);
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

    const handleAvatarChange = (e) => {
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

            setImageFile(file);
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

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('date', eventDate ? eventDate.toISOString() : '');
            formDataToSend.append('time', formData.time);
            formDataToSend.append('duration', formData.duration);
            formDataToSend.append('distance', formData.distance);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('guide', formData.guide);
            formDataToSend.append('quota', formData.quota);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('summary', formData.summary);
            formDataToSend.append('program', formData.program);
            formDataToSend.append('includedInTheFee', formData.includedInTheFee);
            formDataToSend.append('stops', formData.stops);
            formDataToSend.append('cancelDeadline', formData.cancelDeadline);
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }
            if (imageFile) {
                formDataToSend.append('imageUrls', imageFile);
            }

            const url = id
                ? `${apiUrl}/events/${id}`
                : `${apiUrl}/events`;

            const response = await fetch(url, {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (data.success) {
                navigate('/event-list');
            } else {
                setError(data.message || 'Etkinlik kaydedilirken bir hata oluştu');
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
    
    const pathnames = [
        {
          path: 'Etkinlikler',
          link: '/event-list',
        },
        {
          path: 'Etkinlik Detayı',
          link: '',
        }
    ];
    
    const editorModules = {
        toolbar: [
            [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
            [{size: []}],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, 
            {'indent': '-1'}, {'indent': '+1'}],
            ['link', 'image', 'video'],
            ['clean']
        ],
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
        }
    }

    const editorFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video'
    ]

    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs breadcrumbs={pathnames} />
                <form id="userForm" onSubmit={handleSubmit} className="edit-user-form">
                    <div className="page-header">
                        <h1 className='headerClass'>{isNewData ? 'Yeni Etkinlik' : 'Etkinlik Düzenle'}</h1>
                        <div className="form-actions">
                            <button 
                                type="submit"
                                form="userForm"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (isNewData ? 'Kaydet' : 'Güncelle')}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/event-list')}
                                className="cancel-button"
                            >
                                İptal
                            </button>
                        </div>
                    </div>                    
                    <hr></hr>
                    <br></br>
                    
                    {error && <div className="error-message">{error}</div>}
                    {id && 
                        <div className="form-group">
                            <label htmlFor="eventNumber">
                                Enkinlik Numarası
                            </label>
                            <label
                                id="eventNumber"
                                name="eventNumber"
                                value={formData.eventNumber}
                            >{formData.eventNumber}</label>
                        </div>

                    }
                    
                    <div className="form-group">
                        <label htmlFor="category">Etkinlik Türü</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange} 
                            required
                            style={{minWidth:150}}
                        >
                            <option value="">Seçiniz</option>
                            {
                                categories.filter((x) => x.categoryTypeId == categoryTypeEnum.EVENT).map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">Etkinlik Başlığı</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            style={{minWidth:'75%'}}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="time">
                            Etkinlik Zamanı
                        </label> 
                        <div className="form-group">
                            <label htmlFor="date">
                                Tarih
                            </label>                                                
                            <DatePicker 
                                id='date'
                                required
                                isClearable 
                                showYearDropdown={true}
                                showMonthDropdown={true}
                                dropdownMode="select"
                                locale={tr}
                                calendarIconClassname={"calendar-icon"}
                                dateFormat="dd/MM/yyyy"
                                selected={eventDate}
                                minDate={new Date()} // Bugünden önceki tarihleri seçememek için
                                onChange={(e) => setEventDate(e) }
                            />
                        </div>                    
                        
                        <div className="form-group">
                                                  
                            {/* <div className="form-group"> */}
                                <label>Saat</label>
                                <DatePicker
                                    selected={startTime}
                                    onChange={date => setStartTime(date)}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={10}
                                    timeCaption="Saat"
                                    dateFormat="HH:mm"
                                    placeholderText="Başlangıç saati seçin"
                                    locale={tr}
                                    required
                                />
                                <label>-</label>
                                <DatePicker
                                    selected={endTime}
                                    onChange={date => setEndTime(date)}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={10}
                                    timeCaption="Saat"
                                    dateFormat="HH:mm"
                                    placeholderText="Bitiş saati seçin"
                                    locale={tr}
                                    minTime={startTime || new Date(0,0,0,0,0)} // Başlangıç saatinden önce seçilemesin
                                    maxTime={new Date(0,0,0,23,59)}
                                    required
                                />
                            {/* </div> */}
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="duration">
                            Süre
                        </label>
                        <input
                            type="number"
                            id="duration"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="distance">
                            Mesafe
                        </label>
                        <input
                            type="text"
                            id="distance"
                            name="distance"
                            value={formData.distance}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Mesafe Türü</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange} 
                            required
                            style={{minWidth:150}}
                        >
                            <option value="">Seçiniz</option>
                            {
                                categories.filter((x) => x.categoryTypeId == categoryTypeEnum.DISTANCE).map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">
                            Etkinlik Yeri
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="guide">
                            Rehber
                        </label>
                        <input
                            type="text"
                            id="guide"
                            name="guide"
                            value={formData.guide}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="quota">
                            Kontenjan
                        </label>
                        <input
                            type="number"
                            id="quota"
                            name="quota"
                            value={formData.quota}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">
                            Ücret
                        </label>
                        <input
                            type="text"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}  
                            placeholder="0,00 ₺"
                            inputMode="decimal"
                            required
                        />
                        <span>{formData.price}</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Açıklama</label>
                        <ReactQuill
                            theme="snow"                            
                            style={{minHeight:'300px'}}
                            value={description}
                            onChange={setDescription}   
                            placeholder="Açıklama giriniz..."
                            modules={editorModules}
                            formats={editorFormats}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="summary">Özet</label>
                        <textarea
                            id="summary"
                            name="summary"
                            required
                            value={formData.summary} 
                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="program">Program</label>
                        <textarea
                            id="program"
                            name="program"
                            required
                            value={formData.program} 
                            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="includedInTheFee">Ücrete dahil olanlar</label>
                        <textarea
                            id="includedInTheFee"
                            name="includedInTheFee"
                            required
                            value={formData.includedInTheFee} 
                            onChange={(e) => setFormData({ ...formData, includedInTheFee: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="stops">
                            Duraklar
                        </label>
                        <input
                            type="stops"
                            id="stops"
                            name="stops"
                            value={formData.stops}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cancelDeadline">
                            İptal etmek için son tarih
                        </label>
                        <DatePicker 
                            id='cancelDeadline'
                            required
                            isClearable 
                            showYearDropdown={true}
                            showMonthDropdown={true}
                            dropdownMode="select"
                            locale={tr}
                            calendarIconClassname={"calendar-icon"}
                            dateFormat="dd/MM/yyyy"
                            value={formData.cancelDeadline}
                            maxDate={new Date()} // Bugünden önceki tarihleri seçememek için
                            onChange={(e) => setFormData({ ...formData, cancelDeadline: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Rol</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                        >
                            <option value="admin">Yönetici</option>
                            <option value="user">Kullanıcı</option>
                        </select>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="avatarSection">Profil Resmi</label>
                            <div id="avatarSection" className="avatar-section">
                                <div className="avatar-content" >
                                    
                                    <div className="upload-section">
                                        <label htmlFor="avatar" className="upload-label" style={{ textAlign: 'center',width: '100%',color: 'white' }}>
                                            Resim Yükle
                                            <input
                                                type="file"
                                                id="avatar"
                                                onChange={handleAvatarChange}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                        {imagePreview ? (
                                            <div className="avatar-preview">
                                                <img loading="lazy" src={imagePreview} alt="Avatar önizleme" />
                                            </div>
                                        ) : (
                                            <div className="avatar-preview">
                                                <img loading="lazy" src="http://localhost:5001/uploads/avatars/default.jpg" alt="Varsayılan avatar" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> 

                </form>
            </div>
        </div>
    );
};

export default EditEvent;
