Executar auditoria de seguranca no projeto.

## Instrucoes

1. **Leia a skill de seguranca**: `.claude/skills/security-audit-skill/SKILL.md`
2. **Siga o checklist**: `.claude/skills/security-audit-skill/CHECKLIST.md`

## Arquivos Prioritarios

Analise na seguinte ordem:

1. **Variaveis de ambiente**: `.env.local`, `.env.example`
2. **Rotas de API**: `app/api/**/*.ts`
3. **Services**: `lib/**/*.ts`
4. **Middleware**: `middleware.ts`
5. **Componentes com forms**: `app/**/*form*.tsx`, `app/**/*login*.tsx`

## Output

Gere um relatorio com:

| Severidade | Arquivo | Linha | Vulnerabilidade | Recomendacao |
|------------|---------|-------|-----------------|--------------|
| CRITICO | ... | ... | ... | ... |

## Argumentos

Se um caminho for fornecido como argumento, analise apenas esse arquivo/diretorio.
Caso contrario, faca auditoria completa do projeto.
