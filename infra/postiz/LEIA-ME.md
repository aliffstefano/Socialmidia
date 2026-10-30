# Postiz no Docker Swarm via Portainer

Arquivos: `postiz-stack.yml` (o stack) e `development-sql.yaml` (config do Temporal).

## Requisitos
- Servidor com **4 GB de RAM** ou mais (o Postiz roda com 2 GB, mas Postiz + Elasticsearch + Temporal
  ficam no limite). 2 vCPU.
- **Subdomínio com HTTPS** (ex.: `postiz.seudominio.com.br`). É obrigatório por dois motivos:
  1. a Meta só aceita redirect OAuth em HTTPS;
  2. o Instagram **baixa a imagem pela URL pública do Postiz** na hora de postar. Se `/uploads` não
     estiver acessível pela internet, a postagem falha.
- Traefik já rodando no Swarm (padrão de quem usa Portainer). O stack usa a rede `network_public` e o
  certresolver `letsencryptresolver`. Se no seu Traefik os nomes forem outros, troque no arquivo.

## Passo a passo

1. **DNS:** crie um registro A `postiz` apontando para o IP do manager do Swarm.
2. **Config do Temporal:** Portainer > *Configs* > *Add config*
   - Name: `postiz_temporal_dynamicconfig`
   - Conteúdo: copie o arquivo `development-sql.yaml` desta pasta.
3. **Stack:** Portainer > *Stacks* > *Add stack* > nome `postiz` > *Web editor* > cole o `postiz-stack.yml`.
   Antes de clicar em *Deploy*, troque:
   - `postiz.SEUDOMINIO.com.br` (aparece 4 vezes);
   - `TROCAR_JWT...`, `TROCAR_SENHA_DB` (2 vezes, iguais), `TROCAR_SENHA_TEMPORAL` (2 vezes, iguais);
   - `TROCAR_APP_ID` / `TROCAR_APP_SECRET`: Meta for Developers > seu app > Configurações > Básico.
4. **Deploy.** A primeira subida leva de 3 a 5 minutos. O `postiz` reinicia algumas vezes até o
   Temporal ficar pronto; isso é normal (o Swarm ignora o `depends_on`). Acompanhe os logs do serviço
   `postiz_postiz` até aparecer o backend ouvindo.
5. **App da Meta:** em *Login do Facebook > Configurações > URIs de redirecionamento OAuth válidos*, adicione:
   `https://postiz.SEUDOMINIO.com.br/integrations/social/instagram`
   Permissões: `instagram_basic`, `pages_show_list`, `pages_read_engagement`, `business_management`,
   `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_insights`.
   O app pode ficar em *modo de desenvolvimento*, desde que a sua conta do Facebook seja admin do app.
6. **Conta:** abra `https://postiz.SEUDOMINIO.com.br`, crie o seu usuário e depois troque
   `DISABLE_REGISTRATION` para `"true"` e clique em *Update the stack* (ninguém mais se cadastra).
7. **Conectar Instagram:** *Add channel* > **Instagram (Facebook Business)** > escolha a página da
   unidade de Eldorado primeiro.
8. **Chave da API:** *Settings* > *Public API* > gere a chave. **Não cole no chat.** Cadastre no
   ambiente do Claude como variáveis:
   - `POSTIZ_URL` = `https://postiz.SEUDOMINIO.com.br/api/public/v1`
   - `POSTIZ_API_KEY` = a chave

Com isso o Claude agenda o story de Finados (02/11) da unidade de Eldorado como teste.

## Stickers (enquete, caixinha, quiz): o que o Postiz faz de verdade
Conferido no código-fonte do Postiz (`instagram.provider.ts`, branch main, 30/10/2026):
o story é publicado com `image_url` + `media_type=STORIES`, e as opções do Instagram no Postiz são só
`post_type` (post/story), `collaborators` e `audio` (este, só em Reels). **Não há envio de sticker.**
Não é limitação do Postiz: a API oficial da Meta não aceita sticker em story. Ferramentas que prometem
enquete por API usam acesso não oficial ou "desenham" a enquete na imagem (sem votação real).

Na prática:
- **Sem sticker** (data especial, aviso, frase): o Postiz posta sozinho. Bom para feriado.
- **Com sticker**: continua o fluxo atual (arte + instrução pelo WhatsApp e a equipe põe o sticker no app).
