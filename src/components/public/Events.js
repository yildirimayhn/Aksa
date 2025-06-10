// import React, { useEffect, useState } from 'react';
// import { fetchEvents } from '../api/events';
// import { fetchCategories } from '../api/categories';

// const Events = () => {
//   const [events, setEvents] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('Tümü');

//   useEffect(() => {
//     fetchCategories().then(cats => setCategories(cats));
//   }, []);

//   useEffect(() => {
//     const categoryId = selectedCategory === 'Tümü' ? undefined : selectedCategory;
//     fetchEvents(categoryId).then(setEvents);
//   }, [selectedCategory]);

//   return (
//     <div>
//       <h2>Etkinlikler</h2>
//       <div>
//         <button
//           key="Tümü"
//           onClick={() => setSelectedCategory('Tümü')}
//           style={{ fontWeight: selectedCategory === 'Tümü' ? 'bold' : 'normal', marginRight: 8 }}
//         >
//           Tümü
//         </button>
//         {categories.map(cat => (
//           <button
//             key={cat._id}
//             onClick={() => setSelectedCategory(cat._id)}
//             style={{
//               fontWeight: selectedCategory === cat._id ? 'bold' : 'normal',
//               marginRight: 8
//             }}
//           >
//             {cat.name}
//           </button>
//         ))}
//       </div>
//       <ul>
//         {events.map(event => (
//           <li key={event._id}>
//             <a href={`/events/${event._id}`}>
//               <strong>{event.title}</strong>
//             </a>
//             {' - '}
//             {event.category?.name} - {new Date(event.date).toLocaleDateString()}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Events;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/Products.css';
import { serverUrl } from '../../utils/utils';
import { useApiCall } from '../../utils/apiCalls';
import Breadcrumbs from './Breadcrumbs';

const Events = () => {
    const navigate = useNavigate();
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
    const pathnames = [
    {
        path: 'Etkinlikler',
        link: '',
    }];
 
    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs breadcrumbs={pathnames} />
                <div className="page-header">
                    {/* <h1 className='headerClass'><i class="fa-solid fa-calendar-check"></i> Etkinlikler</h1> */}
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
                    {dataList
                        .filter(x =>
                            (x.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            x.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        )                    
                        .map(p => (
                            <div key={p.id} className="project-card">
                                <div className="project-image">
                                    {p.imageUrls && p.imageUrls.length > 0 ? (
                                        <img loading="lazy" alt={p.name} src={`${serverUrl}/${p.imageUrls[0]}`} />
                                    ) : (
                                        <img loading="lazy" alt={p.name} src={`${serverUrl}/uploads/projects/default.png`} />
                                    )}
                                </div>
                                <div className="project-content">
                                    <div style={{backgroundColor:'catedblue',display:'flex', textAlign:'justify'}}>
                                        <table>
                                          <tr>
                                            <td>
                                                <p>Kontenjan: {p.quota}</p>
                                            </td>
                                            <td>
                                                <p>Kalan: {p.quota - p.participants.length}</p>
                                            </td>
                                            <td>
                                                <p>Ücret: {p.price}</p>
                                            </td>
                                          </tr>
                                        </table>
                                    </div>
                                    <div style={{backgroundColor:'white',display:'flex', textAlign:'justify'}}>
                                        <table>
                                          <tr>
                                            <td>
                                                <p>Tarih</p>
                                            </td>
                                            <td>
                                                <p>Saat</p>
                                            </td>
                                            <td>
                                                <p>Süre</p>
                                            </td>
                                            <td>
                                                <p>Mesafe</p>
                                            </td>
                                            <td>
                                                <p>Kontenjan</p>
                                            </td>
                                            <td>
                                                <p>Etkinlik Türü</p>
                                            </td>
                                            <td>
                                                <p>Etkinlik Yeri</p>
                                            </td>
                                            <td>
                                                <p>Rehber</p>
                                            </td>
                                            <td>
                                                <p>Etkinlik No:</p>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td>
                                                : {p.date}
                                            </td>
                                            <td>
                                                : <p>{p.time}</p>
                                            </td>
                                            <td>
                                                : <p>{p.duration}</p>
                                            </td>
                                            <td>
                                                <p>{p.distance}</p>
                                            </td>
                                            <td>
                                                : <p>{p.quota - p.participants.length}</p>
                                            </td>
                                            <td>
                                                : <p>{p.category?.name}</p>
                                            </td>
                                            <td>
                                                <p>{p.location}</p>
                                            </td>
                                            <td>
                                                <p>{p.guide}</p>
                                            </td>
                                            <td>
                                                <p>{p.eventNumber}</p>
                                            </td>
                                          </tr>
                                        </table>
                                    </div>
                                    {/* <h3>{substringValue(p.name,150)}</h3>
                                    {p.isVisibleCost && <p className="project-cost">{p.projectCost}</p>}
                                    <p>{substringValue(p.description,150)}</p> */}
                                    <button 
                                        className="project-details-btn"
                                        onClick={() => navigate('/project-detail', { state: {projectData: p }})}
                                    >
                                        Etkinliğe katıl
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div> 
        </div>
    );
};

export default Events;
