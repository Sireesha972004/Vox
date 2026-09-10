const TOKEN_KEY = 'vox-token';
const THEME_KEY = 'vox-theme';
const LANGUAGE_KEY = 'vox-language';
const appTranslations = {
  en: { library: 'Your library', refresh: 'Refresh', emptyLibrary: 'Your generated audio will appear here.', createAudio: 'Create audio', createDescription: 'Voice Output Experience cleans the text, splits it into chunks, and speaks it back to you.', title: 'Title', voice: 'Voice', yourText: 'Your text', useUrl: 'Use URL', convert: 'Convert to voice', upload: 'Upload file' },
  hi: { library: 'आपकी लाइब्रेरी', refresh: 'रिफ्रेश', emptyLibrary: 'आपका बनाया हुआ ऑडियो यहां दिखाई देगा।', createAudio: 'ऑडियो बनाएं', createDescription: 'Voice Output Experience टेक्स्ट को साफ करके ऑडियो में बदलता है।', title: 'शीर्षक', voice: 'आवाज़', yourText: 'आपका टेक्स्ट', useUrl: 'URL उपयोग करें', convert: 'आवाज़ में बदलें', upload: 'फ़ाइल अपलोड करें' },
  ta: { library: 'உங்கள் நூலகம்', refresh: 'புதுப்பி', emptyLibrary: 'உருவாக்கிய ஆடியோ இங்கே தோன்றும்.', createAudio: 'ஆடியோ உருவாக்கு', createDescription: 'Voice Output Experience உரையை ஆடியோவாக மாற்றுகிறது.', title: 'தலைப்பு', voice: 'குரல்', yourText: 'உங்கள் உரை', useUrl: 'URL பயன்படுத்து', convert: 'குரலாக மாற்று', upload: 'கோப்பைப் பதிவேற்று' },
  te: { library: 'మీ లైబ్రరీ', refresh: 'రిఫ్రెష్', emptyLibrary: 'మీ ఆడియో ఇక్కడ కనిపిస్తుంది.', createAudio: 'ఆడియో సృష్టించండి', createDescription: 'Voice Output Experience మీ టెక్స్ట్‌ను ఆడియోగా మారుస్తుంది.', title: 'శీర్షిక', voice: 'వాయిస్', yourText: 'మీ టెక్స్ట్', useUrl: 'URL ఉపయోగించండి', convert: 'వాయిస్‌గా మార్చండి', upload: 'ఫైల్ అప్‌లోడ్ చేయండి' },
  kn: { library: 'ನಿಮ್ಮ ಲೈಬ್ರರಿ', refresh: 'ರಿಫ್ರೆಶ್', emptyLibrary: 'ನಿಮ್ಮ ಆಡಿಯೋ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.', createAudio: 'ಆಡಿಯೋ ರಚಿಸಿ', createDescription: 'Voice Output Experience ನಿಮ್ಮ ಪಠ್ಯವನ್ನು ಆಡಿಯೋ ಆಗಿ ಬದಲಿಸುತ್ತದೆ.', title: 'ಶೀರ್ಷಿಕೆ', voice: 'ಧ್ವನಿ', yourText: 'ನಿಮ್ಮ ಪಠ್ಯ', useUrl: 'URL ಬಳಸಿ', convert: 'ಧ್ವನಿಗೆ ಬದಲಿಸಿ', upload: 'ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' },
  ml: { library: 'നിങ്ങളുടെ ലൈബ്രറി', refresh: 'പുതുക്കുക', emptyLibrary: 'നിങ്ങളുടെ ഓഡിയോ ഇവിടെ കാണിക്കും.', createAudio: 'ഓഡിയോ സൃഷ്ടിക്കുക', createDescription: 'Voice Output Experience നിങ്ങളുടെ ടെക്സ്റ്റ് ഓഡിയോ ആക്കുന്നു.', title: 'ശീർഷകം', voice: 'ശബ്ദം', yourText: 'നിങ്ങളുടെ ടെക്സ്റ്റ്', useUrl: 'URL ഉപയോഗിക്കുക', convert: 'ശബ്ദമാക്കുക', upload: 'ഫയൽ അപ്‌ലോഡ് ചെയ്യുക' },
  bn: { library: 'আপনার লাইব্রেরি', refresh: 'রিফ্রেশ', emptyLibrary: 'আপনার তৈরি অডিও এখানে দেখা যাবে।', createAudio: 'অডিও তৈরি করুন', createDescription: 'Voice Output Experience আপনার টেক্সটকে অডিওতে বদলায়।', title: 'শিরোনাম', voice: 'ভয়েস', yourText: 'আপনার টেক্সট', useUrl: 'URL ব্যবহার করুন', convert: 'ভয়েসে বদলান', upload: 'ফাইল আপলোড করুন' },
  mr: { library: 'तुमची लायब्ररी', refresh: 'रिफ्रेश', emptyLibrary: 'तुमचे तयार केलेले ऑडिओ येथे दिसेल.', createAudio: 'ऑडिओ तयार करा', createDescription: 'Voice Output Experience तुमचा मजकूर ऑडिओमध्ये बदलते.', title: 'शीर्षक', voice: 'आवाज', yourText: 'तुमचा मजकूर', useUrl: 'URL वापरा', convert: 'आवाजात बदला', upload: 'फाइल अपलोड करा' },
  gu: { library: 'તમારી લાઇબ્રેરી', refresh: 'રિફ્રેશ', emptyLibrary: 'તમારું બનાવેલું ઓડિયો અહીં દેખાશે.', createAudio: 'ઓડિયો બનાવો', createDescription: 'Voice Output Experience તમારા ટેક્સ્ટને ઓડિયોમાં બદલે છે.', title: 'શીર્ષક', voice: 'અવાજ', yourText: 'તમારો ટેક્સ્ટ', useUrl: 'URL વાપરો', convert: 'અવાજમાં બદલો', upload: 'ફાઇલ અપલોડ કરો' },
  pa: { library: 'ਤੁਹਾਡੀ ਲਾਇਬ੍ਰੇਰੀ', refresh: 'ਰਿਫ੍ਰੈਸ਼', emptyLibrary: 'ਤੁਹਾਡਾ ਬਣਾਇਆ ਆਡੀਓ ਇੱਥੇ ਦਿਖੇਗਾ।', createAudio: 'ਆਡੀਓ ਬਣਾਓ', createDescription: 'Voice Output Experience ਤੁਹਾਡੇ ਟੈਕਸਟ ਨੂੰ ਆਡੀਓ ਵਿੱਚ ਬਦਲਦਾ ਹੈ।', title: 'ਸਿਰਲੇਖ', voice: 'ਆਵਾਜ਼', yourText: 'ਤੁਹਾਡਾ ਟੈਕਸਟ', useUrl: 'URL ਵਰਤੋ', convert: 'ਆਵਾਜ਼ ਵਿੱਚ ਬਦਲੋ', upload: 'ਫਾਈਲ ਅੱਪਲੋਡ ਕਰੋ' },
  ur: { library: 'آپ کی لائبریری', refresh: 'تازہ کریں', emptyLibrary: 'آپ کی بنائی ہوئی آڈیو یہاں دکھائی دے گی۔', createAudio: 'آڈیو بنائیں', createDescription: 'Voice Output Experience آپ کے متن کو آڈیو میں بدلتا ہے۔', title: 'عنوان', voice: 'آواز', yourText: 'آپ کا متن', useUrl: 'URL استعمال کریں', convert: 'آواز میں تبدیل کریں', upload: 'فائل اپ لوڈ کریں' },
  ar: { library: 'مكتبتك', refresh: 'تحديث', emptyLibrary: 'سيظهر الصوت الذي أنشأته هنا.', createAudio: 'إنشاء صوت', createDescription: 'يحوّل Voice Output Experience النص إلى صوت.', title: 'العنوان', voice: 'الصوت', yourText: 'نصك', useUrl: 'استخدام الرابط', convert: 'تحويل إلى صوت', upload: 'رفع ملف' },
  zh: { library: '你的资料库', refresh: '刷新', emptyLibrary: '你生成的音频会显示在这里。', createAudio: '创建音频', createDescription: 'Voice Output Experience 会将文本转换为音频。', title: '标题', voice: '声音', yourText: '你的文本', useUrl: '使用网址', convert: '转换为语音', upload: '上传文件' },
  ja: { library: 'あなたのライブラリ', refresh: '更新', emptyLibrary: '作成した音声がここに表示されます。', createAudio: '音声を作成', createDescription: 'Voice Output Experience はテキストを音声に変換します。', title: 'タイトル', voice: '音声', yourText: 'テキスト', useUrl: 'URLを使用', convert: '音声に変換', upload: 'ファイルをアップロード' },
  ko: { library: '내 라이브러리', refresh: '새로 고침', emptyLibrary: '생성한 오디오가 여기에 표시됩니다.', createAudio: '오디오 만들기', createDescription: 'Voice Output Experience가 텍스트를 오디오로 변환합니다.', title: '제목', voice: '음성', yourText: '내 텍스트', useUrl: 'URL 사용', convert: '음성으로 변환', upload: '파일 업로드' },
  es: { library: 'Tu biblioteca', refresh: 'Actualizar', emptyLibrary: 'El audio generado aparecerá aquí.', createAudio: 'Crear audio', createDescription: 'Voice Output Experience convierte el texto en audio.', title: 'Título', voice: 'Voz', yourText: 'Tu texto', useUrl: 'Usar URL', convert: 'Convertir a voz', upload: 'Subir archivo' },
  fr: { library: 'Votre bibliothèque', refresh: 'Actualiser', emptyLibrary: 'Votre audio généré apparaîtra ici.', createAudio: 'Créer un audio', createDescription: 'Voice Output Experience transforme le texte en audio.', title: 'Titre', voice: 'Voix', yourText: 'Votre texte', useUrl: 'Utiliser l’URL', convert: 'Convertir en voix', upload: 'Importer un fichier' },
  de: { library: 'Ihre Bibliothek', refresh: 'Aktualisieren', emptyLibrary: 'Ihre erstellten Audiodateien erscheinen hier.', createAudio: 'Audio erstellen', createDescription: 'Voice Output Experience wandelt Text in Audio um.', title: 'Titel', voice: 'Stimme', yourText: 'Ihr Text', useUrl: 'URL verwenden', convert: 'In Sprache umwandeln', upload: 'Datei hochladen' },
  pt: { library: 'Sua biblioteca', refresh: 'Atualizar', emptyLibrary: 'Seu áudio gerado aparecerá aqui.', createAudio: 'Criar áudio', createDescription: 'Voice Output Experience transforma texto em áudio.', title: 'Título', voice: 'Voz', yourText: 'Seu texto', useUrl: 'Usar URL', convert: 'Converter em voz', upload: 'Enviar arquivo' },
  it: { library: 'La tua libreria', refresh: 'Aggiorna', emptyLibrary: 'L’audio generato apparirà qui.', createAudio: 'Crea audio', createDescription: 'Voice Output Experience trasforma il testo in audio.', title: 'Titolo', voice: 'Voce', yourText: 'Il tuo testo', useUrl: 'Usa URL', convert: 'Converti in voce', upload: 'Carica file' },
  ru: { library: 'Ваша библиотека', refresh: 'Обновить', emptyLibrary: 'Созданное аудио появится здесь.', createAudio: 'Создать аудио', createDescription: 'Voice Output Experience преобразует текст в аудио.', title: 'Название', voice: 'Голос', yourText: 'Ваш текст', useUrl: 'Использовать URL', convert: 'Преобразовать в голос', upload: 'Загрузить файл' },
  tr: { library: 'Kitaplığınız', refresh: 'Yenile', emptyLibrary: 'Oluşturduğunuz ses burada görünecek.', createAudio: 'Ses oluştur', createDescription: 'Voice Output Experience metni sese dönüştürür.', title: 'Başlık', voice: 'Ses', yourText: 'Metniniz', useUrl: 'URL kullan', convert: 'Sese dönüştür', upload: 'Dosya yükle' },
  vi: { library: 'Thư viện của bạn', refresh: 'Làm mới', emptyLibrary: 'Âm thanh đã tạo sẽ xuất hiện ở đây.', createAudio: 'Tạo âm thanh', createDescription: 'Voice Output Experience chuyển văn bản thành âm thanh.', title: 'Tiêu đề', voice: 'Giọng nói', yourText: 'Văn bản của bạn', useUrl: 'Dùng URL', convert: 'Chuyển thành giọng nói', upload: 'Tải tệp lên' },
  id: { library: 'Pustaka Anda', refresh: 'Muat ulang', emptyLibrary: 'Audio yang dibuat akan muncul di sini.', createAudio: 'Buat audio', createDescription: 'Voice Output Experience mengubah teks menjadi audio.', title: 'Judul', voice: 'Suara', yourText: 'Teks Anda', useUrl: 'Gunakan URL', convert: 'Ubah menjadi suara', upload: 'Unggah file' },
};
const translations = {
  en: {
    profile: 'Profile', settings: 'Settings', appearance: 'Appearance', security: 'Security', signOut: 'Sign Out',
    backToLibrary: 'Back to library', changePhoto: 'Change Photo', useInitial: 'Use my first letter instead',
    theme: 'Theme', themeDescription: 'Choose your preferred theme.', language: 'Language', light: 'Light', dark: 'Dark', system: 'System',
    profileDescription: 'Manage your personal information and profile image.', appearanceDescription: 'Customize how Voice Output Experience looks and feels.',
    securityDescription: 'Keep your account secure.',
  },
  hi: {
    profile: 'प्रोफ़ाइल', settings: 'सेटिंग्स', appearance: 'दिखावट', security: 'सुरक्षा', signOut: 'साइन आउट',
    backToLibrary: 'लाइब्रेरी पर वापस जाएं', changePhoto: 'फोटो बदलें', useInitial: 'पहले अक्षर का उपयोग करें',
    theme: 'थीम', themeDescription: 'अपनी पसंदीदा थीम चुनें।', language: 'भाषा', light: 'हल्का', dark: 'गहरा', system: 'सिस्टम',
    profileDescription: 'अपनी व्यक्तिगत जानकारी और प्रोफ़ाइल फोटो प्रबंधित करें।', appearanceDescription: 'Voice Output Experience का रूप और अनुभव बदलें।',
    securityDescription: 'अपने खाते को सुरक्षित रखें।',
  },
  ta: {
    profile: 'சுயவிவரம்', settings: 'அமைப்புகள்', appearance: 'தோற்றம்', security: 'பாதுகாப்பு', signOut: 'வெளியேறு',
    backToLibrary: 'நூலகத்திற்குத் திரும்பு', changePhoto: 'புகைப்படத்தை மாற்று', useInitial: 'முதல் எழுத்தைப் பயன்படுத்து',
    theme: 'தீம்', themeDescription: 'உங்களுக்கு விருப்பமான தீமைத் தேர்ந்தெடுக்கவும்.', language: 'மொழி', light: 'ஒளி', dark: 'இருள்', system: 'கணினி',
    profileDescription: 'உங்கள் தனிப்பட்ட தகவல் மற்றும் சுயவிவரப் படத்தை நிர்வகிக்கவும்.', appearanceDescription: 'Voice Output Experience தோற்றத்தையும் அனுபவத்தையும் மாற்றவும்.',
    securityDescription: 'உங்கள் கணக்கைப் பாதுகாப்பாக வைத்திருக்கவும்.',
  },
  te: {
    profile: 'ప్రొఫైల్', settings: 'సెట్టింగ్స్', appearance: 'రూపం', security: 'భద్రత', signOut: 'సైన్ అవుట్',
    backToLibrary: 'లైబ్రరీకి తిరిగి వెళ్ళు', changePhoto: 'ఫోటో మార్చు', useInitial: 'మొదటి అక్షరాన్ని ఉపయోగించు', theme: 'థీమ్', themeDescription: 'మీకు నచ్చిన థీమ్ ఎంచుకోండి.', language: 'భాష', light: 'లైట్', dark: 'డార్క్', system: 'సిస్టమ్', profileDescription: 'మీ వ్యక్తిగత సమాచారం మరియు ప్రొఫైల్ చిత్రాన్ని నిర్వహించండి.', appearanceDescription: 'Voice Output Experience రూపాన్ని మార్చండి.', securityDescription: 'మీ ఖాతాను సురక్షితంగా ఉంచండి.'
  },
  kn: {
    profile: 'ಪ್ರೊಫೈಲ್', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', appearance: 'ನೋಟ', security: 'ಭದ್ರತೆ', signOut: 'ಸೈನ್ ಔಟ್', backToLibrary: 'ಲೈಬ್ರರಿಗೆ ಹಿಂತಿರುಗಿ', changePhoto: 'ಫೋಟೋ ಬದಲಿಸಿ', useInitial: 'ಮೊದಲ ಅಕ್ಷರ ಬಳಸಿ', theme: 'ಥೀಮ್', themeDescription: 'ನಿಮ್ಮ ಇಷ್ಟದ ಥೀಮ್ ಆಯ್ಕೆಮಾಡಿ.', language: 'ಭಾಷೆ', light: 'ಬೆಳಕು', dark: 'ಕತ್ತಲೆ', system: 'ಸಿಸ್ಟಮ್', profileDescription: 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಮತ್ತು ಪ್ರೊಫೈಲ್ ಚಿತ್ರವನ್ನು ನಿರ್ವಹಿಸಿ.', appearanceDescription: 'Voice Output Experience ನ ನೋಟವನ್ನು ಬದಲಿಸಿ.', securityDescription: 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ.'
  },
  ml: {
    profile: 'പ്രൊഫൈൽ', settings: 'ക്രമീകരണങ്ങൾ', appearance: 'രൂപം', security: 'സുരക്ഷ', signOut: 'പുറത്തുകടക്കുക', backToLibrary: 'ലൈബ്രറിയിലേക്ക് മടങ്ങുക', changePhoto: 'ഫോട്ടോ മാറ്റുക', useInitial: 'ആദ്യ അക്ഷരം ഉപയോഗിക്കുക', theme: 'തീം', themeDescription: 'ഇഷ്ടമുള്ള തീം തിരഞ്ഞെടുക്കുക.', language: 'ഭാഷ', light: 'ലൈറ്റ്', dark: 'ഡാർക്ക്', system: 'സിസ്റ്റം', profileDescription: 'വ്യക്തിഗത വിവരവും പ്രൊഫൈൽ ചിത്രവും നിയന്ത്രിക്കുക.', appearanceDescription: 'Voice Output Experience രൂപം മാറ്റുക.', securityDescription: 'നിങ്ങളുടെ അക്കൗണ്ട് സുരക്ഷിതമാക്കുക.'
  },
  bn: {
    profile: 'প্রোফাইল', settings: 'সেটিংস', appearance: 'চেহারা', security: 'নিরাপত্তা', signOut: 'সাইন আউট', backToLibrary: 'লাইব্রেরিতে ফিরে যান', changePhoto: 'ছবি বদলান', useInitial: 'প্রথম অক্ষর ব্যবহার করুন', theme: 'থিম', themeDescription: 'আপনার পছন্দের থিম বেছে নিন।', language: 'ভাষা', light: 'হালকা', dark: 'গাঢ়', system: 'সিস্টেম', profileDescription: 'আপনার ব্যক্তিগত তথ্য ও প্রোফাইল ছবি পরিচালনা করুন।', appearanceDescription: 'Voice Output Experience-এর চেহারা বদলান।', securityDescription: 'আপনার অ্যাকাউন্ট নিরাপদ রাখুন।'
  },
  mr: {
    profile: 'प्रोफाइल', settings: 'सेटिंग्ज', appearance: 'दिसणे', security: 'सुरक्षा', signOut: 'साइन आउट', backToLibrary: 'लायब्ररीवर परत जा', changePhoto: 'फोटो बदला', useInitial: 'पहिले अक्षर वापरा', theme: 'थीम', themeDescription: 'तुमची आवडती थीम निवडा.', language: 'भाषा', light: 'फिकट', dark: 'गडद', system: 'सिस्टम', profileDescription: 'तुमची वैयक्तिक माहिती आणि प्रोफाइल चित्र व्यवस्थापित करा.', appearanceDescription: 'Voice Output Experience चे स्वरूप बदला.', securityDescription: 'तुमचे खाते सुरक्षित ठेवा.'
  },
  gu: {
    profile: 'પ્રોફાઇલ', settings: 'સેટિંગ્સ', appearance: 'દેખાવ', security: 'સુરક્ષા', signOut: 'સાઇન આઉટ', backToLibrary: 'લાઇબ્રેરી પર પાછા જાઓ', changePhoto: 'ફોટો બદલો', useInitial: 'પ્રથમ અક્ષર વાપરો', theme: 'થીમ', themeDescription: 'તમારી પસંદની થીમ પસંદ કરો.', language: 'ભાષા', light: 'લાઇટ', dark: 'ડાર્ક', system: 'સિસ્ટમ', profileDescription: 'તમારી વ્યક્તિગત માહિતી અને પ્રોફાઇલ ચિત્રનું સંચાલન કરો.', appearanceDescription: 'Voice Output Experience નો દેખાવ બદલો.', securityDescription: 'તમારું એકાઉન્ટ સુરક્ષિત રાખો.'
  },
  pa: {
    profile: 'ਪ੍ਰੋਫਾਈਲ', settings: 'ਸੈਟਿੰਗਾਂ', appearance: 'ਦਿੱਖ', security: 'ਸੁਰੱਖਿਆ', signOut: 'ਸਾਈਨ ਆਊਟ', backToLibrary: 'ਲਾਇਬ੍ਰੇਰੀ ਤੇ ਵਾਪਸ ਜਾਓ', changePhoto: 'ਫੋਟੋ ਬਦਲੋ', useInitial: 'ਪਹਿਲਾ ਅੱਖਰ ਵਰਤੋ', theme: 'ਥੀਮ', themeDescription: 'ਆਪਣੀ ਪਸੰਦ ਦੀ ਥੀਮ ਚੁਣੋ।', language: 'ਭਾਸ਼ਾ', light: 'ਹਲਕਾ', dark: 'ਗੂੜ੍ਹਾ', system: 'ਸਿਸਟਮ', profileDescription: 'ਆਪਣੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਅਤੇ ਪ੍ਰੋਫਾਈਲ ਤਸਵੀਰ ਸੰਭਾਲੋ.', appearanceDescription: 'Voice Output Experience ਦੀ ਦਿੱਖ ਬਦਲੋ.', securityDescription: 'ਆਪਣਾ ਖਾਤਾ ਸੁਰੱਖਿਅਤ ਰੱਖੋ.'
  },
  ur: {
    profile: 'پروفائل', settings: 'ترتیبات', appearance: 'ظاہری شکل', security: 'سیکیورٹی', signOut: 'سائن آؤٹ', backToLibrary: 'لائبریری پر واپس جائیں', changePhoto: 'تصویر تبدیل کریں', useInitial: 'پہلا حرف استعمال کریں', theme: 'تھیم', themeDescription: 'اپنی پسندیدہ تھیم منتخب کریں۔', language: 'زبان', light: 'روشن', dark: 'تاریک', system: 'سسٹم', profileDescription: 'اپنی ذاتی معلومات اور پروفائل تصویر کا انتظام کریں۔', appearanceDescription: 'Voice Output Experience کی شکل تبدیل کریں۔', securityDescription: 'اپنا اکاؤنٹ محفوظ رکھیں۔'
  },
  ar: {
    profile: 'الملف الشخصي', settings: 'الإعدادات', appearance: 'المظهر', security: 'الأمان', signOut: 'تسجيل الخروج', backToLibrary: 'العودة إلى المكتبة', changePhoto: 'تغيير الصورة', useInitial: 'استخدم الحرف الأول', theme: 'السمة', themeDescription: 'اختر السمة المفضلة لديك.', language: 'اللغة', light: 'فاتح', dark: 'داكن', system: 'النظام', profileDescription: 'إدارة معلوماتك الشخصية وصورة ملفك الشخصي.', appearanceDescription: 'تغيير مظهر Voice Output Experience.', securityDescription: 'حافظ على أمان حسابك.'
  },
  zh: {
    profile: '个人资料', settings: '设置', appearance: '外观', security: '安全', signOut: '退出登录', backToLibrary: '返回资料库', changePhoto: '更换照片', useInitial: '使用我的首字母', theme: '主题', themeDescription: '选择你喜欢的主题。', language: '语言', light: '浅色', dark: '深色', system: '系统', profileDescription: '管理个人信息和头像。', appearanceDescription: '自定义 Voice Output Experience 的外观。', securityDescription: '保护你的账户安全。'
  },
  ja: {
    profile: 'プロフィール', settings: '設定', appearance: '外観', security: 'セキュリティ', signOut: 'サインアウト', backToLibrary: 'ライブラリに戻る', changePhoto: '写真を変更', useInitial: '最初の文字を使用', theme: 'テーマ', themeDescription: 'お好みのテーマを選択してください。', language: '言語', light: 'ライト', dark: 'ダーク', system: 'システム', profileDescription: '個人情報とプロフィール画像を管理します。', appearanceDescription: 'Voice Output Experience の外観をカスタマイズします。', securityDescription: 'アカウントを安全に保ちます。'
  },
  ko: {
    profile: '프로필', settings: '설정', appearance: '화면', security: '보안', signOut: '로그아웃', backToLibrary: '라이브러리로 돌아가기', changePhoto: '사진 변경', useInitial: '첫 글자 사용', theme: '테마', themeDescription: '원하는 테마를 선택하세요.', language: '언어', light: '라이트', dark: '다크', system: '시스템', profileDescription: '개인 정보와 프로필 이미지를 관리합니다.', appearanceDescription: 'Voice Output Experience 화면을 꾸밉니다.', securityDescription: '계정을 안전하게 보호합니다.'
  },
  es: {
    profile: 'Perfil', settings: 'Configuración', appearance: 'Apariencia', security: 'Seguridad', signOut: 'Cerrar sesión', backToLibrary: 'Volver a la biblioteca', changePhoto: 'Cambiar foto', useInitial: 'Usar mi primera letra', theme: 'Tema', themeDescription: 'Elige tu tema preferido.', language: 'Idioma', light: 'Claro', dark: 'Oscuro', system: 'Sistema', profileDescription: 'Administra tu información personal y foto de perfil.', appearanceDescription: 'Personaliza el aspecto de Voice Output Experience.', securityDescription: 'Mantén tu cuenta segura.'
  },
  fr: {
    profile: 'Profil', settings: 'Paramètres', appearance: 'Apparence', security: 'Sécurité', signOut: 'Se déconnecter', backToLibrary: 'Retour à la bibliothèque', changePhoto: 'Changer la photo', useInitial: 'Utiliser mon initiale', theme: 'Thème', themeDescription: 'Choisissez votre thème préféré.', language: 'Langue', light: 'Clair', dark: 'Sombre', system: 'Système', profileDescription: 'Gérez vos informations personnelles et votre photo de profil.', appearanceDescription: 'Personnalisez l’apparence de Voice Output Experience.', securityDescription: 'Gardez votre compte sécurisé.'
  },
  de: {
    profile: 'Profil', settings: 'Einstellungen', appearance: 'Erscheinungsbild', security: 'Sicherheit', signOut: 'Abmelden', backToLibrary: 'Zur Bibliothek', changePhoto: 'Foto ändern', useInitial: 'Meinen Anfangsbuchstaben verwenden', theme: 'Thema', themeDescription: 'Wählen Sie Ihr bevorzugtes Thema.', language: 'Sprache', light: 'Hell', dark: 'Dunkel', system: 'System', profileDescription: 'Verwalten Sie Ihre persönlichen Daten und Ihr Profilbild.', appearanceDescription: 'Passen Sie das Erscheinungsbild von Voice Output Experience an.', securityDescription: 'Sichern Sie Ihr Konto.'
  },
  pt: {
    profile: 'Perfil', settings: 'Configurações', appearance: 'Aparência', security: 'Segurança', signOut: 'Sair', backToLibrary: 'Voltar à biblioteca', changePhoto: 'Alterar foto', useInitial: 'Usar minha inicial', theme: 'Tema', themeDescription: 'Escolha seu tema preferido.', language: 'Idioma', light: 'Claro', dark: 'Escuro', system: 'Sistema', profileDescription: 'Gerencie suas informações pessoais e foto de perfil.', appearanceDescription: 'Personalize a aparência do Voice Output Experience.', securityDescription: 'Mantenha sua conta segura.'
  },
  it: {
    profile: 'Profilo', settings: 'Impostazioni', appearance: 'Aspetto', security: 'Sicurezza', signOut: 'Esci', backToLibrary: 'Torna alla libreria', changePhoto: 'Cambia foto', useInitial: 'Usa la mia iniziale', theme: 'Tema', themeDescription: 'Scegli il tema preferito.', language: 'Lingua', light: 'Chiaro', dark: 'Scuro', system: 'Sistema', profileDescription: 'Gestisci le informazioni personali e la foto del profilo.', appearanceDescription: 'Personalizza l’aspetto di Voice Output Experience.', securityDescription: 'Mantieni sicuro il tuo account.'
  },
  ru: {
    profile: 'Профиль', settings: 'Настройки', appearance: 'Внешний вид', security: 'Безопасность', signOut: 'Выйти', backToLibrary: 'Вернуться в библиотеку', changePhoto: 'Изменить фото', useInitial: 'Использовать первую букву', theme: 'Тема', themeDescription: 'Выберите предпочитаемую тему.', language: 'Язык', light: 'Светлая', dark: 'Тёмная', system: 'Системная', profileDescription: 'Управляйте личными данными и фото профиля.', appearanceDescription: 'Настройте внешний вид Voice Output Experience.', securityDescription: 'Защитите свой аккаунт.'
  },
  tr: {
    profile: 'Profil', settings: 'Ayarlar', appearance: 'Görünüm', security: 'Güvenlik', signOut: 'Çıkış yap', backToLibrary: 'Kütüphaneye dön', changePhoto: 'Fotoğrafı değiştir', useInitial: 'İlk harfimi kullan', theme: 'Tema', themeDescription: 'Tercih ettiğiniz temayı seçin.', language: 'Dil', light: 'Açık', dark: 'Koyu', system: 'Sistem', profileDescription: 'Kişisel bilgilerinizi ve profil resminizi yönetin.', appearanceDescription: 'Voice Output Experience görünümünü özelleştirin.', securityDescription: 'Hesabınızı güvende tutun.'
  },
  vi: {
    profile: 'Hồ sơ', settings: 'Cài đặt', appearance: 'Giao diện', security: 'Bảo mật', signOut: 'Đăng xuất', backToLibrary: 'Quay lại thư viện', changePhoto: 'Đổi ảnh', useInitial: 'Dùng chữ cái đầu', theme: 'Chủ đề', themeDescription: 'Chọn chủ đề bạn thích.', language: 'Ngôn ngữ', light: 'Sáng', dark: 'Tối', system: 'Hệ thống', profileDescription: 'Quản lý thông tin cá nhân và ảnh hồ sơ.', appearanceDescription: 'Tùy chỉnh giao diện Voice Output Experience.', securityDescription: 'Giữ tài khoản của bạn an toàn.'
  },
  id: {
    profile: 'Profil', settings: 'Pengaturan', appearance: 'Tampilan', security: 'Keamanan', signOut: 'Keluar', backToLibrary: 'Kembali ke perpustakaan', changePhoto: 'Ubah foto', useInitial: 'Gunakan huruf pertama saya', theme: 'Tema', themeDescription: 'Pilih tema yang Anda sukai.', language: 'Bahasa', light: 'Terang', dark: 'Gelap', system: 'Sistem', profileDescription: 'Kelola informasi pribadi dan foto profil Anda.', appearanceDescription: 'Sesuaikan tampilan Voice Output Experience.', securityDescription: 'Jaga keamanan akun Anda.'
  },
};
const authScreen = document.querySelector('#auth-screen');
const appScreen = document.querySelector('#app-screen');
const profileAvatar = document.querySelector('#profile-avatar');
const profileAvatarLetter = document.querySelector('#profile-avatar-letter');
const profileForm = document.querySelector('#profile-form');
const profileNameInput = document.querySelector('#profile-name-input');
const profileImageInput = document.querySelector('#profile-image-input');
const removeProfileImage = document.querySelector('#remove-profile-image');
const profileError = document.querySelector('#profile-error');
const profileSettings = document.querySelector('#profile-settings');
const profileFormAvatar = document.querySelector('#profile-form-avatar');
const profileFormAvatarLetter = document.querySelector('#profile-form-avatar-letter');
const profileFormName = document.querySelector('#profile-form-name');
const profileEmailInput = document.querySelector('#profile-email-input');
const workspaceBoard = document.querySelector('#workspace-board');
const authForm = document.querySelector('#auth-form');
const authError = document.querySelector('#auth-error');
const authSubmit = document.querySelector('#auth-submit');
const authHeading = document.querySelector('#auth-heading');
const authSwitchMessage = document.querySelector('#auth-switch-message');
const createAccountLink = document.querySelector('#create-account-link');
const modePills = document.querySelector('#mode-pills');
const usernameRow = document.querySelector('#username-row');
const usernameInput = document.querySelector('#username');
const confirmRow = document.querySelector('#confirm-row');
const confirmInput = document.querySelector('#confirm');
const passwordInput = document.querySelector('#password');
const passwordLabel = document.querySelector('#password-label');
const emailInput = document.querySelector('#email');
const forgotRow = document.querySelector('#forgot-row');
const backSigninRow = document.querySelector('#back-signin-row');
const userEmail = document.querySelector('#user-email');
const jobs = document.querySelector('#jobs');
const empty = document.querySelector('#empty');
const template = document.querySelector('#job-template');
const voiceForm = document.querySelector('#voice-form');
const createError = document.querySelector('#create-error');
const pdfInput = document.querySelector('#pdf');
const sourceUrl = document.querySelector('#source-url');
const loadUrl = document.querySelector('#load-url');
const notificationsPanel = document.querySelector('#notifications-panel');
const librarySearchInput = document.querySelector('#library-search');
const librarySortSelect = document.querySelector('#library-sort');
const libraryPagination = document.querySelector('#library-pagination');
const paginationSummary = document.querySelector('#pagination-summary');
const paginationPages = document.querySelector('#pagination-pages');
const pagePrev = document.querySelector('#page-prev');
const pageNext = document.querySelector('#page-next');
const countAll = document.querySelector('#count-all');
const countFavorites = document.querySelector('#count-favorites');
const textArea = document.querySelector('#text');
const textCounter = document.querySelector('#text-counter');
const tipBox = document.querySelector('#tip-box');

