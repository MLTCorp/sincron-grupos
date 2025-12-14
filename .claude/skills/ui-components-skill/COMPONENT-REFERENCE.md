# Component Reference Guide

Guia de referência detalhado para cada componente da biblioteca.

---

## Timeline

### Descrição
Timeline vertical animada que responde ao scroll da página. Mostra uma barra de progresso que preenche conforme o usuário rola a página.

### Arquivo
`templates/timelines/timeline.tsx`

### Dependencies

```bash
npm install framer-motion
```

### Props

```typescript
interface TimelineEntry {
  title: string;        // Título do item (ex: "2024", "Q1 2023")
  content: React.ReactNode;  // Conteúdo JSX do item
}

interface TimelineProps {
  data: TimelineEntry[];  // Array de entradas da timeline
}
```

### Uso

```tsx
import { Timeline } from "@/components/ui/timeline";

const data = [
  {
    title: "2024",
    content: (
      <div>
        <p>Descrição do que aconteceu em 2024</p>
        <div className="grid grid-cols-2 gap-4">
          {/* Imagens aqui */}
        </div>
      </div>
    ),
  },
  // Mais itens...
];

export function MyPage() {
  return <Timeline data={data} />;
}
```

### Customização

**Cores da barra de progresso:**
```tsx
// No componente, altere as classes:
className="bg-gradient-to-t from-purple-500 via-blue-500 to-transparent"
// Para suas cores preferidas:
className="bg-gradient-to-t from-green-500 via-teal-500 to-transparent"
```

**Título e subtítulo do header:**
```tsx
// Edite diretamente no componente:
<h2>Seu Título Aqui</h2>
<p>Sua descrição aqui</p>
```

### Responsividade
- Mobile: Timeline na esquerda, títulos inline
- Desktop: Timeline centralizada, títulos sticky na esquerda

---

## Animated Hero

### Descrição
Hero section com texto que alterna automaticamente entre palavras com animação suave de entrada/saída.

### Arquivo
`templates/heroes/animated-hero.tsx`

### Dependencies

```bash
npm install framer-motion lucide-react
npx shadcn@latest add button
```

### Props

O componente Hero não recebe props por padrão. Para customização, edite diretamente:

```typescript
const titles = useMemo(
  () => ["amazing", "new", "wonderful", "beautiful", "smart"],
  []
);
```

### Uso

```tsx
import { Hero } from "@/components/ui/animated-hero";

export function LandingPage() {
  return (
    <main>
      <Hero />
      {/* Outras seções */}
    </main>
  );
}
```

### Customização

**Palavras rotativas:**
```tsx
const titles = useMemo(
  () => ["rápido", "seguro", "moderno", "inovador"],
  []
);
```

**Velocidade da animação:**
```tsx
// Altere o timeout (em ms):
const timeoutId = setTimeout(() => {
  // ...
}, 3000); // Mais lento: 3 segundos
```

**Texto do botão:**
```tsx
<Button variant="secondary" size="sm" className="gap-4">
  Conheça nosso produto <MoveRight className="w-4 h-4" />
</Button>
```

### Responsividade
- Mobile: Fonte menor (text-5xl), padding reduzido
- Desktop: Fonte grande (text-7xl), layout mais espaçoso

---

## Button (Dependência)

### Descrição
Componente Button do shadcn/ui com variantes e tamanhos pré-definidos.

### Arquivo
`templates/dependencies/button.tsx`

### Dependencies

```bash
npm install @radix-ui/react-slot class-variance-authority
```

### Variantes

| Variant | Descrição |
|---------|-----------|
| `default` | Botão primário sólido |
| `destructive` | Ações destrutivas (vermelho) |
| `outline` | Borda com fundo transparente |
| `secondary` | Cor secundária |
| `ghost` | Transparente, hover colorido |
| `link` | Estilo de link |

### Tamanhos

| Size | Altura | Uso |
|------|--------|-----|
| `default` | h-10 | Uso geral |
| `sm` | h-9 | Botões menores |
| `lg` | h-11 | CTAs, destaque |
| `icon` | h-10 w-10 | Apenas ícone |

### Uso

```tsx
import { Button } from "@/components/ui/button";

<Button>Default</Button>
<Button variant="outline" size="lg">Large Outline</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

---

## Utility: cn()

### Descrição
Função utilitária para combinar classes Tailwind de forma inteligente, resolvendo conflitos.

### Arquivo
`templates/dependencies/utils.ts`

### Dependencies

```bash
npm install clsx tailwind-merge
```

### Uso

```tsx
import { cn } from "@/lib/utils";

// Combina classes e resolve conflitos
<div className={cn(
  "px-4 py-2",           // Base
  "bg-red-500",          // Será sobrescrito
  condition && "bg-blue-500",  // Condicional
  className              // Props externas
)} />
```

---

## Padrões de Animação

### Framer Motion Patterns

**Fade In:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Conteúdo
</motion.div>
```

**Slide Up:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Conteúdo
</motion.div>
```

**Stagger Children:**
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map(item => (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

**Scroll Animation:**
```tsx
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start end", "end start"]
});

const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

<motion.div style={{ opacity }}>Conteúdo</motion.div>
```

---

## Troubleshooting

### "Module not found" para @/components/ui

**Solução**: Configure o path alias no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### "cn is not defined"

**Solução**: Crie `lib/utils.ts` com a função cn():

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Animações não funcionam

**Verificar**:
1. `framer-motion` instalado
2. Componente tem `"use client"` no topo
3. Não há conflito de versões

### Estilos Tailwind não aplicados

**Verificar**:
1. Arquivo está no `content` do `tailwind.config.js`
2. Não há classes com typos
3. PostCSS está configurado

---

## Contribuindo

Para adicionar novos componentes:

1. Crie o componente em `templates/{categoria}/`
2. Inclua `"use client"` se usar hooks/interatividade
3. Documente props e dependencies
4. Crie arquivo `-demo.tsx` com exemplo funcional
5. Atualize `INDEX.md` com a nova entrada
6. Adicione seção neste arquivo
