# DentiScan (MVP Prototip)

Modern, dental fotoğraf analiz ve anamnez destekli mobil uygulama prototipi.  
Amaç; **hasta ve uzman** rollerine göre:

- Dental fotoğraf yükleme/çekme
- **“AI analiz”** sonucu üretme
- Analize göre **dinamik anamnez formu** doldurma
- Raporları cihazda saklama ve görüntüleme
- Uzman tarafında paylaşılan raporları inceleme

akışlarını bir arada göstermek.

- Video Linki: https://youtube.com/shorts/J4lIFfjDGvQ?feature=share 

> **Önemli:** DentiScan **tıbbi tanı koymaz**. Sadece fotoğraf ve girilen bilgilere dayalı **risk değerlendirmesi ve bilgilendirme** sunar.  
> Gerçek hastalar için kullanılmamalıdır.

---

## 1. Kurulum ve Çalıştırma

### Gereksinimler

- Node.js (LTS)
- npm veya yarn
- Expo CLI (global şart değil, `npx` ile de çalışır)

### Projeyi Çalıştırma

```bash
cd "Mobil Uygulama Dersi/dentiscan"
npm install
npm start   # veya:
npm run android
npm run web
```

Telefonunuzda Expo Go ile QR kodu okutarak veya Android emülatöründe uygulamayı görebilirsiniz.

---

## 2. Teknolojiler ve Mimari

- **Framework**: Expo + React Native (**TypeScript**)
- **Navigasyon**: `@react-navigation`
  - Root Stack (`RootNavigator`)
  - Auth Stack (Welcome + Login)
  - Patient Stack (Tab + Yeni Analiz / Sonuç / Anamnez / Rapor Detay / Feedback)
  - Expert Stack (Tab + Rapor İnceleme)
- **Durum Yönetimi**: `zustand`
  - `authStore` – kullanıcı ve rol
  - `analysisStore` – son AI analiz sonucu
- **Formlar**: `react-hook-form` + `zod`
- **UI**: `react-native-paper` (Material 3) + custom light/dark renk paleti
- **Depolama**: `@react-native-async-storage/async-storage`
  - Raporlar
  - Feedback
  - Basit analytics (kaç analiz yapıldı, son analiz tarihi)
- **Fotoğraf**: `expo-image-picker` (kamera + galeri)
- **Dosya**: `expo-file-system` paketi projeye eklenmiştir (ileride PDF veya export için hazır)
- **Güvenlik**: Mock senaryoda gerçek token yok; gerçek projede `expo-secure-store` ile entegre edilebilir.

Klasör yapısı (özet):

```text
dentiscan/
  App.tsx
  src/
    navigation/
      RootNavigator.tsx
      auth/AuthNavigator.tsx
      patient/PatientNavigator.tsx
      expert/ExpertNavigator.tsx
      tabs/PatientTabs.tsx
      tabs/ExpertTabs.tsx
    features/
      auth/
      reports/
      profile/
      expert/
      feedback/
    services/
      aiService.ts
      reportService.ts
      feedbackService.ts
    store/
      authStore.ts
      analysisStore.ts
    ui/
      theme.ts
    components/
      AppPrimitives.tsx
    utils/
      analyticsService.ts
    types/
      models.ts
```

---

## 3. Veri Modelleri

`src/types/models.ts` içinde uygulamanın temel tipleri tanımlıdır:

- **User**
  - `id`, `role` (`patient` | `expert`), `name`, `email`
- **AiResult**
  - `summary`, `riskLevel` (`low` | `medium` | `high`)
  - `findings[]` – başlık, güven skoru, not
  - `recommendations[]`
  - `anamnesis` – AI’ın önerdiği anamnez alanları ve soruları
  - `disclaimer`
- **Report**
  - `id`, `patientId`, `createdAt`
  - `imageUri` – dental fotoğraf URI
  - `aiResult` – yukarıdaki JSON şemasına uygun
  - `anamnesisAnswers` – soru-id / cevap map’i
  - `sharedWithExpert?: boolean`
  - `expertNote?: string` – uzman notu (mock)

---

## 4. Servisler

### 4.1 `aiService.ts`