let mode = 'signin';
const LIBRARY_PAGE_SIZE = 8;
const FAVORITES_KEY = 'vox-favorites';
const LIBRARY_SORT_KEY = 'vox-library-sort';
const LIBRARY_VIEW_KEY = 'vox-library-view';
const TIP_DISMISSED_KEY = 'vox-tip-dismissed';
let allJobs = [];
let libraryFilter = 'all';
let librarySearch = '';
let librarySort = localStorage.getItem(LIBRARY_SORT_KEY) || 'recent';
let libraryView = localStorage.getItem(LIBRARY_VIEW_KEY) || 'list';
let libraryPage = 1;

function getFavorites() {
  try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')); } catch { return new Set(); }
}

function toggleFavorite(chunkId) {
  const favorites = getFavorites();
  if (favorites.has(chunkId)) favorites.delete(chunkId); else favorites.add(chunkId);
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites])); } catch { /* ignore */ }
  return favorites.has(chunkId);
}

function applyTheme(theme = localStorage.getItem(THEME_KEY) || 'light') {
  const useDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.body.classList.toggle('dark-theme', useDark);
  document.querySelectorAll('.theme-option').forEach((button) => {
    button.classList.toggle('selected', button.dataset.theme === theme);
    const marker = button.querySelector('span');
    if (marker) marker.textContent = button.dataset.theme === theme ? '●' : '○';
  });
  return theme;
}

