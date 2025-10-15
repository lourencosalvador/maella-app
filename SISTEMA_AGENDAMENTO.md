# 🗓️ Sistema de Agendamento Maella - Documentação Completa

## 🎯 Visão Geral

Sistema completo de agendamento online para o salão Maella, com:
- ✅ Formulário inteligente
- ✅ Calendário visual interativo
- ✅ Limite automático de 3 agendamentos por dia
- ✅ Cálculo automático de preços
- ✅ Modal de confirmação elegante
- ✅ Geração de PDF profissional
- ✅ Armazenamento local persistente

---

## 📋 Componentes do Sistema

### 1. **Formulário de Agendamento**

Campos obrigatórios:
- **Nome Completo**
- **E-mail**
- **Telefone** (formato Angola: +244)
- **Serviço** (com preço visível)
- **Materiais** (próprios ou do salão)
- **Data** (calendário interativo)
- **Observações** (opcional)

### 2. **Sistema de Materiais**

Duas opções disponíveis:

**Opção 1: Meus Materiais** 💼
- Cliente traz seus próprios produtos
- Preço base do serviço

**Opção 2: Materiais do Salão** ✨
- Usa produtos premium do Maella
- Adiciona 30% ao valor base
- Cálculo automático

### 3. **Calendário Inteligente**

**Características:**
- Mostra próximos 30 dias
- Layout grid 7 colunas (semana completa)
- Atualização em tempo real

**Estados das Datas:**

🟢 **Disponível** (borda rosa)
- 0-2 agendamentos
- Clicável
- Hover effect

🔴 **Lotado** (fundo rosa)
- 3 agendamentos (limite)
- Desabilitado
- Mostra contador 3/3

⚫ **Passado** (opaco)
- Data já passou
- Desabilitado
- Não clicável

🟣 **Selecionado** (rosa cheio)
- Data escolhida pelo usuário
- Escala aumentada (scale-110)
- Texto em preto

**Indicadores Visuais:**
- Dia da semana (abreviado)
- Número do dia
- Contador de agendamentos (X/3)

### 4. **Sistema de Armazenamento**

**Tecnologia:** localStorage do navegador

**Estrutura dos Dados:**
```json
{
  "2025-10-15": 2,
  "2025-10-16": 3,
  "2025-10-18": 1
}
```

**Chave:** `maellaBookings`
**Formato:** Objeto JSON com datas (YYYY-MM-DD) e contadores

**Persistência:**
- Automática ao confirmar agendamento
- Carrega automaticamente ao abrir a página
- Sincroniza entre abas do mesmo navegador

### 5. **Modal de Confirmação**

**Exibe:**

📝 **Dados Pessoais**
- Nome, email, telefone

💇🏾‍♀️ **Detalhes do Serviço**
- Serviço escolhido
- Data formatada por extenso
- Tipo de material
- Observações (se houver)

💰 **Valor Total**
- Cálculo automático
- Destaque visual
- Formato: XX.XXX Kz

**Ações Disponíveis:**
1. **Gerar PDF** - Baixa comprovativo
2. **Fechar** - Retorna ao site

### 6. **Geração de PDF**

**Conteúdo do Comprovativo:**

**Header:**
- Fundo rosa com logo
- Nome "Maella"
- Slogan

**Seções:**
1. Dados do Cliente
2. Detalhes do Serviço
3. Valor Total (destaque)
4. Informações de Contato
5. Nota de rodapé

**Formato do Arquivo:**
`Maella_Agendamento_NomeCliente_DDMMAAAA.pdf`

**Características:**
- Tamanho A4
- Cores do Maella
- Pronto para impressão
- Profissional e elegante

---

## 💰 Tabela de Preços (Kwanza)

| Serviço | Preço Base | Com Materiais do Salão (+30%) |
|---------|------------|-------------------------------|
| Tranças Artísticas | 25.000 Kz | 32.500 Kz |
| Cuidados Capilares | 15.000 Kz | 19.500 Kz |
| Cortes Exclusivos | 12.000 Kz | 15.600 Kz |
| Coloração Premium | 20.000 Kz | 26.000 Kz |
| Penteados para Eventos | 30.000 Kz | 39.000 Kz |
| Consultoria de Beleza | 10.000 Kz | 13.000 Kz |

