import requests
import time
import random

# Dummy ürün verileri
dummy_urunler = [
    "4595/335/300",
    "1195/430/515",
    "1195/326/505",
    "0761/300/806",
    "0761/412/251",
    "1437/402/104",
    "1564/300/420",
    "2308/520/120",
    "2639/520/400"
]

def send_data():
    # Server URL
    url = 'http://localhost:3000/add-urun'
    
    print("Veri gönderme programı başlatılıyor...")
    print("Server'a bağlanılıyor...")
    time.sleep(1)
    
    try:
        while True:
            try:
                # Rastgele bir ürün ID'si seç
                string_data = random.choice(dummy_urunler)
                
                # Gönderilecek veri
                data = {
                    'stringData': string_data
                }
                
                # POST isteği gönder
                response = requests.post(url, json=data)
                
                if response.status_code == 200:
                    print(f"\nVeri başarıyla gönderildi! Ürün ID: {string_data}")
                else:
                    print(f"\nHata oluştu: {response.status_code}")
                
                # 5 saniye bekle
                time.sleep(5)
                    
            except requests.exceptions.RequestException as e:
                print("\nBağlantı hatası:", e)
                time.sleep(2)
            except Exception as e:
                print("\nBir hata oluştu:", e)
                time.sleep(2)
                
    except KeyboardInterrupt:
        print("\nProgram sonlandırıldı.")

if __name__ == "__main__":
    send_data()