function applyLanguage(language = localStorage.getItem(LANGUAGE_KEY) || 'en') {
  const supported = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'ur', 'ar', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'tr', 'vi', 'id'];
  const value = supported.includes(language) ? language : 'en';
  document.documentElement.lang = value;
  const select = document.querySelector('#language-select');
  if (select) select.value = value;
  const text = translations[value] || translations.en;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    if (element.dataset.i18n === 'changePhoto') element.childNodes[0].textContent = text.changePhoto;
    else element.textContent = text[element.dataset.i18n];
  });
  const appText = appTranslations[value] || appTranslations.en;
  document.querySelectorAll('[data-app-i18n]').forEach((element) => {
    element.textContent = appText[element.dataset.appI18n];
  });
  const backButton = document.querySelector('#close-settings');
  if (backButton) backButton.setAttribute('aria-label', text.backToLibrary);
  const visiblePanel = ['profile', 'appearance', 'security'].find((panel) => !document.querySelector(`#${panel === 'profile' ? 'profile-panel' : `${panel}-panel`}`)?.hidden);
  if (visiblePanel) {
    document.querySelector('#settings-kicker').textContent = visiblePanel === 'profile' ? text.profile : text.settings;
    document.querySelector('#settings-title').textContent = text[visiblePanel];
    document.querySelector('#settings-description').textContent = text[`${visiblePanel}Description`];
  }
  localStorage.setItem(LANGUAGE_KEY, value);
}

