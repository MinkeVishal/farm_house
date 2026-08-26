import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmhouseAPI } from '../api/axiosInstance';

const readImageFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

function CreateEstate({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    pricePerDay: '',
    maxGuests: '',
    bedrooms: '',
    bathrooms: '',
    amenities: 'WiFi,Pool,Garden',
    imageUrl: '',
    imageUrls: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [galleryUrls, setGalleryUrls] = useState(['']);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const uploadedImages = await Promise.all(galleryFiles.map(readImageFile));
      const amenitiesArray = formData.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await farmhouseAPI.addFarmHouse(
        {
          ...formData,
          pricePerDay: parseFloat(formData.pricePerDay),
          maxGuests: parseInt(formData.maxGuests, 10),
          bedrooms: parseInt(formData.bedrooms, 10),
          bathrooms: parseInt(formData.bathrooms, 10),
          amenities: JSON.stringify(amenitiesArray),
          imageUrls: JSON.stringify([
            ...galleryUrls.map((url) => url.trim()).filter(Boolean),
            ...uploadedImages,
          ]),
        },
        user?.id
      );

      if (response.data?.success) {
        setMessage('Estate created successfully. It is pending admin approval and will appear after approval.');
        setFormData({
          name: '',
          location: '',
          description: '',
          pricePerDay: '',
          maxGuests: '',
          bedrooms: '',
          bathrooms: '',
          amenities: 'WiFi,Pool,Garden',
          imageUrl: '',
          imageUrls: '',
        });
        setGalleryUrls(['']);
        setGalleryFiles([]);
        setTimeout(() => navigate('/owner-dashboard'), 1200);
      } else {
        setError('Failed to create estate.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create estate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-estate-page">
      <div className="form-card">
        <h2>Create New Estate</h2>

        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input name="location" value={formData.location} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" />
          </div>
          <div className="form-group">
            <label>Price per Night</label>
            <input
              type="number"
              name="pricePerDay"
              value={formData.pricePerDay}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Max Guests</label>
            <input
              type="number"
              name="maxGuests"
              value={formData.maxGuests}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Amenities</label>
            <input name="amenities" value={formData.amenities} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Gallery Photos</label>
            {galleryUrls.map((url, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setGalleryUrls((items) => items.map((item, i) => i === index ? e.target.value : item))}
                  placeholder={`Photo ${index + 1} URL (https://...)`}
                />
                {galleryUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setGalleryUrls((items) => items.filter((_, i) => i !== index))}
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setGalleryUrls((items) => [...items, ''])}>
              + Add another photo
            </button>
            <label style={{ marginLeft: '8px', cursor: 'pointer' }}>
              Choose photos
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => setGalleryFiles((items) => [...items, ...Array.from(e.target.files || [])])}
              />
            </label>
            {galleryFiles.length > 0 && <small>{galleryFiles.map((file) => file.name).join(', ')}</small>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Estate'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEstate;
