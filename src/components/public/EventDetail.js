import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const userId = localStorage.getItem('userId'); // Girişte userId kaydedildiğini varsayalım


  useEffect(() => {
    axios.get(`http://localhost:5000/api/events/${id}`)
      .then(res => setEvent(res.data));
  }, [id]);

  const handleJoin = async () => {
    try {
      await axios.post(`http://localhost:5000/api/events/${id}/join`, { userId });
      alert('Etkinliğe katıldınız!');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || 'Hata oluştu');
    }
  };

  if (!event) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h2>{event.title}</h2>
      <p>Kategori: {event.category?.name}</p>
      <p>Tarih: {new Date(event.date).toLocaleDateString()}</p>
      <p>Konum: {event.location}</p>
      <p>Kontenjan: {event.quota}</p>
      <p>Katılan: {event.participants.length}</p>
      <p>Ücret: {event.price} TL</p>
      <p>Açıklama: {event.description}</p>
      {event.image && <img src={event.image} alt={event.title} width={300} />}
      <button onClick={handleJoin}>Etkinliğe Katıl</button>
    </div>
  );
};

export default EventDetail;