const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
systemTheme.addEventListener?.('change', () => {
  if (localStorage.getItem(THEME_KEY) === 'system') applyTheme('system');
});

function token() {
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders() {
  return { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' };
}

function showError(node, message, isSuccess = false) {
  node.hidden = !message;
  node.textContent = message || '';
  node.classList.toggle('form-success', isSuccess && message);
  node.classList.toggle('form-error', !isSuccess || !message);
}

function setMode(next) {
  const switched = mode !== next;
  mode = next;
  const signin = next === 'signin';
  const register = next === 'register';
  const forgot = next === 'forgot';

  document.querySelectorAll('.mode-pill').forEach((button) => {
    button.classList.toggle('on', button.dataset.mode === next);
  });

  if (modePills) modePills.hidden = forgot;
  usernameRow.classList.toggle('is-visible', register);
  usernameInput.required = register;
  confirmRow.classList.toggle('is-visible', register || forgot);
  confirmInput.required = register || forgot;
  forgotRow.hidden = !signin;
  backSigninRow.hidden = !forgot;

  if (register || forgot) {
    passwordInput.minLength = 12;
    passwordInput.placeholder = 'At least 12 characters';
    passwordLabel.textContent = forgot ? 'New password' : 'Password';
    passwordInput.autocomplete = 'new-password';
  } else {
    passwordInput.removeAttribute('minlength');
    passwordInput.placeholder = 'Enter your password';
    passwordLabel.textContent = 'Password';
    passwordInput.autocomplete = 'current-password';
    confirmInput.value = '';
  }

  authSubmit.textContent = register ? 'Create account' : forgot ? 'Reset password' : 'Login';
  authHeading.textContent = register ? 'Register' : forgot ? 'Reset your password' : 'Login';
  authSwitchMessage.textContent = register ? 'Already have an account?' : "Don't have an account?";
  createAccountLink.textContent = register ? 'Login' : 'Create account';
  showError(authError, '');

  if (switched) {
    // Keep auth tabs isolated so values from one flow don't leak into another.
    emailInput.value = '';
    usernameInput.value = '';
    passwordInput.value = '';
    confirmInput.value = '';
    passwordInput.type = 'password';
  }
}

function setActiveNav(name) {
  document.querySelectorAll('.side-nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.nav === name);
  });
}

function showLibrary() {
  profileSettings.hidden = true;
  notificationsPanel.hidden = true;
  appScreen.classList.remove('settings-open');
  workspaceBoard.hidden = false;
  setActiveNav('library');
}

function showNotifications() {
  profileSettings.hidden = true;
  appScreen.classList.remove('settings-open');
  workspaceBoard.hidden = true;
  notificationsPanel.hidden = false;
  setActiveNav('notifications');
}

function showApp(profile) {
  authScreen.hidden = true;
  appScreen.hidden = false;
  profileSettings.hidden = true;
  notificationsPanel.hidden = true;
  applyTheme();
  applyLanguage();
  workspaceBoard.hidden = false;
  setActiveNav('library');
  appScreen.classList.remove('settings-open');
  userEmail.textContent = profile.username || profile.email;
  profileNameInput.value = profile.username || '';
  profileFormName.textContent = profile.username || profile.email;
  profileEmailInput.value = profile.email || '';
  const initial = (profile.username || profile.email || 'V').trim().charAt(0).toUpperCase();
  profileAvatarLetter.textContent = initial;
  profileFormAvatarLetter.textContent = initial;
  if (profile.profileImage) {
    profileAvatar.src = profile.profileImage;
    profileAvatar.hidden = false;
    profileAvatarLetter.hidden = true;
    profileFormAvatar.src = profile.profileImage;
    profileFormAvatar.hidden = false;
    profileFormAvatarLetter.hidden = true;
  } else {
    profileAvatar.hidden = true;
    profileAvatarLetter.hidden = false;
    profileFormAvatar.hidden = true;
    profileFormAvatarLetter.hidden = false;
  }
  loadLibrary();
}

function openSettings(view = 'profile', tab = 'account') {
  workspaceBoard.hidden = true;
  notificationsPanel.hidden = true;
  profileSettings.hidden = false;
  appScreen.classList.add('settings-open');
  setActiveNav(view === 'profile' ? 'profile' : 'settings');
  document.querySelector('#settings-tabs').hidden = view !== 'settings';
  document.querySelector('#profile-panel').hidden = view !== 'profile';
  document.querySelector('#appearance-panel').hidden = view !== 'settings' || tab !== 'appearance';
  document.querySelector('#security-panel').hidden = view !== 'settings' || tab !== 'security';
  document.querySelectorAll('.settings-tab').forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
  const isProfile = view === 'profile';
  document.querySelector('#settings-kicker').textContent = isProfile ? 'Profile' : 'Settings';
  document.querySelector('#settings-title').textContent = isProfile ? 'Profile' : tab.charAt(0).toUpperCase() + tab.slice(1);
  document.querySelector('#settings-description').textContent = isProfile
    ? 'Manage your personal information and profile image.'
    : tab === 'account' ? 'Update your personal information.' : tab === 'appearance' ? 'Customize how Voice Output Experience looks and feels.' : 'Keep your account secure.';
  applyLanguage();
}

profileAvatar.addEventListener('error', () => {
  profileAvatar.hidden = true;
  profileAvatarLetter.hidden = false;
});

function showAuth() {
  localStorage.removeItem(TOKEN_KEY);
  appScreen.hidden = true;
  authScreen.hidden = false;
  setMode('signin');
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, options);
  } catch {
    throw new Error('Could not reach the server. Please try again.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    const message = typeof detail === 'string' ? detail : detail?.[0]?.msg;
    throw new Error(message || data.message || 'Request failed');
  }
  return data;
}

