# UI Components Library Index

Catálogo de componentes UI disponíveis para integração rápida em projetos React/Next.js.

## Categorias

### Timelines

| Componente | Descrição | Dependencies | Complexity |
|------------|-----------|--------------|------------|
| `timeline` | Timeline vertical animada com scroll progress | framer-motion | Medium |

### Heroes

| Componente | Descrição | Dependencies | Complexity |
|------------|-----------|--------------|------------|
| `animated-hero` | Hero section com texto rotativo animado | framer-motion, lucide-react, button | Medium |

### Cards (Em desenvolvimento)

| Componente | Descrição | Dependencies | Complexity |
|------------|-----------|--------------|------------|
| `bento-grid` | Grid estilo Bento com cards variados | TBD | Medium |
| `3d-card` | Card com efeito 3D no hover | framer-motion | High |
| `feature-card` | Card para features com ícone | lucide-react | Low |

### Sections (Em desenvolvimento)

| Componente | Descrição | Dependencies | Complexity |
|------------|-----------|--------------|------------|
| `features-section` | Seção de features com grid | lucide-react | Medium |
| `testimonials` | Carousel de depoimentos | framer-motion | High |
| `pricing-table` | Tabela de preços comparativa | button, card | Medium |

## Quick Start

### 1. Verificar Requisitos

```bash
# Verificar se o projeto tem shadcn configurado
ls components/ui/

# Verificar Tailwind
ls tailwind.config.*
```

### 2. Instalar Dependências Base

```bash
npm install framer-motion lucide-react
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

### 3. Adicionar Utilitário cn()

Criar `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Estrutura de Arquivos

```
templates/
├── timelines/
│   ├── timeline.tsx
│   └── timeline-demo.tsx
├── heroes/
│   ├── animated-hero.tsx
│   └── animated-hero-demo.tsx
├── cards/
│   └── (em desenvolvimento)
├── sections/
│   └── (em desenvolvimento)
└── dependencies/
    ├── button.tsx
    └── utils.ts
```

## Padrões de Uso

### Integrando um Componente

1. Copie o arquivo `.tsx` para `components/ui/`
2. Verifique e instale dependências
3. Use o arquivo `-demo.tsx` como referência
4. Substitua imagens placeholder por Unsplash
5. Customize textos e estilos conforme necessário

### Imagens Unsplash Recomendadas

```typescript
// Tech/Coding
"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop"

// Business Dashboard
"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=500&fit=crop"

// Team Working
"https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=500&fit=crop"

// Collaboration
"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=500&fit=crop"

// Code Editor
"https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=500&fit=crop"

// Laptop Work
"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=500&fit=crop"
```

## Complexity Legend

- **Low**: Componente simples, poucos props, sem estado complexo
- **Medium**: Componente com animações ou estado, precisa de algumas dependências
- **High**: Componente complexo com múltiplas animações, estados ou configurações

## Adicionando Novos Componentes

Para adicionar um novo componente à biblioteca:

1. Crie o arquivo do componente em `templates/{categoria}/`
2. Crie o arquivo de demo em `templates/{categoria}/-demo.tsx`
3. Atualize este INDEX.md com as informações
4. Documente todas as dependências necessárias
5. Substitua imagens placeholder antes de salvar

---

**Total de Componentes**: 2 disponíveis, 6+ em desenvolvimento
**Última Atualização**: Dezembro 2024
