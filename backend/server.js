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
    urunAdi: "ÇİZGİLİ VİSKOZ - KETEN PANTOLON", 
    tur: "Alt Giyim", 
    imageUrl: "https://static.zara.net/assets/public/df1c/54a2/6fc1441d91fc/1ad832787c3b/04595335300-e1/04595335300-e1.jpg?ts=1746689707719&w=750"
  },
  { 
    id: "1195/430/515", 
    urunAdi: "LİYOSEL KARIŞIMLI GÖMLEK", 
    tur: "Üst Giyim", 
    imageUrl: "https://static.zara.net/assets/public/cd21/c58b/23eb487aafb7/80c98ed2a4e5/01195318515-e1/01195318515-e1.jpg?ts=1747929711819&w=750"
  },
  { 
    id: "1195/326/505", 
    urunAdi: "LİYOSEL KARIŞIMLI PANTOLON", 
    tur: "Alt Giyim", 
    imageUrl: "https://static.zara.net/assets/public/709f/da71/ad2d4e578389/c8430d8c1430/01195432505-e1/01195432505-e1.jpg?ts=1740472742012&w=750"
  },
  { 
    id: "0761/300/806", 
    urunAdi: "RELAXED FİT FERMUARLI POLO T-SHIRT", 
    tur: "Üst Giyim", 
    imageUrl: "https://static.zara.net/assets/public/d92b/58fb/68364e559f82/c41be089daf3/00761300806-e1/00761300806-e1.jpg?ts=1747725217293&w=750"
  },
  { 
    id: "0761/412/251", 
    urunAdi: "BASIC KONTRAST RIB T-SHIRT", 
    tur: "Üst Giyim", 
    imageUrl: "https://static.zara.net/assets/public/4388/72f3/ee004de7ae21/2b949645d680/00761412251-e1/00761412251-e1.jpg?ts=1737452354752&w=750"
  },
  { 
    id: "1437/402/104", 
    urunAdi: "KETEN VİSKOZ BERMUDA ŞORT", 
    tur: "Alt Giyim", 
    imageUrl: "https://static.zara.net/assets/public/87ae/0197/c38341389bae/206542be58af/01437402104-e1/01437402104-e1.jpg?ts=1740672199640&w=750"
  },
  { 
    id: "1564/300/420", 
    urunAdi: "KONFORLU TAKIM BLAZER", 
    tur: "Dış Giyim", 
    imageUrl: "https://static.zara.net/assets/public/5eef/02db/ced74559a752/0493e0df1e9c/01564300420-e1/01564300420-e1.jpg?ts=1722508889836&w=750"
  },
  { 
    id: "2308/520/120", 
    urunAdi: "KALIN TABANLI AYAKKABI", 
    tur: "Ayakkabı", 
    imageUrl: "https://static.zara.net/assets/public/f3a3/e713/e60e4aacaed0/8cb21fabfabf/12308520120-e1/12308520120-e1.jpg?ts=1731410327575&w=750"
  },
  { 
    id: "2639/520/400", 
    urunAdi: "GÜNLÜK DERİ MAKOSEN", 
    tur: "Ayakkabı", 
    imageUrl: "https://static.zara.net/assets/public/a0c8/1311/7dc642fdae79/6184c571728b/12639520400-e1/12639520400-e1.jpg?ts=1736767323698&w=750"
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