function statusLabel(job) {
  if (job.status === 'ready') return 'Ready · tap play';
  if (job.status === 'failed') return 'Audio generation failed';
  return 'Generating audio...';
}

function bindAudio(node, job) {
  const audio = node.querySelector('audio');
  const player = node.querySelector('.player-controls');
  const dots = node.querySelector('.dots-menu');
  const favoriteBtn = node.querySelector('.favorite-btn');
  const speed = node.querySelector('.menu-speed');
  const download = node.querySelector('.menu-download');
  const ready = job.status === 'ready' && job.audioUrl;
  const failed = job.status === 'failed';
  audio.hidden = !ready;
  player.hidden = !ready;
  // Failed jobs get no player, but still need a way to remove them from the library.
  dots.hidden = !(ready || failed);
  favoriteBtn.hidden = !ready;
  speed.hidden = !ready;
  download.hidden = !ready;
  if (!ready) return;
  audio.src = job.audioUrl;
  audio.load();
  download.href = job.audioUrl;
  audio.playbackRate = 1;
  speed.textContent = 'Speed 1x';
}

function closeAudioMenus(exceptMenu) {
  document.querySelectorAll('.audio-menu.is-open').forEach((menu) => {
    if (menu === exceptMenu) return;
    menu.classList.remove('is-open');
    menu.closest('.job')?.querySelector('.dots-btn')?.setAttribute('aria-expanded', 'false');
  });
}

