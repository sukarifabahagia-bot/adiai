import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: apiKey! });

const modelName = "gemini-3-flash-preview";

export const generateMateri = async (subject: string, subSubject: string | null, bab: string) => {
  const model = genAI.models.generateContent({
    model: modelName,
    contents: `Buatlah materi pelajaran yang lengkap dan komprehensif untuk mata pelajaran ${subject}${subSubject ? ` (${subSubject})` : ''} Bab: ${bab}. 
    Susun penjelasannya dengan struktur yang baik (Pendahuluan, Isi Materi dengan poin-poin, Kesimpulan). 
    Gunakan format Markdown. Berikan juga deskripsi gambar yang mendukung materi tersebut di tempat yang sesuai.`,
  });
  const response = await model;
  return response.text;
};

export const generateModulAjar = async (identitas: any, cp: string, tp: string) => {
  const model = genAI.models.generateContent({
    model: modelName,
    contents: `Buatlah Modul Ajar Kurikulum Merdeka berdasarkan data berikut:
    Identitas: ${JSON.stringify(identitas)}
    Capaian Pembelajaran (CP): ${cp}
    Tujuan Pembelajaran (TP): ${tp}
    
    Struktur Modul:
    1. Identitas (Nama, Sekolah, Fase/Kelas, Mapel, Alokasi Waktu)
    2. Profil Pelajar Pancasila (Dimensi: Keimanan, Kewargaan, Penalaran Kritis, Kreativitas, Kolaborasi, Kemandirian, Kesehatan, Komunikasi)
    3. Langkah Pembelajaran (Pendahuluan, Inti, Penutup)
    4. Media & Sumber Belajar
    
    Gunakan format Markdown yang rapi.`,
  });
  const response = await model;
  return response.text;
};

export const generateAsesmen = async (config: {
  subject: string,
  subSubject?: string,
  type: 'formatif' | 'sumatif',
  level: string,
  format: 'pilihan_ganda' | 'menjodohkan' | 'isian',
  count: number,
  optionsCount?: number
}) => {
  const prompt = `Buatlah soal asesmen ${config.type} untuk mata pelajaran ${config.subject}${config.subSubject ? ` (${config.subSubject})` : ''}.
  Level Taksonomi Bloom: ${config.level}.
  Format: ${config.format}.
  Jumlah soal: ${config.count}.
  ${config.format === 'pilihan_ganda' ? `Setiap soal memiliki ${config.optionsCount} pilihan jawaban.` : ''}
  
  Berikan output dalam format JSON dengan struktur:
  {
    "questions": [
      {
        "id": number,
        "question": "string",
        "options": ["string"] (jika pilihan ganda),
        "answer": "string" (kunci jawaban),
        "pairs": [{"left": "string", "right": "string"}] (jika menjodohkan)
      }
    ]
  }
  Hanya berikan JSON saja.`;

  const model = genAI.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });
  const response = await model;
  return JSON.parse(response.text);
};
