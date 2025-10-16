'use client';

import Image from "next/image";
import { useState, useEffect, FormEvent } from "react";
import { format, addDays, isSameDay, startOfDay, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

// Tipos de dados
interface FormData {
  nome: string;
  email: string;
  telefone: string;
  servico: string;
  materialOption: string;
  data: Date | null;
  hora: string;
  mensagem: string;
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estados do sistema de agendamento
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Record<string, number>>({});
  const [timeSlots, setTimeSlots] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    servico: '',
    materialOption: '',
    data: null,
    hora: '',
    mensagem: ''
  });
  const [bookingInfo, setBookingInfo] = useState<FormData & {
    preco: number;
    precoFormatado: string;
    dataFormatada: string;
    materialTexto: string;
  } | null>(null);

  // Carregar agendamentos do localStorage
  useEffect(() => {
    const savedBookings = localStorage.getItem('maellaBookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
    
    const savedTimeSlots = localStorage.getItem('maellaTimeSlots');
    if (savedTimeSlots) {
      setTimeSlots(JSON.parse(savedTimeSlots));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Detect active section
      const sections = ['home', 'servicos', 'sobre', 'galeria', 'contato'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Função para calcular preço baseado no serviço e materiais
  const calculatePrice = (servico: string, materialOption: string): number => {
    const servicePrices: Record<string, number> = {
      'Tranças Artísticas': 25000,
      'Cuidados Capilares': 15000,
      'Cortes Exclusivos': 12000,
      'Coloração Premium': 20000,
      'Penteados para Eventos': 30000,
      'Consultoria de Beleza': 10000
    };

    let basePrice = servicePrices[servico] || 0;
    
    // Se usar materiais do salão, adiciona 30%
    if (materialOption === 'materiais-salao') {
      basePrice = basePrice * 1.3;
    }

    return basePrice;
  };

  // Função para formatar preço em Kwanza
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('pt-AO')} Kz`;
  };

  // Verificar se uma data está disponível
  const isDateAvailable = (date: Date): boolean => {
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
    const count = bookings[dateKey] || 0;
    return count < 3;
  };

  // Verificar se uma data é passada
  const isDatePast = (date: Date): boolean => {
    return isBefore(startOfDay(date), startOfDay(new Date()));
  };

  // Selecionar data
  const handleDateSelect = (date: Date) => {
    if (!isDatePast(date) && isDateAvailable(date)) {
      setSelectedDate(date);
      setFormData({...formData, data: date});
    }
  };

  // Gerar calendário (próximos 30 dias)
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      days.push(addDays(today, i));
    }
    
    return days;
  };

  // Verificar se horário está disponível
  const isTimeSlotAvailable = (date: Date, time: string): boolean => {
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
    const bookedTimes = timeSlots[dateKey] || [];
    return !bookedTimes.includes(time);
  };

  // Submeter formulário
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.telefone || !formData.servico || !formData.materialOption || !formData.data || !formData.hora) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se horário ainda está disponível
    if (!isTimeSlotAvailable(formData.data, formData.hora)) {
      alert('Este horário foi ocupado recentemente. Por favor, escolha outro horário.');
      return;
    }

    // Atualizar contagem de agendamentos
    const dateKey = format(startOfDay(formData.data), 'yyyy-MM-dd');
    const newBookings = {
      ...bookings,
      [dateKey]: (bookings[dateKey] || 0) + 1
    };
    setBookings(newBookings);
    localStorage.setItem('maellaBookings', JSON.stringify(newBookings));

    // Atualizar horários ocupados
    const bookedTimes = timeSlots[dateKey] || [];
    const newTimeSlots = {
      ...timeSlots,
      [dateKey]: [...bookedTimes, formData.hora]
    };
    setTimeSlots(newTimeSlots);
    localStorage.setItem('maellaTimeSlots', JSON.stringify(newTimeSlots));

    // Calcular preço
    const price = calculatePrice(formData.servico, formData.materialOption);

    // Preparar informações para o modal
    const booking = {
      ...formData,
      preco: price,
      precoFormatado: formatPrice(price),
      dataFormatada: format(formData.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      materialTexto: formData.materialOption === 'meus-materiais' ? 'Com meus materiais' : 'Com materiais do salão'
    };

    setBookingInfo(booking);
    setShowModal(true);
  };

  // Gerar PDF
  const generatePDF = () => {
    if (!bookingInfo) return;

    const doc = new jsPDF();
    
    // Header com logo (simulado)
    doc.setFillColor(232, 165, 183);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(13, 13, 13);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('Maella', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.text('Onde a Beleza tem Luz Própria', 105, 30, { align: 'center' });
    
    // Título do documento
    doc.setTextColor(13, 13, 13);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Comprovativo de Agendamento', 105, 55, { align: 'center' });
    
    // Linha decorativa
    doc.setDrawColor(232, 165, 183);
    doc.setLineWidth(0.5);
    doc.line(20, 60, 190, 60);
    
    // Informações do cliente
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(232, 165, 183);
    doc.text('Dados do Cliente:', 20, 75);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(13, 13, 13);
    
    let y = 85;
    const lineHeight = 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Nome:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(bookingInfo.nome, 60, y);
    
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('E-mail:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(bookingInfo.email, 60, y);
    
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Telefone:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(bookingInfo.telefone, 60, y);
    
    // Detalhes do serviço
    y += lineHeight + 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(232, 165, 183);
    doc.text('Detalhes do Serviço:', 20, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 13, 13);
    doc.text('Serviço:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(bookingInfo.servico, 60, y);
    
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Data:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(bookingInfo.dataFormatada, 60, y);
    
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Horário:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${bookingInfo.hora} (Horário de Luanda)`, 60, y);
    
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Materiais:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(bookingInfo.materialTexto, 60, y);
    
    // Mensagem (se houver)
    if (bookingInfo.mensagem) {
      y += lineHeight + 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Observações:', 20, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      const splitMessage = doc.splitTextToSize(bookingInfo.mensagem, 170);
      doc.text(splitMessage, 20, y);
      y += splitMessage.length * 6;
    }
    
    // Valor total (destaque com barra preta)
    y += 15;
    doc.setFillColor(13, 13, 13);  // Fundo PRETO
    doc.roundedRect(20, y - 8, 170, 20, 3, 3, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);  // "Valor Total:" BRANCO
    doc.text('Valor Total:', 25, y + 5);
    doc.setTextColor(232, 165, 183);  // Valor em ROSA
    doc.text(bookingInfo.precoFormatado, 165, y + 5, { align: 'right' });
    
    // Informações de contato
    y += 35;
    doc.setDrawColor(232, 165, 183);
    doc.line(20, y, 190, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Maella - Salão de Beleza', 105, y, { align: 'center' });
    y += 5;
    doc.text('Telefone: +244 923 456 789 | E-mail: contato@maella.com.ao', 105, y, { align: 'center' });
    y += 5;
    doc.text('Rua da Elegância, 123 - Luanda, Angola', 105, y, { align: 'center' });
    
    // Logo Maella no final (imagem real)
    y += 15;
    
    // Carregar e adicionar a logo
    const logoImg = document.createElement('img');
    logoImg.src = '/assets/image/logo-app.png';
    
    logoImg.onload = () => {
      // Adicionar logo centralizada (50x50mm)
      doc.addImage(logoImg, 'PNG', 80, y, 50, 50);
      
      // Ornamento decorativo abaixo da logo
      const finalY = y + 55;
      doc.setDrawColor(232, 165, 183);
      doc.setLineWidth(0.3);
      doc.line(70, finalY, 140, finalY);
      
      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text('Este documento é um comprovativo de agendamento. Por favor, apresente-o no dia do seu atendimento.', 105, finalY + 5, { align: 'center' });
      
      // Salvar PDF após carregar a imagem
      const fileName = `Maella_Agendamento_${bookingInfo.nome.replace(/\s+/g, '_')}_${format(new Date(), 'ddMMyyyy')}.pdf`;
      doc.save(fileName);
    };
    
    logoImg.onerror = () => {
      // Se falhar ao carregar a imagem, usar texto como fallback
      doc.setFontSize(48);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(232, 165, 183);
      doc.text('Maella', 105, y, { align: 'center' });
      
      y += 8;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('Onde a Beleza tem Luz Própria', 105, y, { align: 'center' });
      
      y += 6;
      doc.setDrawColor(232, 165, 183);
      doc.setLineWidth(0.3);
      doc.line(75, y, 135, y);
      
      y += 6;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Este documento é um comprovativo de agendamento. Por favor, apresente-o no dia do seu atendimento.', 105, y, { align: 'center' });
      
      const fileName = `Maella_Agendamento_${bookingInfo.nome.replace(/\s+/g, '_')}_${format(new Date(), 'ddMMyyyy')}.pdf`;
      doc.save(fileName);
    };
    
    // Não salvar aqui, esperar a imagem carregar
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'glass shadow-lg py-4' : 'bg-transparent py-6'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
        <Image
                src="/assets/image/logo-app.png" 
                alt="Maella Logo" 
                width={50} 
                height={50}
                className="object-contain"
              />
              <div>
                <h1 className="font-display text-2xl lg:text-3xl text-maella-rose font-bold tracking-wide">
                  Maella
                </h1>
                <p className="font-serif text-xs text-maella-white/80 italic">
                  Onde a Beleza tem Luz Própria
                </p>
              </div>
            </div>

            {/* Navigation */}
            <ul className="hidden md:flex items-center space-x-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'servicos', label: 'Serviços' },
                { id: 'sobre', label: 'Sobre Nós' },
                { id: 'galeria', label: 'Galeria' },
                { id: 'contato', label: 'Contato' }
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`font-serif text-base transition-all duration-300 relative group ${
                      activeSection === item.id 
                        ? 'text-maella-rose' 
                        : 'text-maella-white/80 hover:text-maella-rose'
                    }`}
                  >
                    {item.label}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-maella-rose transition-all duration-300 ${
                      activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  </button>
          </li>
              ))}
            </ul>

            {/* CTA Button Desktop */}
            <button 
              onClick={() => scrollToSection('contato')}
              className="hidden lg:block px-6 py-2.5 bg-gradient-to-r from-maella-rose to-maella-rose-dark text-maella-black font-serif font-semibold rounded-full hover:shadow-lg hover:shadow-maella-rose/50 transition-all duration-300 hover:scale-105"
            >
              Agende Agora
            </button>

            {/* Menu Hamburguer Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center space-y-1.5 focus:outline-none"
              aria-label="Menu"
            >
              <span className={`block w-6 h-0.5 bg-maella-rose transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-maella-rose transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-maella-rose transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </nav>

        {/* Menu Mobile */}
        <div className={`md:hidden glass transition-all duration-500 overflow-hidden ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-6 py-4 space-y-4">
            {[
              { id: 'home', label: 'Home' },
              { id: 'servicos', label: 'Serviços' },
              { id: 'sobre', label: 'Sobre Nós' },
              { id: 'galeria', label: 'Galeria' },
              { id: 'contato', label: 'Contato' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  scrollToSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left font-serif text-lg py-2 transition-colors ${
                  activeSection === item.id 
                    ? 'text-maella-rose' 
                    : 'text-maella-white/80'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <button 
              onClick={() => {
                scrollToSection('contato');
                setMobileMenuOpen(false);
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-maella-rose to-maella-rose-dark text-maella-black font-serif font-semibold rounded-full hover:shadow-lg hover:shadow-maella-rose/50 transition-all duration-300"
            >
              Agende Agora
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
            <Image
            src="/assets/image/fundo.jpg" 
            alt="Hero Background" 
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-maella-black/80 via-maella-black/60 to-maella-black"></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-maella-rose/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-maella-rose-dark/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="font-display text-6xl lg:text-8xl font-bold text-maella-white mb-6 leading-tight">
              Onde a Beleza<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-maella-rose via-maella-rose-light to-maella-rose-dark">
                tem Luz Própria
              </span>
            </h2>
            <p className="font-serif text-xl lg:text-2xl text-maella-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              No Maella, celebramos a autenticidade e o brilho único de cada mulher. 
              Transformamos cabelos em obras de arte, onde tradição e modernidade se encontram.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => scrollToSection('servicos')}
                className="px-8 py-4 bg-gradient-to-r from-maella-rose to-maella-rose-dark text-maella-black font-serif font-semibold text-lg rounded-full hover:shadow-2xl hover:shadow-maella-rose/50 transition-all duration-300 hover:scale-105"
              >
                Descubra Nossos Serviços
              </button>
              <button 
                onClick={() => scrollToSection('galeria')}
                className="px-8 py-4 border-2 border-maella-rose text-maella-rose font-serif font-semibold text-lg rounded-full hover:bg-maella-rose hover:text-maella-black transition-all duration-300 hover:scale-105"
              >
                Ver Galeria
              </button>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute -bottom-30 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-maella-rose rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-maella-rose rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-24 bg-maella-charcoal relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-maella-rose to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="font-display text-5xl lg:text-6xl font-bold text-maella-white mb-4">
              Nossos Serviços
            </h3>
            <p className="font-serif text-xl text-maella-white/80 max-w-2xl mx-auto">
              Experiências exclusivas que realçam sua beleza natural com técnicas sofisticadas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Tranças Artísticas",
                description: "Técnicas tradicionais africanas executadas com maestria. Cada trança conta uma história, cada padrão celebra uma cultura.",
                icon: "✨",
                features: ["Box Braids", "Cornrows", "Passion Twists", "Fulani Braids"]
              },
              {
                title: "Cuidados Capilares",
                description: "Tratamentos personalizados que nutrem, hidratam e revitalizam seus fios, respeitando a textura natural.",
                icon: "💆🏾‍♀️",
                features: ["Hidratação Profunda", "Cronograma Capilar", "Nutrição Intensiva", "Reconstrução"]
              },
              {
                title: "Cortes Exclusivos",
                description: "Cortes modernos e estilosos que valorizam sua personalidade e formato do rosto.",
                icon: "✂️",
                features: ["Cortes Afro", "Design de Sobrancelhas", "Acabamentos", "Estilização"]
              },
              {
                title: "Coloração Premium",
                description: "Cores vibrantes e naturais aplicadas com produtos de alta qualidade que protegem seus fios.",
                icon: "🎨",
                features: ["Coloração", "Mechas", "Luzes", "Balayage"]
              },
              {
                title: "Penteados para Eventos",
                description: "Criações exclusivas para momentos especiais: casamentos, formaturas e celebrações.",
                icon: "👑",
                features: ["Noivas", "Festas", "Formandas", "Eventos Corporativos"]
              },
              {
                title: "Consultoria de Beleza",
                description: "Orientação personalizada sobre cuidados, produtos e estilos que complementam sua rotina.",
                icon: "💡",
                features: ["Análise Capilar", "Recomendação de Produtos", "Rotina de Cuidados", "Estilo Pessoal"]
              }
            ].map((service, index) => (
              <div 
                key={index}
                className="group glass rounded-2xl p-8 hover:border-maella-rose transition-all duration-500 hover:transform hover:scale-105"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h4 className="font-display text-2xl font-bold text-maella-rose mb-3">
                  {service.title}
                </h4>
                <p className="font-serif text-maella-white/80 mb-4 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-maella-white/70 font-sans">
                      <span className="w-1.5 h-1.5 bg-maella-rose rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-24 bg-maella-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <Image
            src="/assets/image/Ornamento redondo preto e cinza.jpg" 
            alt="Ornamento" 
            fill
            className="object-cover"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div>
              <h3 className="font-display text-5xl lg:text-6xl font-bold text-maella-white mb-6">
                Sobre o Maella
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-maella-rose to-maella-rose-dark mb-8"></div>
              
              <div className="space-y-6 font-serif text-lg text-maella-white/90 leading-relaxed">
                <p>
                  O <span className="text-maella-rose font-semibold">Maella</span> nasceu do sonho de criar um espaço onde cada mulher pudesse 
                  encontrar não apenas um salão de beleza, mas um santuário de autoestima e empoderamento.
                </p>
                <p>
                  Especializado em <span className="text-maella-rose">beleza afro</span>, honramos as raízes e tradições 
                  ancestrais, combinando-as com técnicas contemporâneas e produtos premium. Cada serviço 
                  é uma celebração da diversidade e da beleza única de cada cliente.
                </p>
                <p>
                  Nossa equipe de profissionais qualificados está comprometida em proporcionar experiências 
                  transformadoras, onde o cuidado com seus cabelos vai além da estética – é sobre 
                  <span className="text-maella-rose font-semibold"> amor próprio, história e identidade</span>.
                </p>
                <p className="text-2xl font-display text-maella-rose italic">
                  &ldquo;No Maella, cada fio conta uma história, cada estilo é uma obra de arte.&rdquo;
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                {[
                  { number: "500+", label: "Clientes Satisfeitas" },
                  { number: "5+", label: "Anos de Experiência" },
                  { number: "100%", label: "Dedicação e Amor" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="font-display text-4xl font-bold text-maella-rose mb-2">
                      {stat.number}
                    </div>
                    <div className="font-serif text-sm text-maella-white/70">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Collage */}
            <div className="relative h-[600px]">
              <div className="absolute top-0 right-0 w-64 h-64 glass rounded-3xl overflow-hidden transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <Image 
                  src="/assets/image/logo-app.png" 
                  alt="Maella" 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 w-80 h-96 glass rounded-3xl overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image 
                  src="/assets/image/Ornamento redondo preto e cinza.jpg" 
                  alt="Decoração" 
                  fill
                  className="object-cover opacity-60"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-maella-rose/20 to-maella-rose-dark/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeria" className="py-24 bg-maella-charcoal relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="font-display text-5xl lg:text-6xl font-bold text-maella-white mb-4">
              Nossa Galeria
            </h3>
            <p className="font-serif text-xl text-maella-white/80 max-w-2xl mx-auto">
              Cada trabalho é uma obra de arte única, resultado da paixão e dedicação da nossa equipe
            </p>
          </div>

          {/* Gallery Grid - Pinterest Style Layout */}
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {/* 
              Layout estilo Pinterest/Masonry - As imagens se organizam automaticamente
              Para adicionar mais imagens, basta adicionar um novo bloco
            */}
            
            {/* Imagem 1 */}
            <div className="group relative overflow-hidden rounded-2xl glass cursor-pointer break-inside-avoid mb-6">
              <div className="relative h-96">
                <Image 
                  src="/assets/image/Moça Negra Com Trança.jpg" 
                  alt="Box Braids Longas" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maella-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-serif text-xl text-maella-white font-semibold">Box Braids Longas</p>
                    <p className="font-sans text-sm text-maella-white/80 mt-1">Estilo clássico e atemporal</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-maella-rose rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300">
                  <span className="text-2xl text-maella-black">+</span>
                </div>
              </div>
            </div>

            {/* Imagem 2 */}
            <div className="group relative overflow-hidden rounded-2xl glass cursor-pointer break-inside-avoid mb-6">
              <div className="relative h-72">
                <Image 
                  src="/assets/image/gallery1.jpg" 
                  alt="Tranças Artísticas" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maella-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-serif text-xl text-maella-white font-semibold">Tranças Artísticas</p>
                    <p className="font-sans text-sm text-maella-white/80 mt-1">Criatividade e beleza</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-maella-rose rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300">
                  <span className="text-2xl text-maella-black">+</span>
                </div>
              </div>
            </div>

            {/* Imagem 3 */}
            <div className="group relative overflow-hidden rounded-2xl glass cursor-pointer break-inside-avoid mb-6">
              <div className="relative h-64">
                <Image 
                  src="/assets/image/Cabelo trançado escuro.jpg" 
                  alt="Cornrows Elegantes" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maella-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-serif text-xl text-maella-white font-semibold">Cornrows Elegantes</p>
                    <p className="font-sans text-sm text-maella-white/80 mt-1">Tradição e modernidade</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-maella-rose rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300">
                  <span className="text-2xl text-maella-black">+</span>
                </div>
              </div>
            </div>

            {/* Imagem 4 */}
            <div className="group relative overflow-hidden rounded-2xl glass cursor-pointer break-inside-avoid mb-6">
              <div className="relative h-[420px]">
                <Image 
                  src="/assets/image/gallery2.jpg" 
                  alt="Penteado Especial" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maella-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-serif text-xl text-maella-white font-semibold">Penteado Especial</p>
                    <p className="font-sans text-sm text-maella-white/80 mt-1">Para momentos únicos</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-maella-rose rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300">
                  <span className="text-2xl text-maella-black">+</span>
                </div>
              </div>
            </div>

            {/* Imagem 5 */}
            <div className="group relative overflow-hidden rounded-2xl glass cursor-pointer break-inside-avoid mb-6">
              <div className="relative h-80">
                <Image 
                  src="/assets/image/Moça Negra com Trança (1).jpg" 
                  alt="Fulani Braids" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maella-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-serif text-xl text-maella-white font-semibold">Fulani Braids</p>
                    <p className="font-sans text-sm text-maella-white/80 mt-1">Sofisticação africana</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-maella-rose rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300">
                  <span className="text-2xl text-maella-black">+</span>
                </div>
              </div>
            </div>

            {/* Imagem 6 */}
            <div className="group relative overflow-hidden rounded-2xl glass cursor-pointer break-inside-avoid mb-6">
              <div className="relative h-64">
                <Image 
                  src="/assets/image/gallery3.jpg" 
                  alt="Tranças Coloridas" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maella-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-serif text-xl text-maella-white font-semibold">Tranças Coloridas</p>
                    <p className="font-sans text-sm text-maella-white/80 mt-1">Ouse ser você mesma</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-maella-rose rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300">
                  <span className="text-2xl text-maella-black">+</span>
                </div>
              </div>
            </div>

            {/* Imagem 7 */}
            <div className="group relative overflow-hidden rounded-2xl glass cursor-pointer break-inside-avoid mb-6">
              <div className="relative h-96">
                <Image 
                  src="/assets/image/gallery4.jpg" 
                  alt="Box Braids Médias" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maella-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-serif text-xl text-maella-white font-semibold">Box Braids Médias</p>
                    <p className="font-sans text-sm text-maella-white/80 mt-1">Versátil e elegante</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-maella-rose rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300">
                  <span className="text-2xl text-maella-black">+</span>
                </div>
              </div>
            </div>

            {/* Imagem 8 */}
            <div className="group relative overflow-hidden rounded-2xl glass cursor-pointer break-inside-avoid mb-6">
              <div className="relative h-72">
                <Image 
                  src="/assets/image/gallery5.jpg" 
                  alt="Twist Moderno" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maella-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-serif text-xl text-maella-white font-semibold">Twist Moderno</p>
                    <p className="font-sans text-sm text-maella-white/80 mt-1">Praticidade com estilo</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-maella-rose rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300">
                  <span className="text-2xl text-maella-black">+</span>
                </div>
              </div>
            </div>

          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="font-serif text-lg text-maella-white/80 mb-6">
              Quer fazer parte da nossa galeria? Agende seu horário e deixe-nos criar algo especial para você!
            </p>
            <button 
              onClick={() => scrollToSection('contato')}
              className="px-8 py-4 bg-gradient-to-r from-maella-rose to-maella-rose-dark text-maella-black font-serif font-semibold text-lg rounded-full hover:shadow-2xl hover:shadow-maella-rose/50 transition-all duration-300 hover:scale-105"
            >
              Agende Sua Transformação
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-24 bg-maella-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-maella-rose/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-maella-rose-dark/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h3 className="font-display text-5xl lg:text-6xl font-bold text-maella-white mb-4">
              Entre em Contato
            </h3>
            <p className="font-serif text-xl text-maella-white/80">
              Estamos prontas para transformar sua beleza em arte
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="glass rounded-2xl p-8">
                <h4 className="font-display text-2xl font-bold text-maella-rose mb-6">
                  Informações de Contato
                </h4>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-maella-rose/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📍</span>
                    </div>
                    <div>
                      <h5 className="font-serif font-semibold text-maella-white mb-1">Endereço</h5>
                      <p className="text-maella-white/70">
                        Rua da Elegância, 123<br />
                        Centro, Cidade - Estado
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-maella-rose/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📞</span>
                    </div>
                    <div>
                      <h5 className="font-serif font-semibold text-maella-white mb-1">Telefone</h5>
                      <p className="text-maella-white/70">
                        +244 923 456 789<br />
                        +244 934 567 890
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-maella-rose/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">✉️</span>
                    </div>
                    <div>
                      <h5 className="font-serif font-semibold text-maella-white mb-1">E-mail</h5>
                      <p className="text-maella-white/70">
                        contato@maella.com.br<br />
                        agendamento@maella.com.br
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-maella-rose/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🕐</span>
                    </div>
                    <div>
                      <h5 className="font-serif font-semibold text-maella-white mb-1">Horário de Funcionamento</h5>
                      <p className="text-maella-white/70">
                        Segunda a Sexta: 9h às 20h<br />
                        Sábado: 9h às 18h<br />
                        Domingo: Fechado
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="mt-8 pt-8 border-t border-maella-rose/20">
                  <h5 className="font-serif font-semibold text-maella-white mb-4">Redes Sociais</h5>
                  <div className="flex space-x-4">
                    {['Instagram', 'Facebook', 'WhatsApp'].map((social) => (
                      <button 
                        key={social}
                        className="w-12 h-12 bg-maella-rose/20 hover:bg-maella-rose rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">
                          {social === 'Instagram' && '📸'}
                          {social === 'Facebook' && '👍'}
                          {social === 'WhatsApp' && '💬'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form - Sistema de Agendamento Completo */}
            <div className="glass rounded-2xl p-8">
              <h4 className="font-display text-2xl font-bold text-maella-rose mb-6">
                Agende seu Horário
              </h4>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-serif text-maella-white mb-2">
                    Nome Completo <span className="text-maella-rose">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full px-4 py-3 bg-maella-charcoal border border-maella-rose/30 rounded-lg text-maella-white focus:border-maella-rose focus:outline-none transition-colors"
                    placeholder="Digite seu nome"
                    required
                  />
                </div>

                <div>
                  <label className="block font-serif text-maella-white mb-2">
                    E-mail <span className="text-maella-rose">*</span>
                  </label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-maella-charcoal border border-maella-rose/30 rounded-lg text-maella-white focus:border-maella-rose focus:outline-none transition-colors"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block font-serif text-maella-white mb-2">
                    Telefone (Angola) <span className="text-maella-rose">*</span>
                  </label>
                  <input 
                    type="tel" 
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    className="w-full px-4 py-3 bg-maella-charcoal border border-maella-rose/30 rounded-lg text-maella-white focus:border-maella-rose focus:outline-none transition-colors"
                    placeholder="+244 923 456 789"
                    required
                  />
                </div>

                <div>
                  <label className="block font-serif text-maella-white mb-2">
                    Serviço de Interesse <span className="text-maella-rose">*</span>
                  </label>
                  <select 
                    value={formData.servico}
                    onChange={(e) => setFormData({...formData, servico: e.target.value})}
                    className="w-full px-4 py-3 bg-maella-charcoal border border-maella-rose/30 rounded-lg text-maella-white focus:border-maella-rose focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Selecione um serviço</option>
                    <option value="Tranças Artísticas">Tranças Artísticas - 25.000 Kz</option>
                    <option value="Cuidados Capilares">Cuidados Capilares - 15.000 Kz</option>
                    <option value="Cortes Exclusivos">Cortes Exclusivos - 12.000 Kz</option>
                    <option value="Coloração Premium">Coloração Premium - 20.000 Kz</option>
                    <option value="Penteados para Eventos">Penteados para Eventos - 30.000 Kz</option>
                    <option value="Consultoria de Beleza">Consultoria de Beleza - 10.000 Kz</option>
                  </select>
                </div>

                {/* Opção de Materiais */}
                <div>
                  <label className="block font-serif text-maella-white mb-3">
                    Materiais <span className="text-maella-rose">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="materialOption"
                        value="meus-materiais"
                        checked={formData.materialOption === 'meus-materiais'}
                        onChange={(e) => setFormData({...formData, materialOption: e.target.value})}
                        required
                      />
                      <span className="font-serif text-maella-white group-hover:text-maella-rose transition-colors">
                        Trago meus próprios materiais (preço base)
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="materialOption"
                        value="materiais-salao"
                        checked={formData.materialOption === 'materiais-salao'}
                        onChange={(e) => setFormData({...formData, materialOption: e.target.value})}
                        required
                      />
                      <span className="font-serif text-maella-white group-hover:text-maella-rose transition-colors">
                        Usar materiais do salão <span className="text-maella-rose">(+30% no valor final)</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Calendário */}
                <div>
                  <label className="block font-serif text-maella-white mb-3">
                    Selecione a Data <span className="text-maella-rose">*</span>
                  </label>
                  <div className="bg-maella-charcoal rounded-lg p-4 border border-maella-rose/30">
                    <div className="grid grid-cols-7 gap-2">
                      {generateCalendarDays().map((date, index) => {
                        const isAvailable = isDateAvailable(date);
                        const isPast = isDatePast(date);
                        const isSelected = selectedDate && isSameDay(date, selectedDate);
                        const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
                        const bookingCount = bookings[dateKey] || 0;

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleDateSelect(date)}
                            disabled={isPast || !isAvailable}
                            className={`
                              aspect-square rounded-lg p-2 text-center transition-all duration-300 flex flex-col items-center justify-center
                              ${isSelected ? 'bg-maella-rose text-maella-black scale-110 font-bold' : ''}
                              ${!isAvailable && !isPast ? 'bg-maella-rose/40 cursor-not-allowed' : ''}
                              ${isPast ? 'bg-maella-charcoal/50 cursor-not-allowed opacity-30' : ''}
                              ${isAvailable && !isPast && !isSelected ? 'border border-maella-rose/30 hover:border-maella-rose hover:bg-maella-rose/10' : ''}
                            `}
                            title={
                              isPast ? 'Data passada' :
                              !isAvailable ? `Lotado (${bookingCount}/3)` :
                              `Disponível (${bookingCount}/3)`
                            }
                          >
                            <span className={`text-xs font-serif ${isSelected ? 'text-maella-black' : 'text-maella-white/80'}`}>
                              {format(date, 'EEE', { locale: ptBR })}
                            </span>
                            <span className={`text-lg font-semibold ${isSelected ? 'text-maella-black' : isPast ? 'text-maella-white/30' : !isAvailable ? 'text-maella-white/50' : 'text-maella-white'}`}>
                              {format(date, 'd')}
                            </span>
                            {!isPast && bookingCount > 0 && (
                              <span className={`text-xs ${isSelected ? 'text-maella-black/70' : 'text-maella-rose'}`}>
                                {bookingCount}/3
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    {selectedDate && (
                      <div className="mt-4 p-3 bg-maella-rose/10 rounded-lg border border-maella-rose/30">
                        <p className="font-serif text-maella-white text-center">
                          <span className="text-maella-rose font-semibold">Data selecionada:</span>{' '}
                          {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-maella-white/70">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border border-maella-rose/30 rounded"></div>
                        <span>Disponível</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-maella-rose rounded"></div>
                        <span>Selecionado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-maella-rose/40 rounded"></div>
                        <span>Lotado</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seleção de Horário - Aparece após selecionar data */}
                {selectedDate && (
                  <div>
                    <label className="block font-serif text-maella-white mb-3">
                      Selecione o Horário <span className="text-maella-rose">*</span>
                    </label>
                    <select
                      value={formData.hora}
                      onChange={(e) => setFormData({...formData, hora: e.target.value})}
                      className="w-full px-4 py-3 bg-maella-charcoal border border-maella-rose/30 rounded-lg text-maella-white focus:border-maella-rose focus:outline-none transition-colors"
                      required
                    >
                      <option value="">Escolha um horário</option>
                      {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => {
                        const isAvailable = isTimeSlotAvailable(selectedDate, time);
                        return (
                          <option 
                            key={time} 
                            value={time}
                            disabled={!isAvailable}
                          >
                            {time} {!isAvailable ? '(Ocupado)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <p className="mt-2 text-sm text-maella-white/60 font-sans">
                      Horário de Luanda, Angola (WAT - UTC+1) • Das 07:00 às 18:00
                    </p>
                  </div>
                )}

                <div>
                  <label className="block font-serif text-maella-white mb-2">Observações</label>
                  <textarea 
                    rows={4}
                    value={formData.mensagem}
                    onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                    className="w-full px-4 py-3 bg-maella-charcoal border border-maella-rose/30 rounded-lg text-maella-white focus:border-maella-rose focus:outline-none transition-colors resize-none"
                    placeholder="Alguma observação especial sobre seu atendimento?"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-maella-rose to-maella-rose-dark text-maella-black font-serif font-semibold text-lg rounded-full hover:shadow-2xl hover:shadow-maella-rose/50 transition-all duration-300 hover:scale-105"
                >
                  Confirmar Agendamento
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Confirmação de Agendamento */}
      {showModal && bookingInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Botão Fechar */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-maella-rose/20 hover:bg-maella-rose rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <span className="text-2xl text-maella-white">×</span>
            </button>

            {/* Header do Modal */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-maella-rose rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                <span className="text-4xl">✓</span>
              </div>
              <h3 className="font-display text-3xl font-bold text-maella-white mb-2">
                Agendamento Confirmado!
              </h3>
              <p className="font-serif text-maella-white/80">
                Estamos ansiosas para te receber no Maella
              </p>
            </div>

            {/* Informações do Agendamento */}
            <div className="space-y-6 mb-8">
              {/* Dados Pessoais */}
              <div className="bg-maella-charcoal/50 rounded-xl p-6">
                <h4 className="font-display text-xl font-bold text-maella-rose mb-4">
                  Seus Dados
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-serif text-maella-white/70">Nome:</span>
                    <span className="font-serif text-maella-white font-semibold">{bookingInfo.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-serif text-maella-white/70">E-mail:</span>
                    <span className="font-serif text-maella-white font-semibold">{bookingInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-serif text-maella-white/70">Telefone:</span>
                    <span className="font-serif text-maella-white font-semibold">{bookingInfo.telefone}</span>
                  </div>
                </div>
              </div>

              {/* Detalhes do Serviço */}
              <div className="bg-maella-charcoal/50 rounded-xl p-6">
                <h4 className="font-display text-xl font-bold text-maella-rose mb-4">
                  Detalhes do Serviço
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-serif text-maella-white/70">Serviço:</span>
                    <span className="font-serif text-maella-white font-semibold">{bookingInfo.servico}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-serif text-maella-white/70">Data:</span>
                    <span className="font-serif text-maella-white font-semibold">{bookingInfo.dataFormatada}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-serif text-maella-white/70">Horário:</span>
                    <span className="font-serif text-maella-white font-semibold">{bookingInfo.hora} (Luanda)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-serif text-maella-white/70">Materiais:</span>
                    <span className="font-serif text-maella-white font-semibold">{bookingInfo.materialTexto}</span>
                  </div>
                  {bookingInfo.mensagem && (
                    <div className="pt-3 border-t border-maella-rose/20">
                      <span className="font-serif text-maella-white/70 block mb-2">Observações:</span>
                      <p className="font-serif text-maella-white text-sm">{bookingInfo.mensagem}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Valor Total */}
              <div className="bg-gradient-to-r from-maella-rose/20 to-maella-rose-dark/20 rounded-xl p-6 border-2 border-maella-rose">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display text-2xl font-bold text-maella-white mb-1">
                      Valor Total
                    </h4>
                    <p className="font-serif text-sm text-maella-white/70">
                      {bookingInfo.materialOption === 'materiais-salao' && '(Inclui materiais do salão)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-4xl font-bold text-maella-rose">
                      {bookingInfo.precoFormatado}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-4">
              <button
                onClick={generatePDF}
                className="w-full px-8 py-4 bg-gradient-to-r from-maella-rose to-maella-rose-dark text-maella-black font-serif font-semibold text-lg rounded-full hover:shadow-2xl hover:shadow-maella-rose/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
              >
                <span className="text-2xl">📄</span>
                Gerar Comprovativo em PDF
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="w-full px-8 py-3 border-2 border-maella-rose text-maella-rose font-serif font-semibold text-lg rounded-full hover:bg-maella-rose hover:text-maella-black transition-all duration-300"
              >
                Fechar
              </button>
            </div>

            {/* Nota Importante */}
            <div className="mt-6 p-4 bg-maella-rose/10 rounded-lg border border-maella-rose/30">
              <p className="font-serif text-sm text-maella-white/80 text-center">
                <span className="text-maella-rose font-semibold">Importante:</span> Salve ou imprima seu comprovativo. 
                Por favor, chegue com 10 minutos de antecedência.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-maella-charcoal py-12 border-t border-maella-rose/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
          <Image
                  src="/assets/image/logo-app.png" 
                  alt="Maella Logo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
                <div>
                  <h5 className="font-display text-2xl text-maella-rose font-bold">Maella</h5>
                  <p className="font-serif text-xs text-maella-white/70 italic">
                    Onde a Beleza tem Luz Própria
                  </p>
                </div>
              </div>
              <p className="font-serif text-maella-white/70 text-sm leading-relaxed">
                Celebrando a beleza afro com técnicas ancestrais e cuidados contemporâneos.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h6 className="font-display text-lg text-maella-white font-bold mb-4">Links Rápidos</h6>
              <ul className="space-y-2">
                {['Home', 'Serviços', 'Sobre Nós', 'Galeria', 'Contato'].map((link) => (
                  <li key={link}>
                    <button 
                      onClick={() => scrollToSection(link.toLowerCase().replace(' ', '-'))}
                      className="font-serif text-maella-white/70 hover:text-maella-rose transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h6 className="font-display text-lg text-maella-white font-bold mb-4">Newsletter</h6>
              <p className="font-serif text-maella-white/70 text-sm mb-4">
                Receba dicas de beleza e promoções exclusivas
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Seu e-mail" 
                  className="flex-1 px-4 py-2 bg-maella-black border border-maella-rose/30 rounded-lg text-maella-white text-sm focus:border-maella-rose focus:outline-none"
                />
                <button className="px-6 py-2 bg-maella-rose text-maella-black font-serif font-semibold rounded-lg hover:bg-maella-rose-dark transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-maella-rose/20 text-center">
            <p className="font-serif text-maella-white/60 text-sm">
              © 2025 Maella - Todos os direitos reservados. Feito com 💖 para celebrar a beleza única de cada mulher.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
