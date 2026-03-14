import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { HiCamera, HiXMark } from 'react-icons/hi2';

async function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function ProgressPhotos() {
  const { user } = useAuthStore();
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [comparePhotos, setComparePhotos] = useState([null, null]);
  const [note, setNote] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    if (user) loadPhotos();
  }, [user]);

  const loadPhotos = async () => {
    if (!user) return;
    const photosDoc = await getDoc(doc(db, 'users', user.uid, 'photos', 'list'));
    if (photosDoc.exists()) setPhotos(photosDoc.data().photos || []);
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    try {
      const compressed = await compressImage(file);
      const timestamp = Date.now();
      const storageRef = ref(storage, `users/${user.uid}/photos/${timestamp}.jpg`);
      await uploadBytes(storageRef, compressed);
      const url = await getDownloadURL(storageRef);

      const photoEntry = {
        url,
        date: new Date().toISOString(),
        weight: weight || null,
        note: note || null,
      };

      const updated = [photoEntry, ...photos];
      await setDoc(doc(db, 'users', user.uid, 'photos', 'list'), { photos: updated });
      setPhotos(updated);
      setNote('');
      setWeight('');
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploading(false);
  };

  const toggleCompare = (photo, idx) => {
    const updated = [...comparePhotos];
    updated[idx] = photo;
    setComparePhotos(updated);
  };

  if (photos.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <span className="text-5xl mb-3 block">📸</span>
        <p className="text-text-secondary text-sm mb-1">Toma tu primera foto de progreso</p>
        <p className="text-text-muted text-xs mb-4">Sigue tu transformación visualmente</p>
        <label className="btn-primary text-sm py-2 px-4 cursor-pointer inline-flex items-center gap-2">
          <HiCamera className="w-4 h-4" />
          Subir foto
          <input type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
        </label>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-display font-bold text-text-primary">📸 Progreso</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`text-xs px-2 py-1 rounded-lg ${compareMode ? 'bg-accent text-white' : 'bg-bg-surface text-text-muted'}`}
          >
            Comparar
          </button>
          <label className="text-xs px-2 py-1 rounded-lg bg-accent/10 text-accent cursor-pointer">
            + Foto
            <input type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
          </label>
        </div>
      </div>

      {uploading && <div className="skeleton h-40 rounded-xl" />}

      {/* Optional weight/note before upload */}
      <div className="flex gap-2">
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Peso (opcional)"
          className="text-xs flex-1"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota (opcional)"
          className="text-xs flex-1"
        />
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => compareMode ? toggleCompare(photo, comparePhotos[0] ? 1 : 0) : setViewPhoto(photo)}
            className="aspect-square rounded-xl overflow-hidden bg-bg-surface relative"
          >
            <img src={photo.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            {photo.weight && (
              <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1 rounded">
                {photo.weight}kg
              </span>
            )}
            <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded">
              {new Date(photo.date).toLocaleDateString()}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Compare */}
      {compareMode && comparePhotos[0] && comparePhotos[1] && (
        <div className="glass-card p-3">
          <p className="text-xs text-text-muted text-center mb-2">Antes / Después</p>
          <div className="flex gap-2">
            {comparePhotos.map((photo, i) => (
              <div key={i} className="flex-1 aspect-square rounded-xl overflow-hidden">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full view */}
      <AnimatePresence>
        {viewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setViewPhoto(null)}
          >
            <button className="absolute top-4 right-4 text-white" onClick={() => setViewPhoto(null)}>
              <HiXMark className="w-6 h-6" />
            </button>
            <img src={viewPhoto.url} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
            <div className="absolute bottom-8 text-center text-white text-xs">
              <p>{new Date(viewPhoto.date).toLocaleDateString()}</p>
              {viewPhoto.weight && <p>{viewPhoto.weight}kg</p>}
              {viewPhoto.note && <p className="text-text-muted">{viewPhoto.note}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