async function deleteJob(chunkId) {
  if (!window.confirm('Delete this audio from your library?')) return;
  await api(`/api/chunks/${chunkId}`, { method: 'DELETE', headers: authHeaders() });
  allJobs = allJobs.filter((job) => job.chunkId !== chunkId);
  renderLibraryView();
}

function renderJob(job, index = 0) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.id = job.chunkId;
  node.querySelector('.job-icon').classList.add(`tone-${(index % 4) + 1}`);
  node.querySelector('strong').textContent = job.title || job.text || 'Untitled';
  node.querySelector('small').textContent = statusLabel(job);
  node.querySelector('small').hidden = job.status === 'ready';
  node.querySelector('.mark').hidden = job.status !== 'ready';
  bindAudio(node, job);
  const favoriteBtn = node.querySelector('.favorite-btn');
  const favorited = getFavorites().has(job.chunkId);
  favoriteBtn.setAttribute('aria-pressed', String(favorited));
  favoriteBtn.setAttribute('aria-label', favorited ? 'Remove from favorites' : 'Add to favorites');
  favoriteBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const nowFavorite = toggleFavorite(job.chunkId);
    favoriteBtn.setAttribute('aria-pressed', String(nowFavorite));
    favoriteBtn.setAttribute('aria-label', nowFavorite ? 'Remove from favorites' : 'Add to favorites');
    if (libraryFilter === 'favorites' && !nowFavorite) {
      renderLibraryView();
    } else {
      updateFilterCounts();
    }
  });
  node.querySelector('.dots-btn').addEventListener('click', (event) => {
    event.stopPropagation();
    const menu = node.querySelector('.audio-menu');
    const wasOpen = menu.classList.contains('is-open');
    closeAudioMenus();
    const isOpen = !wasOpen;
    menu.classList.toggle('is-open', isOpen);
    event.currentTarget.setAttribute('aria-expanded', String(isOpen));
    if (!isOpen) return;
    const buttonBox = event.currentTarget.getBoundingClientRect();
    const menuBox = menu.getBoundingClientRect();
    const gap = 8;
    const top = buttonBox.bottom + menuBox.height + gap <= window.innerHeight
      ? buttonBox.bottom + gap
      : buttonBox.top - menuBox.height - gap;
    const left = Math.max(12, Math.min(
      buttonBox.right - menuBox.width,
      window.innerWidth - menuBox.width - 12,
    ));
    menu.style.top = `${Math.max(12, top)}px`;
    menu.style.left = `${left}px`;
  });
  const audio = node.querySelector('audio');
  const player = node.querySelector('.player-controls');
  const playerPlay = node.querySelector('.player-play');
  const progress = node.querySelector('.player-progress');
  const time = node.querySelector('.player-time');
  const duration = node.querySelector('.player-duration');
  const playIcon = node.querySelector('.play-icon');
  const pauseIcon = node.querySelector('.pause-icon');
  const formatTime = (value) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  const syncPlayer = () => {
    playerPlay.setAttribute('aria-label', audio.paused ? 'Play audio' : 'Stop audio');
    playIcon.classList.toggle('is-hidden', !audio.paused);
    pauseIcon.classList.toggle('is-hidden', audio.paused);
    time.textContent = formatTime(audio.currentTime);
    duration.textContent = formatTime(audio.duration || 0);
    progress.value = audio.duration ? String((audio.currentTime / audio.duration) * 100) : '0';
  };
  playerPlay.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => showError(createError, 'Could not play this audio.'));
    } else {
      audio.pause();
      audio.currentTime = 0;
      syncPlayer();
    }
  });
  audio.addEventListener('loadedmetadata', syncPlayer);
  audio.addEventListener('timeupdate', syncPlayer);
  audio.addEventListener('play', syncPlayer);
  audio.addEventListener('pause', syncPlayer);
  progress.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  });
  const nowPlaying = node.querySelector('.now-playing');
  audio.addEventListener('play', () => {
    jobs.querySelectorAll('audio').forEach((other) => {
      if (other !== audio && !other.paused) other.pause();
    });
    node.classList.add('is-playing');
    nowPlaying.hidden = false;
  });
  audio.addEventListener('pause', () => {
    node.classList.remove('is-playing');
    nowPlaying.hidden = true;
  });
  syncPlayer();
  node.querySelector('.menu-speed').addEventListener('click', (event) => {
    event.stopPropagation();
    const audio = node.querySelector('audio');
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(audio.playbackRate) + 1) % speeds.length;
    audio.playbackRate = speeds[nextIndex];
    event.currentTarget.textContent = `Speed ${speeds[nextIndex]}x`;
  });
  node.querySelector('.menu-download').addEventListener('click', () => {
    node.querySelector('.audio-menu').classList.remove('is-open');
  });
  node.querySelector('.menu-delete').addEventListener('click', (event) => {
    event.stopPropagation();
    deleteJob(job.chunkId).catch((error) => showError(createError, error.message));
  });
  return node;
}

