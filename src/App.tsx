import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  ClipboardCheck, 
  BarChart3, 
  ChevronRight, 
  Search, 
  Menu, 
  X,
  GraduationCap,
  Leaf,
  Calculator,
  Languages,
  Palette,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  School,
  BrainCircuit,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { generateMateri, generateModulAjar, generateAsesmen } from './services/gemini';
import { Subject, Religion, IdentitasModul, AssessmentResult } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SUBJECTS: Subject[] = [
  'Pendidikan Agama',
  'PPKn',
  'Bahasa Indonesia',
  'Matematika',
  'Seni Budaya',
  'PLH',
  'Bahasa Inggris'
];

const RELIGIONS: Religion[] = [
  'Islam',
  'Kristen',
  'Katolik',
  'Hindu',
  'Buddha',
  'Khonghucu'
];

const BLOOM_LEVELS = [
  'C1 - Mengingat',
  'C2 - Memahami',
  'C3 - Menerapkan',
  'C4 - Menganalisis',
  'C5 - Mengevaluasi',
  'C6 - Menciptakan'
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'materi' | 'administrasi' | 'asesmen' | 'nilai'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Materi State
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Bahasa Indonesia');
  const [selectedReligion, setSelectedReligion] = useState<Religion>('Islam');
  const [bab, setBab] = useState('');
  const [materiContent, setMateriContent] = useState('');
  const [isLoadingMateri, setIsLoadingMateri] = useState(false);

  // Administrasi State
  const [identitas, setIdentitas] = useState<IdentitasModul>({
    namaPenyusun: '',
    satuanPendidikan: '',
    fase: 'A',
    kelas: '1',
    mataPelajaran: 'Bahasa Indonesia',
    alokasiWaktu: ''
  });
  const [cp, setCp] = useState('');
  const [tp, setTp] = useState('');
  const [modulContent, setModulContent] = useState('');
  const [isLoadingModul, setIsLoadingModul] = useState(false);

  // Asesmen State
  const [asesmenConfig, setAsesmenConfig] = useState({
    type: 'formatif' as 'formatif' | 'sumatif',
    level: BLOOM_LEVELS[1],
    format: 'pilihan_ganda' as 'pilihan_ganda' | 'menjodohkan' | 'isian',
    count: 10,
    optionsCount: 4
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [isLoadingAsesmen, setIsLoadingAsesmen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  // Nilai State
  const [results, setResults] = useState<AssessmentResult[]>([]);

  useEffect(() => {
    const savedResults = localStorage.getItem('adiai_results');
    if (savedResults) setResults(JSON.parse(savedResults));
  }, []);

  const saveResult = (result: AssessmentResult) => {
    const newResults = [result, ...results];
    setResults(newResults);
    localStorage.setItem('adiai_results', JSON.stringify(newResults));
  };

  const handleGenerateMateri = async () => {
    if (!bab) return;
    setIsLoadingMateri(true);
    try {
      const content = await generateMateri(selectedSubject, selectedSubject === 'Pendidikan Agama' ? selectedReligion : null, bab);
      setMateriContent(content || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMateri(false);
    }
  };

  const handleGenerateModul = async () => {
    if (!cp || !tp) return;
    setIsLoadingModul(true);
    try {
      const content = await generateModulAjar(identitas, cp, tp);
      setModulContent(content || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingModul(false);
    }
  };

  const handleGenerateAsesmen = async () => {
    setIsLoadingAsesmen(true);
    setIsQuizSubmitted(false);
    setUserAnswers({});
    try {
      const data = await generateAsesmen({
        subject: selectedSubject,
        subSubject: selectedSubject === 'Pendidikan Agama' ? selectedReligion : undefined,
        ...asesmenConfig
      });
      setGeneratedQuestions(data.questions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingAsesmen(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    generatedQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) correct++;
    });
    const score = Math.round((correct / generatedQuestions.length) * 100);
    
    if (studentName) {
      saveResult({
        id: Date.now().toString(),
        studentName,
        subject: selectedSubject,
        score,
        totalQuestions: generatedQuestions.length,
        date: new Date().toLocaleDateString('id-ID'),
        type: asesmenConfig.type
      });
    }
    setIsQuizSubmitted(true);
  };

  const renderHome = () => (
    <div className="space-y-12">
      <section className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src="https://picsum.photos/seed/education-natural/1200/600" 
          alt="Education" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-transparent flex items-center p-12">
          <div className="max-w-xl text-white space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-bold leading-tight"
            >
              AdiAI
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl opacity-90"
            >
              Asisten Digital Administrasi Guru Indonesia. Cerdas, Efisien, dan Terintegrasi.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setActiveTab('materi')}
              className="bg-white text-emerald-900 px-8 py-4 rounded-full font-semibold hover:bg-emerald-50 transition-colors shadow-lg flex items-center gap-2"
            >
              Mulai Sekarang <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: 'materi', title: 'Materi Pelajaran', icon: BookOpen, color: 'bg-blue-50 text-blue-600', desc: 'Penjabaran materi komprehensif dengan dukungan AI.' },
          { id: 'administrasi', title: 'Administrasi Guru', icon: FileText, color: 'bg-emerald-50 text-emerald-600', desc: 'Otomasi CP, TP, dan Modul Ajar Kurikulum Merdeka.' },
          { id: 'asesmen', title: 'Fitur Asesmen', icon: ClipboardCheck, color: 'bg-orange-50 text-orange-600', desc: 'Generate soal formatif & sumatif secara instan.' },
          { id: 'nilai', title: 'Rekap Nilai', icon: BarChart3, color: 'bg-purple-50 text-purple-600', desc: 'Pantau perkembangan belajar siswa dengan mudah.' },
        ].map((feature) => (
          <motion.div 
            key={feature.id}
            whileHover={{ y: -5 }}
            onClick={() => setActiveTab(feature.id as any)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", feature.color)}>
              <feature.icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-500 text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderMateri = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="text-emerald-600" />
          <h2 className="text-2xl font-bold">Materi Pelajaran</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Pilih Mata Pelajaran</label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as Subject)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {selectedSubject === 'Pendidikan Agama' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Pilih Agama</label>
              <select 
                value={selectedReligion}
                onChange={(e) => setSelectedReligion(e.target.value as Religion)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Bab / Topik Pembahasan</label>
            <input 
              type="text"
              value={bab}
              onChange={(e) => setBab(e.target.value)}
              placeholder="Contoh: Ekosistem, Bangun Datar, Teks Prosedur..."
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <button 
          onClick={handleGenerateMateri}
          disabled={isLoadingMateri || !bab}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-100"
        >
          {isLoadingMateri ? 'Menyusun Materi...' : 'Generate Materi'}
        </button>
      </div>

      {materiContent && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 prose prose-emerald max-w-none"
        >
          <Markdown>{materiContent}</Markdown>
        </motion.div>
      )}
    </div>
  );

  const renderAdministrasi = () => (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
        <div className="flex items-center gap-3">
          <FileText className="text-emerald-600" />
          <h2 className="text-2xl font-bold">Administrasi Guru (Modul Ajar)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Nama Penyusun</label>
            <input 
              type="text"
              value={identitas.namaPenyusun}
              onChange={(e) => setIdentitas({...identitas, namaPenyusun: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Satuan Pendidikan</label>
            <input 
              type="text"
              value={identitas.satuanPendidikan}
              onChange={(e) => setIdentitas({...identitas, satuanPendidikan: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Fase / Kelas</label>
            <div className="flex gap-2">
              <select 
                value={identitas.fase}
                onChange={(e) => setIdentitas({...identitas, fase: e.target.value})}
                className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {['A', 'B', 'C', 'D', 'E', 'F'].map(f => <option key={f} value={f}>Fase {f}</option>)}
              </select>
              <input 
                type="number"
                value={identitas.kelas}
                onChange={(e) => setIdentitas({...identitas, kelas: e.target.value})}
                className="w-20 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Mata Pelajaran</label>
            <select 
              value={identitas.mataPelajaran}
              onChange={(e) => setIdentitas({...identitas, mataPelajaran: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Alokasi Waktu</label>
            <input 
              type="text"
              value={identitas.alokasiWaktu}
              onChange={(e) => setIdentitas({...identitas, alokasiWaktu: e.target.value})}
              placeholder="Contoh: 2 x 35 Menit"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Capaian Pembelajaran (CP)</label>
            <textarea 
              rows={4}
              value={cp}
              onChange={(e) => setCp(e.target.value)}
              placeholder="Masukkan CP yang ingin dicapai..."
              className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Tujuan Pembelajaran (TP)</label>
            <textarea 
              rows={4}
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              placeholder="Masukkan TP atau ATP..."
              className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>
        </div>

        <button 
          onClick={handleGenerateModul}
          disabled={isLoadingModul || !cp || !tp}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg"
        >
          {isLoadingModul ? 'Menyusun Modul Ajar...' : 'Generate Modul Ajar'}
        </button>
      </div>

      {modulContent && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 prose prose-emerald max-w-none"
        >
          <Markdown>{modulContent}</Markdown>
        </motion.div>
      )}
    </div>
  );

  const renderAsesmen = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="text-emerald-600" />
          <h2 className="text-2xl font-bold">Fitur Asesmen</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Jenis Asesmen</label>
            <div className="flex gap-2">
              {['formatif', 'sumatif'].map(t => (
                <button
                  key={t}
                  onClick={() => setAsesmenConfig({...asesmenConfig, type: t as any})}
                  className={cn(
                    "flex-1 py-2 rounded-xl border transition-all capitalize",
                    asesmenConfig.type === t ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Level Taksonomi</label>
            <select 
              value={asesmenConfig.level}
              onChange={(e) => setAsesmenConfig({...asesmenConfig, level: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {BLOOM_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Format Soal</label>
            <select 
              value={asesmenConfig.format}
              onChange={(e) => setAsesmenConfig({...asesmenConfig, format: e.target.value as any})}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="pilihan_ganda">Pilihan Ganda</option>
              <option value="menjodohkan">Menjodohkan</option>
              <option value="isian">Isian</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Jumlah Soal</label>
            <select 
              value={asesmenConfig.count}
              onChange={(e) => setAsesmenConfig({...asesmenConfig, count: parseInt(e.target.value)})}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {[10, 15, 20, 25].map(c => <option key={c} value={c}>{c} Soal</option>)}
            </select>
          </div>

          {asesmenConfig.format === 'pilihan_ganda' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Jumlah Pilihan</label>
              <select 
                value={asesmenConfig.optionsCount}
                onChange={(e) => setAsesmenConfig({...asesmenConfig, optionsCount: parseInt(e.target.value)})}
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value={3}>3 Jawaban (A, B, C)</option>
                <option value={4}>4 Jawaban (A, B, C, D)</option>
              </select>
            </div>
          )}
        </div>

        <button 
          onClick={handleGenerateAsesmen}
          disabled={isLoadingAsesmen}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg"
        >
          {isLoadingAsesmen ? 'Menyusun Soal...' : 'Generate Soal Asesmen'}
        </button>
      </div>

      {generatedQuestions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
            <h3 className="text-xl font-bold">Lembar Kerja Siswa</h3>
            <input 
              type="text"
              placeholder="Nama Siswa..."
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="p-2 border-b border-gray-300 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-8">
            {generatedQuestions.map((q, idx) => (
              <div key={idx} className="space-y-4">
                <p className="font-medium text-gray-900">{idx + 1}. {q.question}</p>
                
                {asesmenConfig.format === 'pilihan_ganda' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options?.map((opt: string, optIdx: number) => (
                      <button
                        key={optIdx}
                        onClick={() => !isQuizSubmitted && setUserAnswers({...userAnswers, [idx]: opt})}
                        className={cn(
                          "text-left p-3 rounded-xl border transition-all",
                          userAnswers[idx] === opt ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-gray-100 hover:border-emerald-200",
                          isQuizSubmitted && opt === q.answer && "bg-green-100 border-green-500",
                          isQuizSubmitted && userAnswers[idx] === opt && opt !== q.answer && "bg-red-100 border-red-500"
                        )}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </button>
                    ))}
                  </div>
                )}

                {asesmenConfig.format === 'isian' && (
                  <input 
                    type="text"
                    disabled={isQuizSubmitted}
                    value={userAnswers[idx] || ''}
                    onChange={(e) => setUserAnswers({...userAnswers, [idx]: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ketik jawaban di sini..."
                  />
                )}

                {asesmenConfig.format === 'menjodohkan' && (
                   <div className="space-y-2">
                      {q.pairs?.map((pair: any, pIdx: number) => (
                        <div key={pIdx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                          <span className="flex-1 font-medium">{pair.left}</span>
                          <ChevronRight className="text-gray-400" />
                          <input 
                            type="text"
                            disabled={isQuizSubmitted}
                            placeholder="Pasangan..."
                            className="flex-1 p-2 rounded-lg border border-gray-200 outline-none"
                            onChange={(e) => setUserAnswers({...userAnswers, [`${idx}-${pIdx}`]: e.target.value})}
                          />
                        </div>
                      ))}
                   </div>
                )}
              </div>
            ))}
          </div>

          {!isQuizSubmitted ? (
            <button 
              onClick={calculateScore}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 shadow-lg"
            >
              Selesai & Kumpulkan
            </button>
          ) : (
            <div className="p-6 bg-emerald-50 rounded-2xl text-center space-y-2">
              <p className="text-emerald-800 font-bold text-2xl">Skor Anda: {Math.round((Object.values(userAnswers).filter((v, i) => v === generatedQuestions[i]?.answer).length / generatedQuestions.length) * 100)}</p>
              <p className="text-emerald-600">Jawaban Anda telah direkam di sistem.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );

  const renderNilai = () => (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-emerald-600" />
            <h2 className="text-2xl font-bold">Rekap Nilai Siswa</h2>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('adiai_results');
              setResults([]);
            }}
            className="text-red-500 text-sm hover:underline"
          >
            Hapus Semua Data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 font-semibold text-gray-600">Nama Siswa</th>
                <th className="pb-4 font-semibold text-gray-600">Mata Pelajaran</th>
                <th className="pb-4 font-semibold text-gray-600">Jenis</th>
                <th className="pb-4 font-semibold text-gray-600">Tanggal</th>
                <th className="pb-4 font-semibold text-gray-600">Skor</th>
                <th className="pb-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">Belum ada data nilai yang terekam.</td>
                </tr>
              ) : (
                results.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium text-gray-900">{res.studentName}</td>
                    <td className="py-4 text-gray-600">{res.subject}</td>
                    <td className="py-4 text-gray-600 capitalize">{res.type}</td>
                    <td className="py-4 text-gray-600">{res.date}</td>
                    <td className="py-4 font-bold text-emerald-600">{res.score}</td>
                    <td className="py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        res.score >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {res.score >= 75 ? 'Lulus' : 'Remedial'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-100 transition-all duration-300 flex flex-col sticky top-0 h-screen z-50",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <span className="text-xl font-bold text-gray-900">AdiAI</span>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { id: 'home', label: 'Dashboard', icon: GraduationCap },
            { id: 'materi', label: 'Materi Pelajaran', icon: BookOpen },
            { id: 'administrasi', label: 'Administrasi Guru', icon: FileText },
            { id: 'asesmen', label: 'Fitur Asesmen', icon: ClipboardCheck },
            { id: 'nilai', label: 'Rekap Nilai', icon: BarChart3 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all group",
                activeTab === item.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
              )}
            >
              <item.icon size={20} className={cn(activeTab === item.id ? "text-white" : "group-hover:text-emerald-600")} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className={cn("flex items-center gap-3 p-3 rounded-xl bg-gray-50", !isSidebarOpen && "justify-center")}>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <User size={20} />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">Profesor Aplikasi</p>
                <p className="text-xs text-gray-500 truncate">sukarifabahagia@gmail.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 capitalize">{activeTab === 'home' ? 'Selamat Datang' : activeTab}</h2>
            <p className="text-gray-500">Kelola administrasi pendidikan dengan lebih cerdas.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari fitur..." 
                className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64 shadow-sm"
              />
            </div>
            <button className="p-2 bg-white border border-gray-100 rounded-full text-gray-500 hover:text-emerald-600 shadow-sm">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && renderHome()}
            {activeTab === 'materi' && renderMateri()}
            {activeTab === 'administrasi' && renderAdministrasi()}
            {activeTab === 'asesmen' && renderAsesmen()}
            {activeTab === 'nilai' && renderNilai()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
