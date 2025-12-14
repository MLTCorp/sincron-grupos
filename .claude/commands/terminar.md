Ao executar este comando:

1. **Gere um resumo da sessão** contendo:
   - O que foi feito - consulte os commits realizados desde o registro no arquivo 'onde_paramos.md' 
   - Próximos passos
   - Contexto importante
   - Progresso estimado (%)

2. **Solicite aprovação** do usuário antes de continuar. Aguarde confirmação.

3. **Após aprovação, salve o arquivo** `onde_paramos.md` no diretório atual com o resumo em Markdown, incluindo o código do último commit.

4. **Envie o resumo ao WhatsApp** via Uazapi com esta requisição:

```bash
curl --request POST \
  --url https://mltcorp.uazapi.com/send/text \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'token: 616cdb89-328f-42d8-9004-b77297aa931c' \
  --data '{
    "number": "120363406229077165@g.us",
    "text": "<mensagem>"
  }'
```

Formato da mensagem WhatsApp:
  📋 Sessão Encerrada

  🗂️ Projeto: [nome do diretório atual]
  📅 Data: [DD/MM/YYYY]

  ✅ O que foi feito:
  • [itens]

  ⏭️ Próximos passos:
  • [itens]

  📊 Progresso estimado: [X]%

  
5. Confirme que o arquivo foi salvo e a mensagem enviada (ou reporte erro).

IMPORTANTE: o encoding do Windows (CP1252) não suporta emojis. Salve o JSON em arquivo UTF-8 