---

## 🔧 Funções Principais

### `calculatePrice(servico, materialOption)`
Calcula o preço final baseado no serviço e opção de materiais.

### `isDateAvailable(date)`
Verifica se uma data tem menos de 3 agendamentos.

### `isDatePast(date)`
Verifica se uma data já passou.

### `handleDateSelect(date)`
Seleciona uma data se estiver disponível.

### `handleSubmit(e)`
Processa o formulário e abre o modal.

### `generatePDF()`
Cria e baixa o comprovativo em PDF.

---

## 🎨 Design System

**Cores Utilizadas:**

- **Rosa Principal:** `#E8A5B7` (maella-rose)
- **Rosa Escuro:** `#C77E94` (maella-rose-dark)
- **Preto:** `#0D0D0D` (maella-black)
- **Cinza:** `#1A1A1A` (maella-charcoal)
- **Branco:** `#F5F5F5` (maella-white)

**Fontes:**
- Display: Playfair Display (títulos)
- Serif: Cormorant Garamond (textos elegantes)
- Sans: Inter (formulários e UI)

---

## 📱 Responsividade

**Desktop (lg+):**
- Formulário lado a lado com info de contato
- Calendário grid 7 colunas completo
- Modal centralizado

**Tablet (md):**
- Layout adaptado
- Calendário mantém 7 colunas
- Botões de material em grid 2 colunas

**Mobile (sm):**
- Layout empilhado (stack)
- Calendário 7 colunas com scroll horizontal
- Botões de material empilhados
- Modal responsivo

---

## 🚀 Fluxo de Uso

1. **Cliente acessa** a seção Contato
2. **Preenche** nome, email, telefone
3. **Seleciona** o serviço desejado
4. **Escolhe** tipo de material
5. **Clica** em uma data disponível no calendário
6. **Adiciona** observações (opcional)
7. **Confirma** o agendamento
8. **Visualiza** resumo com valor no modal
9. **Gera** PDF do comprovativo
10. **Salva/Imprime** o comprovativo

---

## 🛡️ Validações

**Campos Obrigatórios:**
- Todos marcados com asterisco vermelho (*)
- Validação HTML5 nativa
- Alert se tentar submeter incompleto

**Calendário:**
- Não permite selecionar datas passadas
- Não permite selecionar datas lotadas
- Visual claro de status

**Limites:**
- Máximo 3 agendamentos por dia
- Automático e persistente

---

## 🔄 Atualizações Futuras Sugeridas

1. **Integração com Backend**
   - API para salvar agendamentos
   - Sincronização entre dispositivos
   - Notificações por email/SMS

2. **Sistema de Horários**
   - Adicionar seleção de hora
   - Horários específicos (9h, 10h, etc.)
   - Duração estimada do serviço

3. **Pagamento Online**
   - Integração com gateway
   - Sinal/Pagamento antecipado
   - Confirmação automática

4. **Dashboard Admin**
   - Visualizar todos os agendamentos
   - Gerenciar disponibilidade
   - Relatórios e estatísticas

5. **Sistema de Avaliações**
   - Feedback pós-atendimento
   - Galeria de trabalhos realizados
   - Histórico do cliente

---

## 📞 Contatos (Angola)

- **Telefone 1:** +244 923 456 789
- **Telefone 2:** +244 934 567 890
- **E-mail:** contato@maella.com.ao
- **Agendamentos:** agendamento@maella.com.ao

---

## 🎯 Métricas de Sucesso

**O que medir:**
- ✅ Taxa de conversão (visitantes → agendamentos)
- ✅ Dias mais procurados
- ✅ Serviços mais populares
- ✅ Taxa de uso de materiais do salão
- ✅ Downloads de comprovativos

---

**Desenvolvido com ❤️ para o Maella**
*Onde a Beleza tem Luz Própria* ✨