function updateFilterCounts() {
  const favorites = getFavorites();
  countAll.textContent = `(${allJobs.length})`;
  countFavorites.textContent = `(${allJobs.filter((job) => favorites.has(job.chunkId)).length})`;
}

function getFilteredJobs() {
  const favorites = getFavorites();
  const query = librarySearch.trim().toLowerCase();
  let list = allJobs.filter((job) => {
    if (libraryFilter === 'favorites' && !favorites.has(job.chunkId)) return false;
    if (!query) return true;
    return `${job.title || ''} ${job.text || ''}`.toLowerCase().includes(query);
  });
  if (librarySort === 'title') {
    list = [...list].sort((a, b) => (a.title || a.text || '').localeCompare(b.title || b.text || ''));
  }
  return list;
}

function renderLibraryView() {
  const filtered = getFilteredJobs();
  updateFilterCounts();
  empty.hidden = allJobs.length > 0;

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIBRARY_PAGE_SIZE));
  libraryPage = Math.min(Math.max(libraryPage, 1), totalPages);
  const start = (libraryPage - 1) * LIBRARY_PAGE_SIZE;
  const pageItems = filtered.slice(start, start + LIBRARY_PAGE_SIZE);

  jobs.className = `jobs${libraryView === 'grid' ? ' grid-view' : ''}`;
  jobs.innerHTML = '';
  pageItems.forEach((item, index) => jobs.append(renderJob(item, index)));

  if (allJobs.length === 0) {
    libraryPagination.hidden = true;
    return;
  }
  libraryPagination.hidden = false;
  if (filtered.length === 0) {
    paginationSummary.textContent = 'No audio matches your search or filter.';
    paginationPages.textContent = '';
    pagePrev.disabled = true;
    pageNext.disabled = true;
    return;
  }
  const rangeEnd = Math.min(start + LIBRARY_PAGE_SIZE, filtered.length);
  paginationSummary.textContent = `Showing ${start + 1}-${rangeEnd} of ${filtered.length}`;
  paginationPages.textContent = `${libraryPage} / ${totalPages}`;
  pagePrev.disabled = libraryPage <= 1;
  pageNext.disabled = libraryPage >= totalPages;
}

async function loadLibrary() {
  allJobs = await api('/api/library', { headers: authHeaders() });
  libraryPage = 1;
  renderLibraryView();
  // Legacy items can be restored asynchronously after a deployment. Keep
  // their status current until audio generation finishes.
  allJobs.filter((job) => job.status === 'queued').forEach((job) => poll(job.chunkId));
}

async function poll(id) {
  for (let i = 0; i < 60; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const job = await api(`/api/chunks/${id}`, { headers: authHeaders() });
    const jobIndex = allJobs.findIndex((item) => item.chunkId === id);
    if (jobIndex !== -1) allJobs[jobIndex] = { ...allJobs[jobIndex], ...job };
    const node = jobs.querySelector(`[data-id="${id}"]`);
    if (node) {
      node.querySelector('small').textContent = statusLabel(job);
      node.querySelector('small').hidden = job.status === 'ready';
      node.querySelector('.mark').hidden = job.status !== 'ready';
      bindAudio(node, job);
    }
    if (job.status === 'ready' || job.status === 'failed') {
      updateFilterCounts();
      if (job.status === 'failed') showError(createError, job.error || 'Could not generate audio.');
      return;
    }
  }
  showError(createError, 'Audio is still generating. Try Refresh in a moment.');
}

document.querySelectorAll('.mode-pill').forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

document.querySelector('#create-account-link').addEventListener('click', () => setMode(mode === 'register' ? 'signin' : 'register'));
document.querySelector('#forgot-link').addEventListener('click', () => setMode('forgot'));
document.querySelector('#back-signin').addEventListener('click', () => setMode('signin'));

