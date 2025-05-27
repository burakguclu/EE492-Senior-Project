const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const cors = require('cors');

// CORS ve JSON middleware'lerini uygula
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test endpoint'i
app.get('/test', (req, res) => {
  res.json({ message: 'Server çalışıyor' });
});

// Dummy ürünler
const dummyUrunler = [
  { 
    id: "4595/335/300", 
    urunAdi: "Çizgili Viskoz - Keten Pantolon", 
    tur: "Alt Giyim"
  },
  { 
    id: "1195/430/515", 
    urunAdi: "Liyosel Karışımlı Gömlek", 
    tur: "Üst Giyim"
  },
  { 
    id: "1195/326/505", 
    urunAdi: "Liyosel Karışımlı Pantolon", 
    tur: "Alt Giyim"
  },
  { 
    id: "0761/300/806", 
    urunAdi: "Relaxed Fit Fermuarlı Polo T-shirt", 
    tur: "Üst Giyim"
  },
  { 
    id: "0761/412/251", 
    urunAdi: "Basic Kontrast Rib T-shirt", 
    tur: "Üst Giyim"
  },
  { 
    id: "1437/402/104", 
    urunAdi: "Keten Viskoz Bermuda Şort", 
    tur: "Alt Giyim"
  },
  { 
    id: "1564/300/420", 
    urunAdi: "Konforlu Takım Blazer", 
    tur: "Dış Giyim"
  },
  { 
    id: "2308/520/120", 
    urunAdi: "Kalın Tabanlı Ayakkabı", 
    tur: "Ayakkabı"
  },
  { 
    id: "2639/520/400", 
    urunAdi: "Günlük Deri Makosen", 
    tur: "Ayakkabı"
  }
];

// Gönderilen stringleri takip etmek için
const gonderilenStringler = new Set();

// Kullanılan ürün ID'lerini takip etmek için
const kullanilanUrunler = new Set();

// Örnek veri
let data = [];

// Tarih ve saat formatı oluşturma fonksiyonu
function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Kullanılmayan rastgele dummy ürün seçme fonksiyonu
function getRandomUnusedDummyUrun() {
  // Kullanılmayan ürünleri filtrele
  const kullanilmayanUrunler = dummyUrunler.filter(urun => !kullanilanUrunler.has(urun.id));
  
  if (kullanilmayanUrunler.length === 0) {
    // Tüm ürünler kullanılmışsa, kullanılan ürünler setini temizle
    kullanilanUrunler.clear();
    return getRandomUnusedDummyUrun();
  }
  
  const randomIndex = Math.floor(Math.random() * kullanilmayanUrunler.length);
  const secilenUrun = kullanilmayanUrunler[randomIndex];
  kullanilanUrunler.add(secilenUrun.id);
  return { ...secilenUrun };
}

// Yeni ürün ekleme endpoint'i
app.post('/add-urun', (req, res) => {
  console.log('POST isteği alındı:', req.body);
  
  try {
    const { stringData } = req.body;
    
    if (!stringData) {
      return res.status(400).json({ error: 'String verisi gereklidir' });
    }

    // String daha önce gönderilmiş mi kontrol et
    if (gonderilenStringler.has(stringData)) {
      // Aynı string daha önce gönderilmişse, aynı ID ve isimle ekle
      const existingUrun = data.find(item => item.stringData === stringData);
      if (existingUrun) {
        const girisTarihi = getCurrentDateTime();
        
        const newUrun = {
          id: existingUrun.id,
          urunAdi: existingUrun.urunAdi,
          tur: existingUrun.tur,
          girisTarihi,
          stringData
        };
        
        data.push(newUrun);
        io.emit('dataUpdate', data);
        return res.status(200).json({ message: 'Tekrar eden ürün eklendi', urun: newUrun });
      }
    } else {
      // Yeni string ise, kullanılmayan rastgele dummy ürün seç
      const dummyUrun = getRandomUnusedDummyUrun();
      const girisTarihi = getCurrentDateTime();
      
      const newUrun = {
        ...dummyUrun,
        girisTarihi,
        stringData
      };
      
      data.push(newUrun);
      gonderilenStringler.add(stringData);
      io.emit('dataUpdate', data);
      return res.status(200).json({ message: 'Yeni ürün eklendi', urun: newUrun });
    }
  } catch (error) {
    console.error('Sunucu hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı');
  socket.emit('initialData', data);
});

const PORT = 3000;
http.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log(`Test için: http://localhost:${PORT}/test`);
});
