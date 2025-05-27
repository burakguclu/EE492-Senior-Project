const net = require('net');
const axios = require('axios');

const TCP_HOST = '0.0.0.0';
const TCP_PORT = 80;
const BACKEND_URL = 'http://localhost:3000/add-urun';

// Gelen veriyi işleme fonksiyonu
function parseArduinoData(data) {
    try {
        // Arduino'dan gelen string verisi
        const stringData = data.toString('utf8').trim();
        
        if (!stringData) {
            throw new Error('Boş veri');
        }

        return {
            stringData
        };
    } catch (error) {
        console.error('Veri ayrıştırma hatası:', error.message);
        return null;
    }
}

// Backend'e veri gönderme fonksiyonu
async function sendToBackend(data) {
    try {
        const response = await axios.post(BACKEND_URL, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Backend yanıtı:', response.data);
        return true;
    } catch (error) {
        console.error('Backend hatası:', error.message);
        return false;
    }
}

// TCP Sunucusu oluştur
const server = net.createServer((socket) => {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`Yeni bağlantı: ${clientAddress}`);

    // Veri geldiğinde
    socket.on('data', async (data) => {
        const message = data.toString('utf8');
        console.log(`Arduino'dan gelen ham veri: ${message}`);

        // Veriyi işle
        const parsedData = parseArduinoData(data);
        if (parsedData) {
            console.log('İşlenmiş veri:', parsedData);

            // Backend'e gönder
            const success = await sendToBackend(parsedData);
            
            // Arduino'ya yanıt gönder
            const response = success ? 'Veri başarıyla işlendi' : 'Veri işlenirken hata oluştu';
            socket.write(response);
        } else {
            socket.write('Veri formatı hatalı');
        }
    });

    // Bağlantı kapandığında
    socket.on('end', () => {
        console.log(`Bağlantı kapandı: ${clientAddress}`);
    });

    // Hata durumunda
    socket.on('error', (err) => {
        console.error(`Soket hatası: ${clientAddress}`, err.message);
    });
});

// Sunucuyu başlat
server.listen(TCP_PORT, TCP_HOST, () => {
    console.log(`TCP Sunucusu başlatıldı - ${TCP_HOST}:${TCP_PORT}`);
    console.log('Arduino verilerini dinliyor...');
});

// Sunucu hatalarını yakala
server.on('error', (err) => {
    console.error('Sunucu hatası:', err.message);
    if (err.code === 'EACCES') {
        console.log('Port erişim izni reddedildi. Yönetici izinleriyle çalıştırmayı deneyin.');
    }
}); 