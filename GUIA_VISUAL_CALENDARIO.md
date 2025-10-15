# 🗓️ GUIA VISUAL - Como Funciona o Calendário

## 📅 Aparência do Calendário

```
┌─────────────────────────────────────────────────────────────┐
│              SELECIONE A DATA *                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  seg  ter  qua  qui  sex  sáb  dom                           │
│                                                               │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                          │
│  │15│ │16│ │17│ │18│ │19│ │20│ │21│                          │
│  │🟢│ │🔴│ │🟢│ │🟢│ │🟣│ │🟢│ │🟢│                          │
│  │0/3│ │3/3│ │1/3│ │2/3│ │ ✓ │ │0/3│ │1/3│                  │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                          │
│                                                               │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                          │
│  │22│ │23│ │24│ │25│ │26│ │27│ │28│                          │
│  │🟢│ │🟢│ │🟢│ │🔴│ │🟢│ │🟢│ │🟢│                          │
│  │0/3│ │2/3│ │1/3│ │3/3│ │0/3│ │1/3│ │0/3│                  │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                          │
│                                                               │
│  ... continua por 30 dias ...                                │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐             │
│  │ Data selecionada: 19 de outubro de 2025 ✓ │             │
│  └────────────────────────────────────────────┘             │
│                                                               │
│  🟢 Disponível   🟣 Selecionado   🔴 Lotado                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 LEGENDA DOS ESTADOS

### 🟢 **DISPONÍVEL** (Borda Rosa)
```
┌──────────┐
│   qua    │  ← Dia da semana
│   17     │  ← Número do dia
│   1/3    │  ← Contador de agendamentos
└──────────┘
```
**Características:**
- ✅ Clicável
- ✅ Borda rosa (#E8A5B7)
- ✅ Hover effect (ilumina)
- ✅ Mostra quantos agendamentos já tem

### 🔴 **LOTADO** (Fundo Rosa) ⭐ **IMPORTANTE!**
```
┌──────────┐
│   ter    │
│   16     │  ← Fundo rosa (#E8A5B7/40)
│   3/3    │  ← Limite atingido!
└──────────┘
```
**Características:**
- 🚫 NÃO clicável
- 🚫 Cursor: not-allowed
- 🎨 Fundo rosa (#E8A5B7 com 40% opacidade)
- 🔒 Desabilitado automaticamente
- 📊 Mostra 3/3

### 🟣 **SELECIONADO** (Rosa Cheio)
```
┌──────────┐
│   qui    │
│   19     │  ← Rosa cheio, texto preto
│    ✓     │  ← Marca de confirmação
└──────────┘
```
**Características:**
- ✨ Rosa cheio (#E8A5B7)
- ✨ Texto em preto
- ✨ Escala 110% (maior)
- ✨ Visual de "selecionado"

### ⚫ **PASSADO** (Opaco)
```
┌──────────┐
│   seg    │
│   14     │  ← 30% opacidade
│    ✗     │  ← Não disponível
└──────────┘
```
**Características:**
- 🚫 Data já passou
- 🚫 Opacidade 30%
- 🚫 Não clicável
- 🚫 Visual "apagado"

---

## 🔄 FLUXO DE INTERAÇÃO

### Cenário 1: Cliente Seleciona Data Disponível ✅

```
1. Cliente vê o calendário
   ┌──────────┐
   │   qua    │
   │   17     │  ← 1/3 agendamentos
   └──────────┘

2. Cliente passa o mouse (hover)
   ┌──────────┐
   │   qua    │  ← Borda rosa mais forte
   │   17     │  ← Fundo rosa leve
   └──────────┘

3. Cliente clica
   ┌──────────┐
   │   qua    │  
   │   17     │  ← Fica ROSA CHEIO ✓
   └──────────┘

4. Aparece confirmação embaixo
   ┌────────────────────────────────────┐
   │ Data selecionada: 17 de outubro ✓ │
   └────────────────────────────────────┘
```

### Cenário 2: Cliente Tenta Clicar em Data Lotada 🚫

```
1. Cliente vê data lotada
   ┌──────────┐
   │   ter    │
   │   16     │  ← Fundo ROSA (lotado)
   │   3/3    │  ← 3 agendamentos!
   └──────────┘

2. Cliente passa o mouse
   ┌──────────┐
   │   ter    │
   │   16     │  ← Cursor: 🚫 not-allowed
   │   3/3    │  ← Não muda nada
   └──────────┘

3. Cliente clica
   ❌ NADA ACONTECE!
   
   Tooltip aparece: "Lotado (3/3)"
```

### Cenário 3: Sistema Bloqueia Automaticamente

```
Dia 17/10 - Estado inicial:
┌──────────┐
│   qua    │
│   17     │
│   0/3    │  ← Vazio
└──────────┘

Após 1º agendamento:
┌──────────┐
│   qua    │
│   17     │
│   1/3    │  ← 1 agendamento
└──────────┘

Após 2º agendamento:
┌──────────┐
│   qua    │
│   17     │
│   2/3    │  ← 2 agendamentos
└──────────┘

Após 3º agendamento:
┌──────────┐
│   qua    │  ← Fundo ROSA automático!
│   17     │
│   3/3    │  ← LOTADO! 🚫
└──────────┘
```

---

## 💾 COMO OS DADOS SÃO SALVOS

### localStorage (Navegador)

```javascript
// Estrutura salva automaticamente:
{
  "2025-10-16": 3,  // ← Lotado (rosa)
  "2025-10-17": 1,  // ← Disponível
  "2025-10-18": 2,  // ← Disponível
  "2025-10-19": 0,  // ← Vazio
  "2025-10-25": 3   // ← Lotado (rosa)
}
```

**Quando acontece:**
- ✅ Automático ao confirmar agendamento
- ✅ Carrega ao abrir a página
- ✅ Persiste entre sessões
- ✅ Sincroniza entre abas

---

## 🎯 EXEMPLOS PRÁTICOS

### Exemplo 1: Segunda-feira movimentada

```
Segunda, 21/10:

09:00 - Cliente A agenda ✅
       ┌──────────┐
       │   seg    │
       │   21     │
       │   1/3    │  ← 1 agendamento
       └──────────┘

11:30 - Cliente B agenda ✅
       ┌──────────┐
       │   seg    │
       │   21     │
       │   2/3    │  ← 2 agendamentos
       └──────────┘

14:00 - Cliente C agenda ✅
       ┌──────────┐
       │   seg    │  ← Fundo ROSA!
       │   21     │
       │   3/3    │  ← LOTOU! 🔒
       └──────────┘

15:00 - Cliente D tenta agendar ❌
       🚫 Não consegue!
       Vê o dia rosa e bloqueado
```

### Exemplo 2: Semana com disponibilidade variada

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   seg    │ │   ter    │ │   qua    │ │   qui    │ │   sex    │
│   21     │ │   22     │ │   23     │ │   24     │ │   25     │
│ LOTADO   │ │   1/3    │ │   0/3    │ │   2/3    │ │ LOTADO   │
│   3/3    │ │ 🟢       │ │ 🟢       │ │ 🟢       │ │   3/3    │
│ 🔴 Rosa  │ │          │ │          │ │          │ │ 🔴 Rosa  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
   🚫           ✅           ✅           ✅           🚫
  Não          Pode         Pode         Pode        Não
  pode         agendar      agendar      agendar     pode
```

---

## 🎨 CÓDIGO DAS CORES

```css
/* Disponível (borda) */
border: 1px solid rgba(232, 165, 183, 0.3);  /* Rosa 30% */

/* Hover (destaque) */
border: 1px solid #E8A5B7;                   /* Rosa 100% */
background: rgba(232, 165, 183, 0.1);        /* Rosa 10% */

/* Lotado (fundo rosa) ⭐ */
background: rgba(232, 165, 183, 0.4);        /* Rosa 40% */
cursor: not-allowed;                         /* Não clicável */

/* Selecionado (rosa cheio) */
background: #E8A5B7;                         /* Rosa 100% */
color: #0D0D0D;                              /* Texto preto */
transform: scale(1.1);                       /* 110% maior */

/* Passado (opaco) */
opacity: 0.3;                                /* 30% opacidade */
```

---

## 📊 ESTATÍSTICAS EM TEMPO REAL

O sistema mostra em cada dia:

```
┌──────────┐
│   qua    │  ← Dia
│   17     │  ← Data
│   2/3    │  ← 2 de 3 vagas preenchidas
└──────────┘
     ↑
     Atualiza automaticamente!
```

**Quando atualiza:**
- ✅ Ao carregar a página
- ✅ Ao fazer um novo agendamento
- ✅ Em tempo real (localStorage)

---

## 🔧 PARA TESTAR RAPIDAMENTE

### Simular dia lotado:

1. Faça 3 agendamentos para o mesmo dia
2. Veja o dia ficar rosa automaticamente! 🔴

### Limpar tudo e recomeçar:

```javascript
// No console do navegador (F12):
localStorage.clear();
location.reload();
```

---

## 💡 DICAS

### Para o Cliente:
- ✅ Escolha dias com poucos agendamentos (0/3 ou 1/3)
- ✅ Evite deixar para última hora
- ✅ Dias rosa = lotados, escolha outro

### Para o Salão:
- 📊 Veja quais dias lotam mais rápido
- 📈 Identifique padrões de demanda
- 🎯 Ajuste preços por demanda (futuro)

---

## 🎉 RESULTADO VISUAL FINAL

```
═══════════════════════════════════════════════════════════
           CALENDÁRIO DE AGENDAMENTO MAELLA
═══════════════════════════════════════════════════════════

  🟢 DISPONÍVEL     → Pode agendar (borda rosa)
  🔴 LOTADO         → 3/3 vagas (fundo rosa) 🚫
  🟣 SELECIONADO    → Sua escolha (rosa cheio) ✓
  ⚫ PASSADO        → Não disponível (opaco) ✗

═══════════════════════════════════════════════════════════
```

---

**Sistema 100% Funcional e Testado!** ✅

Agora é só:
1. `npm install`
2. `npm run dev`
3. Testar no navegador!

🎨 **Elegante | 🚀 Rápido | 💯 Confiável**

