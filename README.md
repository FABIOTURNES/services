# SorteioPromo

Clone moderno de [sorteio.com](https://sorteio.com/) para criar promoções e sorteios oficiais usando publicações do Instagram, Facebook e TikTok.

## Visão geral

O projeto fornece uma landing page responsiva com formulário para cadastrar promoções e uma API Node.js/Express que conversa com as APIs oficiais das redes sociais (Facebook Graph API e TikTok for Developers). Quando os tokens de acesso não estão configurados, o sistema usa dados simulados para permitir testes locais.

## Recursos

- Cadastro de promoções com nome, plataforma, ID/URL da publicação e regra de participação (curtidas e/ou comentários).
- Execução do sorteio com seleção aleatória de vencedores.
- Visualização dos participantes elegíveis em tempo real.
- Integração com Instagram, Facebook e TikTok por meio de chamadas às APIs oficiais.
- Interface responsiva inspirada no design de sorteio.com.

## Como executar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. (Opcional) Crie um arquivo `.env` na raiz com os tokens de acesso obtidos nas plataformas:

   ```ini
   INSTAGRAM_ACCESS_TOKEN=seu_token_instagram
   FACEBOOK_ACCESS_TOKEN=seu_token_facebook
   TIKTOK_ACCESS_TOKEN=seu_token_tiktok
   ```

   > Sem os tokens o sistema utiliza respostas simuladas apenas para testes.

3. Inicie o servidor:

   ```bash
   npm start
   ```

4. Acesse `http://localhost:3000` no navegador para usar a aplicação.

## Estrutura de diretórios

```
├── data/promotions.json       # Armazenamento simples das promoções cadastradas
├── public/                    # Arquivos estáticos da interface web
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src/
│   ├── integrations/          # Integrações com Instagram, Facebook e TikTok
│   └── services/              # Serviços de promoção e participantes
├── server.js                  # API Express
├── package.json
└── README.md
```

## Próximos passos sugeridos

- Persistir promoções em um banco de dados gerenciado.
- Implementar autenticação OAuth para que cada usuário conecte suas próprias contas.
- Criar logs de auditoria exportáveis em PDF/CSV para registro público do sorteio.
