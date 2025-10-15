# 🌸 Maella - Instruções de Instalação

## 📦 Instalar Dependências

Para o sistema de agendamento funcionar corretamente, você precisa instalar as novas dependências:

```bash
npm install
```

Ou se estiver tendo problemas:

```bash
npm install --legacy-peer-deps
```

## 🚀 Iniciar o Servidor

Depois de instalar as dependências, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📋 Dependências Adicionadas

- **date-fns**: Para manipulação de datas no calendário
- **jspdf**: Para geração de PDFs do comprovativo
- **html2canvas**: Para captura de elementos HTML (usado com jsPDF)

## ✨ Funcionalidades do Sistema de Agendamento

### 1. Formulário Completo
- Nome, email, telefone (Angola)
- Seleção de serviço com preços em Kwanza
- Opção de materiais (próprios ou do salão)
- Calendário interativo
- Campo de observações

### 2. Calendário Inteligente
- Mostra os próximos 30 dias
- Dias passados ficam desabilitados
- Máximo de 3 agendamentos por dia
- Dias lotados ficam com fundo rosa e desabilitados
- Contador visual de agendamentos por dia

### 3. Sistema de Armazenamento
- Usa `localStorage` do navegador
- Persiste os agendamentos entre sessões
- Dinâmico e automático

### 4. Modal de Confirmação
- Exibe todas as informações do agendamento
- Mostra o valor total calculado
- Permite gerar PDF do comprovativo
- Design elegante e responsivo

### 5. Geração de PDF
- PDF profissional com as cores do Maella
- Inclui todas as informações do agendamento
- Nome do arquivo personalizado
- Pronto para impressão

## 🎨 Preços dos Serviços (em Kwanza)

- Tranças Artísticas: 25.000 Kz
- Cuidados Capilares: 15.000 Kz
- Cortes Exclusivos: 12.000 Kz
- Coloração Premium: 20.000 Kz
- Penteados para Eventos: 30.000 Kz
- Consultoria de Beleza: 10.000 Kz

**Nota:** Ao escolher "Materiais do Salão", adiciona-se 30% ao valor base.

## 🛠️ Como Testar o Sistema

1. Acesse a seção de Contato no site
2. Preencha todos os campos do formulário
3. Selecione uma data no calendário
4. Clique em "Confirmar Agendamento"
5. Veja o modal com o resumo e valor
6. Clique em "Gerar Comprovativo em PDF" para baixar

## 💾 Gerenciar Agendamentos

Os agendamentos são salvos no `localStorage` do navegador. Para limpar todos os agendamentos (útil para testes):

```javascript
// Abra o Console do navegador (F12) e digite:
localStorage.removeItem('maellaBookings');
```

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

---

**Maella - Onde a Beleza tem Luz Própria** ✨

