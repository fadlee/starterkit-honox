import { getCourses, createCourse, createTopic, createLesson } from './lms-storage';

export function seedDummyData(): void {
  const existing = getCourses();
  if (existing.length > 0) return;

  // ===== Course 1: Belajar Tajwid Al-Quran =====
  const course1 = createCourse({
    title: 'Belajar Tajwid Al-Quran',
    slug: 'belajar-tajwid-al-quran',
    description: 'Pelajari ilmu tajwid dari dasar hingga mahir. Kursus ini mencakup hukum nun mati dan tanwin, hukum mim mati, mad, dan berbagai kaidah tajwid lainnya untuk membaca Al-Quran dengan benar dan fasih.',
    difficultyLevel: 'beginner',
    visibility: 'public',
    featuredImage: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80',
    pricingModel: 'free',
    categories: ['Tajwid', 'Alquran'],
    tags: ['tajwid', 'quran', 'pemula', 'belajar-quran'],
    author: 'Ustadz Ahmad',
    isScheduled: false,
    scheduleDate: '',
    isPublicCourse: true,
    maxStudents: 100,
    certificate: true,
    status: 'published',
  });

  // Topic 1: Pengenalan Tajwid
  const t1_1 = createTopic({ courseId: course1.id, title: 'Pengenalan Ilmu Tajwid', order: 0 });

  createLesson({
    topicId: t1_1.id,
    courseId: course1.id,
    title: 'Apa Itu Ilmu Tajwid?',
    content: '<h2>Pengertian Ilmu Tajwid</h2><p>Tajwid secara bahasa berarti memperbaiki atau membaguskan. Secara istilah, tajwid adalah ilmu yang mempelajari cara membaca Al-Quran dengan benar sesuai kaidah yang telah ditetapkan.</p><p>Hukum mempelajari ilmu tajwid adalah <strong>fardhu kifayah</strong>, sedangkan mengamalkannya ketika membaca Al-Quran adalah <strong>fardhu ain</strong>.</p>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=iBWqLsGPNJo',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 12,
    videoPlaybackSeconds: 30,
    exerciseFiles: [],
    isPreview: true,
    previewType: 'free',
    order: 0,
    slug: 'apa-itu-ilmu-tajwid',
  });

  createLesson({
    topicId: t1_1.id,
    courseId: course1.id,
    title: 'Makharijul Huruf (Tempat Keluarnya Huruf)',
    content: '<h2>Makharijul Huruf</h2><p>Makharijul huruf adalah tempat-tempat keluarnya huruf hijaiyah. Terdapat 5 tempat utama keluarnya huruf:</p><ol><li><strong>Al-Jauf</strong> (rongga mulut)</li><li><strong>Al-Halq</strong> (tenggorokan)</li><li><strong>Al-Lisan</strong> (lidah)</li><li><strong>Asy-Syafatain</strong> (dua bibir)</li><li><strong>Al-Khaisyum</strong> (pangkal hidung)</li></ol>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=R0hLA10MbKg',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 15,
    videoPlaybackSeconds: 45,
    exerciseFiles: [],
    isPreview: true,
    previewType: 'free',
    order: 1,
    slug: 'makharijul-huruf',
  });

  // Topic 2: Hukum Nun Mati & Tanwin
  const t1_2 = createTopic({ courseId: course1.id, title: 'Hukum Nun Mati dan Tanwin', order: 1 });

  createLesson({
    topicId: t1_2.id,
    courseId: course1.id,
    title: 'Izhar Halqi',
    content: '<h2>Izhar Halqi</h2><p>Izhar artinya jelas. Izhar Halqi terjadi ketika nun mati atau tanwin bertemu dengan salah satu huruf halqi (tenggorokan):</p><p><strong>ء هـ ع ح غ خ</strong></p><p>Cara membacanya: nun mati/tanwin dibaca jelas tanpa dengung.</p>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=pEeXz_CFxYc',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 10,
    videoPlaybackSeconds: 20,
    exerciseFiles: [],
    isPreview: false,
    previewType: 'free',
    order: 0,
    slug: 'izhar-halqi',
  });

  createLesson({
    topicId: t1_2.id,
    courseId: course1.id,
    title: 'Idgham Bighunnah dan Bilaghunnah',
    content: '<h2>Idgham</h2><p>Idgham artinya memasukkan. Terbagi dua:</p><ul><li><strong>Idgham Bighunnah</strong>: nun mati/tanwin bertemu huruf <em>يـ نـ مـ و</em> — dibaca lebur dengan dengung.</li><li><strong>Idgham Bilaghunnah</strong>: nun mati/tanwin bertemu huruf <em>لـ ر</em> — dibaca lebur tanpa dengung.</li></ul>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=SjKJsqmqFYU',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 14,
    videoPlaybackSeconds: 10,
    exerciseFiles: [],
    isPreview: false,
    previewType: 'free',
    order: 1,
    slug: 'idgham-bighunnah-dan-bilaghunnah',
  });

  createLesson({
    topicId: t1_2.id,
    courseId: course1.id,
    title: 'Ikhfa Haqiqi',
    content: '<h2>Ikhfa Haqiqi</h2><p>Ikhfa artinya menyamarkan. Terjadi ketika nun mati atau tanwin bertemu dengan 15 huruf ikhfa. Cara membacanya: antara izhar dan idgham, dengan dengung.</p><p>15 huruf ikhfa: <strong>ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك</strong></p>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=iMz6MjOFSvU',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 11,
    videoPlaybackSeconds: 55,
    exerciseFiles: [],
    isPreview: false,
    previewType: 'free',
    order: 2,
    slug: 'ikhfa-haqiqi',
  });

  // Topic 3: Hukum Mad
  const t1_3 = createTopic({ courseId: course1.id, title: 'Hukum Mad', order: 2 });

  createLesson({
    topicId: t1_3.id,
    courseId: course1.id,
    title: 'Mad Thabi\'i (Mad Asli)',
    content: '<h2>Mad Thabi\'i</h2><p>Mad Thabi\'i adalah mad dasar yang panjangnya 2 harakat. Terjadi ketika:</p><ul><li>Huruf berharakat fathah diikuti alif</li><li>Huruf berharakat kasrah diikuti ya sukun</li><li>Huruf berharakat dhammah diikuti waw sukun</li></ul>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=cLPK-JN_sWo',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 9,
    videoPlaybackSeconds: 40,
    exerciseFiles: [],
    isPreview: false,
    previewType: 'free',
    order: 0,
    slug: 'mad-thabi-i',
  });

  createLesson({
    topicId: t1_3.id,
    courseId: course1.id,
    title: 'Mad Wajib Muttashil dan Mad Jaiz Munfashil',
    content: '<h2>Mad Far\'i</h2><p><strong>Mad Wajib Muttashil</strong>: huruf mad bertemu hamzah dalam satu kata — wajib dipanjangkan 4-5 harakat.</p><p><strong>Mad Jaiz Munfashil</strong>: huruf mad di akhir kata bertemu hamzah di awal kata berikutnya — boleh dipanjangkan 2-5 harakat.</p>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=QS8RNbfOGrk',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 13,
    videoPlaybackSeconds: 15,
    exerciseFiles: [],
    isPreview: false,
    previewType: 'free',
    order: 1,
    slug: 'mad-wajib-muttashil-dan-mad-jaiz-munfashil',
  });

  // ===== Course 2: Pengantar Fiqih Islam =====
  const course2 = createCourse({
    title: 'Pengantar Fiqih Islam',
    slug: 'pengantar-fiqih-islam',
    description: 'Kursus komprehensif tentang dasar-dasar fiqih Islam meliputi thaharah (bersuci), shalat, dan puasa. Disusun secara sistematis untuk memudahkan pemahaman bagi pelajar tingkat menengah.',
    difficultyLevel: 'intermediate',
    visibility: 'public',
    featuredImage: 'https://images.unsplash.com/photo-1585036156171-384164a8c956?w=800&q=80',
    pricingModel: 'free',
    categories: ['Fiqih', 'Ushul Fiqih'],
    tags: ['fiqih', 'ibadah', 'shalat', 'thaharah', 'puasa'],
    author: 'Ustadzah Fatimah',
    isScheduled: false,
    scheduleDate: '',
    isPublicCourse: true,
    maxStudents: 80,
    certificate: true,
    status: 'published',
  });

  // Topic 1: Thaharah
  const t2_1 = createTopic({ courseId: course2.id, title: 'Bab Thaharah (Bersuci)', order: 0 });

  createLesson({
    topicId: t2_1.id,
    courseId: course2.id,
    title: 'Pengertian dan Macam-Macam Thaharah',
    content: '<h2>Thaharah</h2><p>Thaharah secara bahasa berarti bersih/suci. Secara istilah, thaharah adalah menghilangkan hadats dan najis. Thaharah terbagi menjadi:</p><ul><li><strong>Thaharah dari hadats</strong>: wudhu, mandi, tayammum</li><li><strong>Thaharah dari najis</strong>: membersihkan najis dari badan, pakaian, dan tempat</li></ul>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=s8GBf0XEhBQ',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 18,
    videoPlaybackSeconds: 30,
    exerciseFiles: [],
    isPreview: true,
    previewType: 'free',
    order: 0,
    slug: 'pengertian-dan-macam-macam-thaharah',
  });

  createLesson({
    topicId: t2_1.id,
    courseId: course2.id,
    title: 'Tata Cara Wudhu yang Benar',
    content: '<h2>Rukun Wudhu</h2><p>Rukun wudhu ada 6:</p><ol><li>Niat</li><li>Membasuh wajah</li><li>Membasuh kedua tangan sampai siku</li><li>Mengusap sebagian kepala</li><li>Membasuh kedua kaki sampai mata kaki</li><li>Tertib (berurutan)</li></ol><p>Sunnah wudhu antara lain: membaca basmalah, bersiwak, membasuh tiga kali, dan mendahulukan anggota kanan.</p>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=mOjFBLSCJaI',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 12,
    videoPlaybackSeconds: 45,
    exerciseFiles: [],
    isPreview: true,
    previewType: 'free',
    order: 1,
    slug: 'tata-cara-wudhu-yang-benar',
  });

  // Topic 2: Shalat
  const t2_2 = createTopic({ courseId: course2.id, title: 'Bab Shalat', order: 1 });

  createLesson({
    topicId: t2_2.id,
    courseId: course2.id,
    title: 'Syarat dan Rukun Shalat',
    content: '<h2>Syarat Shalat</h2><p>Syarat wajib shalat: Islam, baligh, berakal, suci dari haidh/nifas. Syarat sah shalat: suci dari hadats, suci dari najis, menutup aurat, menghadap kiblat, masuk waktu.</p><h2>Rukun Shalat</h2><p>Rukun shalat ada 13, dimulai dari niat, takbiratul ihram, berdiri bagi yang mampu, membaca Al-Fatihah, hingga salam.</p>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=T4gNl9oUxNE',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 20,
    videoPlaybackSeconds: 10,
    exerciseFiles: [],
    isPreview: false,
    previewType: 'free',
    order: 0,
    slug: 'syarat-dan-rukun-shalat',
  });

  createLesson({
    topicId: t2_2.id,
    courseId: course2.id,
    title: 'Shalat Lima Waktu dan Waktunya',
    content: '<h2>Waktu Shalat Lima Waktu</h2><ul><li><strong>Subuh</strong>: dari terbit fajar shadiq hingga terbit matahari</li><li><strong>Dzuhur</strong>: dari tergelincirnya matahari hingga bayangan sama panjang</li><li><strong>Ashar</strong>: setelah waktu dzuhur hingga matahari menguning</li><li><strong>Maghrib</strong>: dari terbenam matahari hingga hilangnya mega merah</li><li><strong>Isya</strong>: dari hilangnya mega merah hingga pertengahan malam</li></ul>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=MxKLhUGWbwo',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 15,
    videoPlaybackSeconds: 30,
    exerciseFiles: [],
    isPreview: false,
    previewType: 'free',
    order: 1,
    slug: 'shalat-lima-waktu-dan-waktunya',
  });

  createLesson({
    topicId: t2_2.id,
    courseId: course2.id,
    title: 'Hal-Hal yang Membatalkan Shalat',
    content: '<h2>Pembatal Shalat</h2><p>Hal-hal yang membatalkan shalat antara lain:</p><ol><li>Berbicara dengan sengaja</li><li>Makan dan minum dengan sengaja</li><li>Bergerak banyak yang bukan gerakan shalat</li><li>Batal wudhunya</li><li>Terbuka auratnya</li><li>Membelakangi kiblat</li><li>Tertawa terbahak-bahak</li></ol>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=QnGPKEHTEmE',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 10,
    videoPlaybackSeconds: 50,
    exerciseFiles: [],
    isPreview: false,
    previewType: 'free',
    order: 2,
    slug: 'hal-hal-yang-membatalkan-shalat',
  });

  // Topic 3: Puasa
  const t2_3 = createTopic({ courseId: course2.id, title: 'Bab Puasa', order: 2 });

  createLesson({
    topicId: t2_3.id,
    courseId: course2.id,
    title: 'Rukun dan Syarat Puasa Ramadhan',
    content: '<h2>Puasa Ramadhan</h2><p>Puasa Ramadhan hukumnya <strong>fardhu ain</strong> bagi setiap muslim yang baligh, berakal, dan mampu.</p><h2>Rukun Puasa</h2><ol><li>Niat di malam hari</li><li>Menahan diri dari makan, minum, dan hal yang membatalkan dari terbit fajar hingga terbenam matahari</li></ol><p>Hikmah puasa: melatih kesabaran, meningkatkan ketakwaan, dan merasakan penderitaan orang yang tidak mampu.</p>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=gOjS3ykVa8o',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 16,
    videoPlaybackSeconds: 20,
    exerciseFiles: [],
    isPreview: false,
    previewType: 'free',
    order: 0,
    slug: 'rukun-dan-syarat-puasa-ramadhan',
  });

  console.log('✅ Seed data berhasil ditambahkan: 2 courses dengan total 15 lessons');
}
