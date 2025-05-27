import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:3000')

// Ürün ID'lerine göre görsel eşleştirmesi
const productImages = {
  "4595/335/300": "/images/pantolon.jpg",
  "1195/430/515": "/images/gomlek.jpg",
  "1195/326/505": "/images/pantolon2.jpg",
  "0761/300/806": "/images/polo.jpg",
  "0761/412/251": "/images/tshirt.jpg",
  "1437/402/104": "/images/sort.jpg",
  "1564/300/420": "/images/blazer.jpg",
  "2308/520/120": "/images/ayakkabi.jpg",
  "2639/520/400": "/images/makosen.jpg"
}

function App() {
  const [data, setData] = useState([])
  const [lastAddedUrun, setLastAddedUrun] = useState(null)
  const audioRef = useRef(new Audio('/sounds/click.mp3'))

  useEffect(() => {
    socket.on('initialData', (initialData) => {
      // Verileri ters sırala (en yeni en üstte)
      const sortedData = [...initialData].reverse()
      setData(sortedData)
      if (sortedData.length > 0) {
        setLastAddedUrun(sortedData[0])
      }
    })

    socket.on('dataUpdate', (newData) => {
      // Yeni veriyi en üste ekle
      const updatedData = [...newData].reverse()
      setData(updatedData)
      if (updatedData.length > 0) {
        setLastAddedUrun(updatedData[0])
        // Yeni ürün eklendiğinde ses çal
        audioRef.current.play().catch(error => {
          console.log('Ses çalma hatası:', error)
        })
      }
    })

    return () => {
      socket.off('initialData')
      socket.off('dataUpdate')
    }
  }, [])

  const getStatusClass = (durum) => {
    switch (durum) {
      case 'Aktif':
        return 'status-aktif'
      case 'Meşgul':
        return 'status-mesgul'
      case 'Toplantıda':
        return 'status-toplantida'
      case 'İzinde':
        return 'status-izinde'
      default:
        return ''
    }
  }

  return (
    <div className="container">
      <h1>Kıyafet Envanter Sistemi</h1>
      <div className="content">
        <div className="table-section">
          <div className="table-container">
            <div className="table-header">
              <h2>Ürün Listesi</h2>
              <span className="total-count">{data.length} Ürün</span>
            </div>
            <div className="table-body">
              {data.map((item, index) => (
                <div 
                  key={index} 
                  className={`product-card ${item === lastAddedUrun ? 'highlight' : ''}`}
                >
                  <div className="product-info">
                    <div className="product-id">{item.id}</div>
                    <div className="product-name">{item.urunAdi}</div>
                    <div className="product-type">{item.tur}</div>
                  </div>
                  <div className="product-date">{item.girisTarihi}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          {lastAddedUrun ? (
            <div className="urun-detail">
              <h2>Son Eklenen Ürün</h2>
              <div className="urun-content">
                <div className="urun-image">
                  <img 
                    src={productImages[lastAddedUrun.id]} 
                    alt={lastAddedUrun.urunAdi}
                  />
                </div>
                <div className="urun-info">
                  <div className="info-group">
                    <h3>Ürün Bilgileri</h3>
                    <p><strong>Ürün ID:</strong> {lastAddedUrun.id}</p>
                    <p><strong>Ürün Adı:</strong> {lastAddedUrun.urunAdi}</p>
                    <p><strong>Tür:</strong> {lastAddedUrun.tur}</p>
                    <p><strong>Giriş Tarihi:</strong> {lastAddedUrun.girisTarihi}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Henüz ürün eklenmedi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
