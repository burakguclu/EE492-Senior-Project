import requests
import os
from pathlib import Path

# Görsel URL'leri ve kaydedilecek isimler
images = {
    "pantolon.jpg": "https://static.zara.net/assets/public/df1c/54a2/6fc1441d91fc/1ad832787c3b/04595335300-e1/04595335300-e1.jpg?ts=1746689707719&w=750",
    "gomlek.jpg": "https://static.zara.net/assets/public/cd21/c58b/23eb487aafb7/80c98ed2a4e5/01195318515-e1/01195318515-e1.jpg?ts=1747929711819&w=750",
    "pantolon2.jpg": "https://static.zara.net/assets/public/709f/da71/ad2d4e578389/c8430d8c1430/01195432505-e1/01195432505-e1.jpg?ts=1740472742012&w=750",
    "polo.jpg": "https://static.zara.net/assets/public/d92b/58fb/68364e559f82/c41be089daf3/00761300806-e1/00761300806-e1.jpg?ts=1747725217293&w=750",
    "tshirt.jpg": "https://static.zara.net/assets/public/4388/72f3/ee004de7ae21/2b949645d680/00761412251-e1/00761412251-e1.jpg?ts=1737452354752&w=750",
    "sort.jpg": "https://static.zara.net/assets/public/87ae/0197/c38341389bae/206542be58af/01437402104-e1/01437402104-e1.jpg?ts=1740672199640&w=750",
    "blazer.jpg": "https://static.zara.net/assets/public/5eef/02db/ced74559a752/0493e0df1e9c/01564300420-e1/01564300420-e1.jpg?ts=1722508889836&w=750",
    "ayakkabi.jpg": "https://static.zara.net/assets/public/f3a3/e713/e60e4aacaed0/8cb21fabfabf/12308520120-e1/12308520120-e1.jpg?ts=1731410327575&w=750",
    "makosen.jpg": "https://static.zara.net/assets/public/a0c8/1311/7dc642fdae79/6184c571728b/12639520400-e1/12639520400-e1.jpg?ts=1736767323698&w=750"
}

def download_images():
    # Images klasörünün yolunu oluştur
    images_dir = Path("frontend/public/images")
    
    # Klasör yoksa oluştur
    images_dir.mkdir(parents=True, exist_ok=True)
    
    print("Görseller indiriliyor...")
    
    # Her görsel için
    for filename, url in images.items():
        try:
            # Görseli indir
            response = requests.get(url)
            response.raise_for_status()  # Hata kontrolü
            
            # Dosya yolunu oluştur
            file_path = images_dir / filename
            
            # Görseli kaydet
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            print(f"✓ {filename} başarıyla indirildi")
            
        except Exception as e:
            print(f"✗ {filename} indirilirken hata oluştu: {str(e)}")
    
    print("\nİndirme işlemi tamamlandı!")

if __name__ == "__main__":
    download_images() 