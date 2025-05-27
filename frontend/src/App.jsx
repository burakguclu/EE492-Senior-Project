import { useState, useEffect } from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:3000')

function App() {
  const [data, setData] = useState([])
  const [lastAddedUrun, setLastAddedUrun] = useState(null)

  useEffect(() => {
    // İlk bağlantıda verileri al
    socket.on('initialData', (initialData) => {
      setData(initialData)
      if (initialData.length > 0) {
        setLastAddedUrun(initialData[initialData.length - 1])
      }
    })

    // Veri güncellemelerini dinle
    socket.on('dataUpdate', (newData) => {
      setData(newData)
      if (newData.length > 0) {
        setLastAddedUrun(newData[newData.length - 1])
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
            <table>
              <thead>
                <tr>
                  <th>Ürün ID</th>
                  <th>Ürün Adı</th>
                  <th>Tür</th>
                  <th>Giriş Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.urunAdi}</td>
                    <td>{item.tur}</td>
                    <td>{item.girisTarihi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="detail-section">
          {lastAddedUrun ? (
            <div className="urun-detail">
              <h2>Son Eklenen Ürün</h2>
              <div className="urun-image">
                <img 
                  src={lastAddedUrun.imageUrl} 
                  alt={lastAddedUrun.urunAdi}
                />
              </div>
              <div className="urun-info">
                <p><strong>Ürün ID:</strong> {lastAddedUrun.id}</p>
                <p><strong>Ürün Adı:</strong> {lastAddedUrun.urunAdi}</p>
                <p><strong>Tür:</strong> {lastAddedUrun.tur}</p>
                <p><strong>Giriş Tarihi:</strong> {lastAddedUrun.girisTarihi}</p>
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