- `analyzeDentalPhoto(imageUri) : Promise<{ aiResult: AiResult; interpretation: string | null }>`
  - Fotoğrafı base64’e çevirir (`expo-image-manipulator`).
  - `POST { imageBase64 }` ile **Python/Colab backend**’deki `/analyze` endpoint’ine istek atar.
  - Backend:
    - `prithivMLmods/tooth-agenesis-siglip2` modeli ile dental sınıflandırma yapar.
    - `meta-llama/Llama-3.1-8B-Instruct` (veya seçtiğiniz başka bir LLM) ile **Türkçe açıklama** üretir.
    - İkisini birlikte döner:
      - `aiResult`: UI’daki özet, bulgular, öneriler, anamnez vs.
      - `interpretation`: LLM’den dönen serbest metin açıklama (yoksa `null`).
- Backend’e ulaşılamazsa veya hata olursa:
  - Uçtan uca akış bozulmasın diye **lokal mock `AiResult`** üretilir, `interpretation: null` döner.

### 4.2 `reportService.ts`

- `createReport(report)` – yeni rapor kaydeder (AsyncStorage)
- `listReportsByPatient(patientId)` – “Analizlerim” ekranı için liste
- `getReport(id)` – rapor detayı
- `updateReport(id, patch)` – rapor güncelleme (örneğin `sharedWithExpert`, `expertNote`)
- `listSharedReports()` – uzman tarafı için paylaşılan raporlar

### 4.3 `feedbackService.ts`

- `submitFeedback(rating, comment)` – yıldız + yorum kaydı
- `listFeedback()` – kayıtlı geri bildirimleri listeler (şu an sadece demo amaçlı)

### 4.4 `analyticsService.ts`

- `incrementAnalysisCount()` – her yeni rapor sonrası sayaç + tarih güncellenir.
- `getAnalytics()` – toplam analiz sayısı ve son analiz tarihi.

---

## 5. Ekranlar ve Akışlar

### 5.1 Onboarding / Welcome (`WelcomeScreen`)

- Uygulamanın amacı, gizlilik ve “tıbbi tanı değildir” uyarısı.
- İki chip:
  - “**Hasta olarak devam et**”
  - “**Uzman olarak devam et**”
- Seçime göre `LoginScreen`’e yönlendirir ve rol parametresi geçirir.

### 5.2 Auth (`LoginScreen`)

- `react-hook-form + zod` ile:
  - Ad Soyad
  - E-posta
- `loginMock` ile `zustand` store’a kullanıcıyı yazar:
  - `role: 'patient' | 'expert'`
- Başarılı girişte:
  - Hasta → `PatientNavigator`
  - Uzman → `ExpertNavigator`

### 5.3 Hasta Paneli

**Tablar (`PatientTabs`):**

- **Ana Sayfa (`PatientHomeScreen`)**
  - “Yeni Analiz Başlat” kartı ve butonu → `NewAnalysisPhotoScreen`
  - Basit analytics kartı:
    - Toplam analiz sayısı
    - Son analiz tarihi
  - Son 3 rapor alanı placeholder (AsyncStorage üzerinden genişletilebilir)

- **Analizlerim (`ReportsListScreen`)**
  - Hasta id’ye göre raporlar AsyncStorage’dan çekilir.
  - Arama kutusu (özet metni içinde arama)
  - Risk seviyesine göre filtre chip’leri (low/medium/high/tümü)
  - Liste elemanına tıklayınca → `ReportDetailScreen`

- **Profil (`PatientProfileScreen`)**
  - Kullanıcı bilgileri (isim, e-posta, rol)
  - Gizlilik metni (fotoğrafların cihazda mock olarak tutulduğu vurgulanır)
  - “Çıkış Yap” butonu
  - “**Geri Bildirim Gönder**” → `FeedbackScreen`

### 5.4 Yeni Analiz Akışı (Hasta)

1. **Fotoğraf Yükle/Çek (`NewAnalysisPhotoScreen`)**
   - `expo-image-picker` ile:
     - Galeriden seç
     - Kamera ile çek (izin kontrolü)
   - Seçilen fotoğraf için önizleme
   - Segment buton:
     - Mock Analiz
     - API (varsa)
   - “Analiz Et”:
     - `analyzeDentalPhoto(imageUri)` çağrılır (yalnızca doğrulama amaçlı)
     - `AnalysisResultScreen`’e geçilir.