document.querySelector('#toggle-password').addEventListener('click', () => {
  const hidden = passwordInput.type === 'password';
  passwordInput.type = hidden ? 'text' : 'password';
});

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showError(authError, '');
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (mode === 'register' && !username) {
    showError(authError, 'Username is required.');
    return;
  }

  if ((mode === 'register' || mode === 'forgot') && password !== confirmInput.value) {
    showError(authError, 'Passwords do not match.');
    return;
  }

  authSubmit.disabled = true;
  try {
    if (mode === 'forgot') {
      const result = await api('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      passwordInput.value = '';
      confirmInput.value = '';
      setMode('signin');
      showError(authError, result.message, true);
      return;
    }

    let result;
    if (mode === 'register') {
      try {
        result = await api('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
      } catch (error) {
        const message = `${error?.message || ''}`.toLowerCase();
        if (message.includes('already exists')) {
          // If the account already exists, continue with sign in.
          result = await api('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
        } else {
          throw error;
        }
      }
    } else {
      try {
        result = await api('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      } catch (error) {
        const message = `${error?.message || ''}`.toLowerCase();
        if (message.includes('no account found') || message.includes('please register')) {
          const savedEmail = email;
          setMode('register');
          emailInput.value = savedEmail;
          showError(authError, error.message);
          return;
        }
        throw error;
      }
    }

    localStorage.setItem(TOKEN_KEY, result.token);
    showApp(result);
  } catch (error) {
    showError(authError, error.message);
  } finally {
    authSubmit.disabled = false;
  }
});

document.querySelectorAll('.settings-tab').forEach((button) => {
  button.addEventListener('click', () => openSettings('settings', button.dataset.tab));
});
document.querySelector('#close-settings').addEventListener('click', showLibrary);
document.querySelectorAll('.theme-option').forEach((button) => {
  button.addEventListener('click', () => {
    localStorage.setItem(THEME_KEY, button.dataset.theme);
    applyTheme(button.dataset.theme);
  });
});
document.querySelector('#language-select').addEventListener('change', (event) => {
  applyLanguage(event.currentTarget.value);
});
document.querySelector('#password-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = document.querySelector('#password-message');
  const currentPassword = document.querySelector('#current-password').value;
  const newPassword = document.querySelector('#new-password').value;
  const confirmNewPassword = document.querySelector('#confirm-new-password').value;
  if (newPassword !== confirmNewPassword) {
    showError(message, 'New passwords do not match.');
    return;
  }
  try {
    const result = await api('/api/password', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    event.currentTarget.reset();
    showError(message, result.message, true);
  } catch (error) {
    showError(message, error.message);
  }
});
profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  profileError.hidden = true;
  const body = new FormData();
  body.append('name', profileNameInput.value.trim());
  body.append('remove_image', String(removeProfileImage.checked));
  if (profileImageInput.files[0]) body.append('image', profileImageInput.files[0]);
  try {
    const profile = await api('/api/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}` },
      body,
    });
    showApp(profile);
    showLibrary();
  } catch (error) {
    profileError.textContent = error.message;
    profileError.hidden = false;
  }
});
document.addEventListener('click', () => {
  closeAudioMenus();
});
jobs.addEventListener('scroll', () => closeAudioMenus(), { passive: true });
document.querySelector('#refresh').addEventListener('click', () => {
  loadLibrary().catch((error) => showError(createError, error.message));
});

document.querySelector('#nav-library').addEventListener('click', showLibrary);
document.querySelector('#nav-profile').addEventListener('click', () => {
  openSettings('profile');
  profileNameInput.value = profileFormName.textContent;
  removeProfileImage.checked = false;
  profileError.hidden = true;
});
document.querySelector('#nav-settings').addEventListener('click', () => openSettings('settings', 'appearance'));
document.querySelector('#nav-notifications').addEventListener('click', showNotifications);
document.querySelector('#close-notifications').addEventListener('click', showLibrary);
document.querySelector('#sidebar-sign-out').addEventListener('click', showAuth);

librarySearchInput.addEventListener('input', (event) => {
  librarySearch = event.currentTarget.value;
  libraryPage = 1;
  renderLibraryView();
});

document.querySelectorAll('.filter-pills .pill').forEach((button) => {
  button.addEventListener('click', () => {
    libraryFilter = button.dataset.filter;
    document.querySelectorAll('.filter-pills .pill').forEach((pill) => pill.classList.toggle('active', pill === button));
    libraryPage = 1;
    renderLibraryView();
  });
});

librarySortSelect.value = librarySort;
librarySortSelect.addEventListener('change', (event) => {
  librarySort = event.currentTarget.value;
  try { localStorage.setItem(LIBRARY_SORT_KEY, librarySort); } catch { /* ignore */ }
  renderLibraryView();
});

document.querySelectorAll('.view-toggle .view-btn').forEach((button) => {
  button.classList.toggle('active', button.dataset.view === libraryView);
  button.addEventListener('click', () => {
    libraryView = button.dataset.view;
    try { localStorage.setItem(LIBRARY_VIEW_KEY, libraryView); } catch { /* ignore */ }
    document.querySelectorAll('.view-toggle .view-btn').forEach((btn) => btn.classList.toggle('active', btn === button));
    renderLibraryView();
  });
});

pagePrev.addEventListener('click', () => {
  libraryPage -= 1;
  renderLibraryView();
});
pageNext.addEventListener('click', () => {
  libraryPage += 1;
  renderLibraryView();
});

function updateTextCounter() {
  textCounter.textContent = `${textArea.value.length} / ${textArea.maxLength}`;
}
textArea.addEventListener('input', updateTextCounter);
updateTextCounter();

if (tipBox && localStorage.getItem(TIP_DISMISSED_KEY) === '1') tipBox.hidden = true;
document.querySelector('#tip-dismiss')?.addEventListener('click', () => {
  tipBox.hidden = true;
  try { localStorage.setItem(TIP_DISMISSED_KEY, '1'); } catch { /* ignore */ }
});

voiceForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showError(createError, '');
  const button = voiceForm.querySelector('button[type="submit"]');
  let text = document.querySelector('#text').value.trim();
  let title = document.querySelector('#title').value.trim();
  const voice = document.querySelector('#voice').value;
  const url = sourceUrl.value.trim();
  if (!text && !url) {
    showError(createError, 'Paste text or enter a webpage URL.');
    return;
  }
  button.disabled = true;
  try {
    // Convert supports a URL directly; users no longer have to remember to
    // press "Use URL" before pressing "Convert to voice".
    if (!text && url) {
      const extracted = await api('/api/extract-url', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ url }),
      });
      text = extracted.text || '';
      title ||= extracted.title || '';
      if (!text) throw new Error('Could not extract readable text from this URL.');
      document.querySelector('#text').value = text;
      document.querySelector('#title').value = title;
      updateTextCounter();
    }
    const job = await api('/api/chunks', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text, title, voice, sourceUrl: url }),
    });
    allJobs.unshift({ ...job, title: job.title || title || text, text, sourceUrl: url });
    libraryFilter = 'all';
    document.querySelectorAll('.filter-pills .pill').forEach((pill) => pill.classList.toggle('active', pill.dataset.filter === 'all'));
    librarySearch = '';
    librarySearchInput.value = '';
    libraryPage = 1;
    renderLibraryView();
    document.querySelector('#text').value = '';
    document.querySelector('#title').value = '';
    updateTextCounter();
    if (job.status !== 'ready') poll(job.chunkId);
  } catch (error) {
    showError(createError, error.message);
  } finally {
    button.disabled = false;
  }
});

pdfInput.addEventListener('change', async () => {
  const file = pdfInput.files[0];
  pdfInput.value = '';
  if (!file) return;
  showError(createError, '');
  try {
    const body = new FormData();
    body.append('file', file);
    const result = await api('/api/extract-text', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body,
    });
    document.querySelector('#title').value ||= result.title || file.name.replace(/\.[^.]+$/, '');
    document.querySelector('#text').value = result.text || '';
  } catch (error) {
    showError(createError, error.message);
  }
});

loadUrl.addEventListener('click', async () => {
  const url = sourceUrl.value.trim();
  if (!url) return;
  showError(createError, '');
  loadUrl.disabled = true;
  try {
    const result = await api('/api/extract-url', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ url }),
    });
    document.querySelector('#title').value ||= result.title || '';
    document.querySelector('#text').value = result.text || '';
  } catch (error) {
    showError(createError, error.message);
  } finally {
    loadUrl.disabled = false;
  }
});

async function boot() {
  if (!token()) return;
  try {
    const me = await api('/api/me', { headers: authHeaders() });
    showApp(me);
  } catch {
    showAuth();
  }
}

boot();
applyTheme();
applyLanguage();
setMode('signin');
