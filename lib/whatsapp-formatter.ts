/**
 * Utilitário para formatação de texto estilo WhatsApp
 *
 * Sintaxe suportada:
 * - *texto* → negrito
 * - _texto_ → itálico
 * - ~texto~ → tachado
 * - ```texto``` → monoespaço
 *
 * Referência: https://faq.whatsapp.com/539178204879377/
 */

/**
 * Converte texto com formatação WhatsApp para HTML
 */
export function parseWhatsAppFormatting(text: string): string {
  if (!text) return ""

  let result = escapeHtml(text)

  // Monospace primeiro (``` tem precedência e cancela outras formatações)
  result = result.replace(/```([^`]+)```/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded font-mono text-sm">$1</code>')

  // Bold: *texto*
  result = result.replace(/\*([^*]+)\*/g, '<strong>$1</strong>')

  // Italic: _texto_
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>')

  // Strikethrough: ~texto~
  result = result.replace(/~([^~]+)~/g, '<s>$1</s>')

  // Line breaks
  result = result.replace(/\n/g, '<br />')

  return result
}

/**
 * Escapa caracteres HTML para evitar XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Aplica formatação ao texto selecionado em um textarea
 */
export function applyFormatToSelection(
  textarea: HTMLTextAreaElement,
  formatChar: string
): { newText: string; newSelectionStart: number; newSelectionEnd: number } {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = textarea.value

  const selectedText = text.substring(start, end)
  const before = text.substring(0, start)
  const after = text.substring(end)

  // Se não tem texto selecionado, insere os marcadores e posiciona o cursor entre eles
  if (selectedText.length === 0) {
    const newText = before + formatChar + formatChar + after
    return {
      newText,
      newSelectionStart: start + formatChar.length,
      newSelectionEnd: start + formatChar.length
    }
  }

  // Verifica se o texto já está formatado com esse caractere
  const isAlreadyFormatted =
    selectedText.startsWith(formatChar) && selectedText.endsWith(formatChar)

  if (isAlreadyFormatted) {
    // Remove a formatação
    const unformatted = selectedText.slice(formatChar.length, -formatChar.length)
    const newText = before + unformatted + after
    return {
      newText,
      newSelectionStart: start,
      newSelectionEnd: start + unformatted.length
    }
  }

  // Aplica a formatação
  const formatted = formatChar + selectedText + formatChar
  const newText = before + formatted + after

  return {
    newText,
    newSelectionStart: start,
    newSelectionEnd: start + formatted.length
  }
}

/**
 * Insere texto na posição do cursor
 */
export function insertTextAtCursor(
  textarea: HTMLTextAreaElement,
  insertText: string
): { newText: string; newCursorPos: number } {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = textarea.value

  const before = text.substring(0, start)
  const after = text.substring(end)

  const newText = before + insertText + after

  return {
    newText,
    newCursorPos: start + insertText.length
  }
}

/**
 * Configuração dos botões de formatação
 */
export const FORMATTING_OPTIONS = [
  {
    id: 'bold',
    format: '*',
    label: 'Negrito',
    shortcut: 'Ctrl+B',
    icon: 'Bold'
  },
  {
    id: 'italic',
    format: '_',
    label: 'Itálico',
    shortcut: 'Ctrl+I',
    icon: 'Italic'
  },
  {
    id: 'strikethrough',
    format: '~',
    label: 'Tachado',
    shortcut: 'Ctrl+Shift+S',
    icon: 'Strikethrough'
  },
  {
    id: 'monospace',
    format: '```',
    label: 'Monoespaço',
    shortcut: 'Ctrl+Shift+M',
    icon: 'Code'
  },
] as const

/**
 * Variáveis de personalização disponíveis
 */
export const PERSONALIZATION_VARIABLES = [
  { variable: '{{nome}}', description: 'Nome do contato/grupo' },
  { variable: '{{grupo}}', description: 'Nome do grupo' },
  { variable: '{{data}}', description: 'Data atual (DD/MM/AAAA)' },
  { variable: '{{hora}}', description: 'Hora atual (HH:MM)' },
] as const