2. **Analiz Sonucu (`AnalysisResultScreen`)**
   - `analyzeDentalPhoto` ile gelen JSON:
     - `aiResult` – tooth-agenesis modelinden gelen ham sonuç (UI’da Türkçeleştirilmiş)
     - `interpretation` – Llama 3.1 (veya seçtiğiniz LLM) ile üretilmiş Türkçe açıklama
     - Özet
     - Risk seviyesi chip’i (renk kodlu)
     - Bulgular listesi
     - Öneriler listesi
     - Uyarı/disclaimer metni
   - “DentiScan Yorumu” kartı:
     - Önce “Detaylı yorum hazırlanıyor, lütfen bekleyin...” yazar.
     - LLM’den yanıt gelirse **sadece LLM yorumu** gösterilir.
     - Zaman aşımı veya hata durumunda: “LLM tabanlı detaylı yorum şu anda alınamadı...” mesajı gösterilir.
   - “**Anamnez Doldur**” butonu:
     - `AnamnesisFormScreen`’e geçiş

3. **Anamnez Formu (`AnamnesisFormScreen`)**
   - AI’ın `anamnesis` alanındaki sorulara göre dinamik alanlar:
     - pain, bleeding, duration, medical
   - `react-hook-form + zod` ile text alanları
   - “Raporu Kaydet”:
     - `Report` objesi oluşturulur
     - `createReport(report)` ile kaydedilir
     - `incrementAnalysisCount()` ile analytics güncellenir
     - `ReportDetailScreen`’e yönlenir.

4. **Rapor Detay (`ReportDetailScreen`)**
   - Fotoğraf (URI)
   - Analiz özeti ve risk seviyesi
   - Anamnez cevapları listesi
   - “Uzmanla paylaş” butonu:
     - `sharedWithExpert: true` olarak raporu günceller
     - Uzman panelindeki hasta listesine düşmesini simüle eder.

### 5.5 Uzman Paneli

- **Hasta Listesi (`ExpertPatientsScreen`)**
  - `listSharedReports()` ile `sharedWithExpert === true` raporlar çekilir.
  - `patientId`’e göre gruplanır (mock hasta kimlikleri)
  - Arama kutusu: hasta ID içinde arama
  - Her hasta altında rapor listesi:
    - Tarih, risk seviyesi, özet
    - Tıklandığında → `ExpertReportDetailScreen`

- **Rapor İnceleme (`ExpertReportDetailScreen`)**
  - Rapor özeti ve anamnez cevapları
  - “Uzman Notu / Öneri” alanı:
    - `expertNote` alanı AsyncStorage’da saklanır (mock)
    - “Notu Kaydet (Mock)” butonu

- **Uzman Profil (`ExpertProfileScreen`)**
  - Uzmanın mock bilgileri
  - Panelin demo amaçlı olduğu bilgisi

### 5.6 Feedback / Puanlama (`FeedbackScreen`)

- 1–5 arası yıldız seçimi
- Opsiyonel yorum alanı
- “Gönder”:
  - `submitFeedback(rating, comment)` ile AsyncStorage’a kaydedilir.
  - Buton “Teşekkürler!” durumuna geçer.

---

## 6. UI / Tema ve Durumlar

- **Tema**: `src/ui/theme.ts`
  - Light & Dark tabanlı modern sağlık renk paleti
  - Mavi/yeşil tonlar, yumuşak yüzeyler
- **Reusable bileşenler (`AppPrimitives.tsx`)**:
  - `Screen` – her ekran için temel layout
  - `AppButton` – yuvarlatılmış buton
  - `AppCard` – kart yapısı
  - `EmptyState` – boş liste durumları
  - `ErrorState` – hata mesajları
  - `LoadingOverlay` – tam ekran loading

Her liste ve veri çekme işlemi için:

- **Loading**: Analiz sonucu, rapor detayı vs. için yükleniyor gösterimi
- **Empty state**: Hiç rapor yoksa veya paylaşılan hasta yoksa
- **Error state**: Servis katmanındaki `try/catch` ile kullanıcı dostu hata mesajları

