# 🎉 SocialHub - Instagram & Discord Karışımı Sosyal Medya

Modern, mobil uyumlu, tam özellikli sosyal medya platformu.

## 📋 Özellikler

✅ **Kullanıcı Yönetimi**
- Kayıt olma ve giriş yapma
- Profil resmi yükleme (5MB'a kadar)
- Kullanıcı profili ve istatistikler

✅ **Gönderi Paylaşma**
- Yazı, resim veya video paylaşma (15MB'a kadar)
- Beğeni ve yorum sistemi
- Gerçek zamanlı gönderi akışı

✅ **Arkadaşlık Sistemi**
- Kullanıcı arama
- Arkadaş ekleme/çıkarma
- Arkadaş listesi yönetimi

✅ **Mesajlaşma**
- Gerçek zamanlı mesajlaşma
- Okunmamış mesaj bildirimleri
- Mesaj geçmişi

✅ **Modern Tasarım**
- Mor-pembe gradient tema
- Tamamen mobil responsive
- Smooth animasyonlar
- Alt navigasyon menüsü

---

## 🚀 Kurulum Adımları

### 1️⃣ Klasörü Açın
Komut satırında (CMD veya PowerShell) indirdiğiniz klasöre gidin:

```bash
cd "C:\Users\tvfir\Downloads\Yeni klasör"
```

### 2️⃣ Node.js Kontrolü
Node.js kurulu mu kontrol edin:

```bash
node --version
npm --version
```

❌ Eğer kurulu değilse: [Node.js İndir](https://nodejs.org/) (LTS sürümünü indirin)

### 3️⃣ Paketleri Yükleyin

```bash
npm install
```

Bu işlem 2-3 dakika sürebilir. İnternet bağlantınızın açık olduğundan emin olun.

### 4️⃣ Projeyi Başlatın

**Geliştirme Modu:**
```bash
npm run dev
```

Tarayıcınızda otomatik olarak açılacak veya manuel olarak gidin:
👉 **http://localhost:3000**

---

## 📁 Dosya Yapısı

```
socialhub/
├── app/
│   ├── page.tsx          # Ana uygulama
│   ├── layout.tsx        # Layout wrapper
│   └── globals.css       # Global stiller
├── package.json          # Proje bağımlılıkları
├── tsconfig.json         # TypeScript ayarları
├── tailwind.config.js    # Tailwind CSS ayarları
├── postcss.config.js     # PostCSS ayarları
├── next.config.js        # Next.js ayarları
└── README.md            # Bu dosya
```

---

## 🎮 Kullanım

### İlk Kullanıcıyı Oluşturun
1. Uygulama açıldığında "Kayıt Ol" butonuna tıklayın
2. Kullanıcı adı, email ve şifre girin
3. Kayıt olduktan sonra otomatik giriş yapılır

### Gönderi Paylaşın
1. Ana sayfada sağ üstteki **+** butonuna tıklayın
2. Yazınızı yazın veya resim/video ekleyin
3. "Paylaş" butonuna tıklayın

### Arkadaş Ekleyin
1. Alt menüden "Arkadaşlar" sekmesine gidin
2. Sağ üstteki arama butonuna tıklayın
3. Kullanıcı arayın ve "Ekle" butonuna tıklayın

### Mesajlaşın
1. Önce arkadaş ekleyin
2. "Mesajlar" sekmesine gidin
3. Arkadaşınızı seçin ve mesaj gönderin

---

## 🛠️ Sorun Giderme

### Port Zaten Kullanılıyor
Eğer 3000 portu kullanımdaysa:
```bash
npm run dev -- -p 3001
```

### Paket Hataları
Cache'i temizleyin ve yeniden yükleyin:
```bash
npm cache clean --force
npm install
```

### Build Hataları
TypeScript hatası alırsanız:
```bash
npm run build
```

---

## 📦 Production Build

Canlıya almak için:

```bash
npm run build
npm start
```

---

## 💡 İpuçları

- Tüm veriler **localStorage**'da saklanır
- Sayfa yenilense bile verileriniz kaybolmaz
- İlk kullanıcı oluşturduktan sonra test edebilirsiniz
- Profil resmi ve medya yüklemek için dosya boyutlarına dikkat edin

---

## 🎨 Teknolojiler

- **Next.js 14** - React Framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Styling
- **Lucide React** - İkonlar
- **localStorage** - Veri saklama

---

**Keyifli kodlamalar! 🚀**