---

## 7. Notlar ve Geliştirme Önerileri

Bu proje, ders kapsamında **MVP / demo** amaçlı tasarlanmıştır:

- Gerçek hasta verisi ile kullanılmamalıdır.
- AI kısmı:
  - Lokal fallback’te **mock/heuristic** bazlıdır.
  - Python/Colab backend’i ile birlikte **gerçek görüntü sınıflandırma + LLM yorumlama** akışı sağlar.

İleri faz için fikirler:

- Gerçek AI servisi entegrasyonu (`ANALYSIS_API_URL` üzerinden)
- PDF rapor üretimi (`expo-file-system` + PDF kütüphesi)
- Gerçek backend + JWT auth (`expo-secure-store` ile token saklama)
- Yetkilendirme, audit log, çoklu klinik desteği
- Daha detaylı dental bulgu şeması ve anotasyonlu görsel işaretleme

Bu README, projeyi hızlıca ayağa kaldırmanız ve temel akışları anlamanız için özet bir rehberdir.  
Kodun tamamı TypeScript ile yazıldığı için, bileşen ve tip isimleri üzerinden kolayca keşfe devam edebilirsiniz.

---

## 8. Python Backend (Lokal) – `python-backend/`

> Bu klasör Git’e yalnızca **kaynak kod** ile dahil edilmelidir.  
> `venv/` ve diğer derlenmiş dosyalar `.gitignore` ile dışarıda bırakılmıştır.

### 8.1 Bağımlılıklar

`python-backend/requirements.txt`:

```txt
fastapi==0.115.5
uvicorn[standard]==0.32.0
transformers==4.45.2
torch>=2.3.0
Pillow==10.4.0
python-multipart==0.0.12
accelerate==1.0.1
```

### 8.2 Sanal ortam ve çalıştırma

```bash
cd python-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

uvicorn app:app --host 0.0.0.0 --port 4001
```

- `GET /health` → `{ ok: true, image_model, llm_model }`
- `POST /analyze`:
  - Body: `{ "imageBase64": "<base64-görüntü>" }`
  - Response: `{ aiResult: AiResult, interpretation: string | null }`

> **Uyarı:** Llama 3.1 8B modeli CPU’da ağırdır. Gerçek kullanım için GPU’lu bir makine veya Colab GPU önerilir.

---

## 9. Colab Backend (Önerilen Geliştirme Senaryosu)

Lokal makineniz Llama 3.1 8B için yetersizse, aynı backend’i Google Colab üzerinde çalıştırabilirsiniz.

### 9.1 Adımlar (özet)

1. Yeni bir Colab defteri açın.
2. README’nin sonundaki “Colab backend örneği” hücrelerini sırasıyla çalıştırın:
   - Hugging Face’e `login(...)` ile giriş
   - FastAPI + modelleri kurup `app`’i tanımlama
   - `pyngrok` ile `uvicorn`’u dışarı açma
3. Colab çıktısında görünen:

```text
PUBLIC URL: https://xxxx.ngrok-free.app
Health check: https://xxxx.ngrok-free.app/health
```

4. Mobil uygulamada `BACKEND_URL` sabitini bu URL ile güncelleyin:

```ts
// src/services/aiService.ts
const BACKEND_URL = 'https://xxxx.ngrok-free.app';
```

Artık:

- `analyzeDentalPhoto` → `https://xxxx.ngrok-free.app/analyze`
- Backend:
  - tooth-agenesis sınıflandırma
  - Llama 3.1 ile Türkçe yorum
  - Sonucu mobil UI’a döndürür.

---

## 10. Git / Depo Temizliği

- Node tarafı:
  - `node_modules/`, `.expo/`, `.expo-shared/` zaten `.gitignore` içinde.
- Python tarafı:
  - `python-backend/venv/`
  - `__pycache__/`, `*.pyc`
  - Colab checkpoint/defterleri: `*.ipynb`, `.ipynb_checkpoints/`

Bu sayede:

- Depoya yalnızca **kaynak kod** ve konfigürasyonlar girer.
- Büyük venv / model cache’leri remote’a push edilmez.

