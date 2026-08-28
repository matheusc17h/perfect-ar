# Perfect Ar — Site

Site institucional de página única para o serviço de **higienização e climatização de
ar-condicionado** (residencial e comercial) em **Sorocaba e região**. Também divulga a
instalação de aparelhos. Orçamentos pelo WhatsApp.

## Stack
- Vite 5 + HTML/CSS/JS puro (sem framework)
- Fontes: Montserrat + Inter (Google Fonts)

## Rodar localmente
```bash
npm install
npm run dev
```
Abre em http://localhost:5174/

## Build de produção
```bash
npm run build
npm run preview
```
O site final fica na pasta `dist/`.

## Estrutura das seções
| Seção | O que é |
|---|---|
| Hero (home) | Vídeo de fundo + chamada principal e CTA de WhatsApp |
| Serviços | Higienização simples/completa, instalação, climatização/manutenção |
| Por que higienizar | Conteúdo educativo (limpo x sujo, riscos, quando procurar, manutenção) + benefícios |
| Resultados | Comparadores **antes/depois** interativos (arraste a barra) |
| O trabalho | Vídeo real à esquerda + descrição à direita |
| Sobre mim | Texto do proprietário |
| Contato | CTA final com WhatsApp e Instagram |

## Mídia (`public/media/`)
| Arquivo | Origem | Uso |
|---|---|---|
| `hero-fallback.mp4` | recorte do vídeo original | fundo provisório da home |
| `hero-bg.mp4` | **gerado via Higgsfield** | fundo definitivo da home — assim que o arquivo existir aqui, o site troca sozinho |
| `trabalho.mp4` | `video/video-inspiraçao-home.mp4` | seção "O trabalho" |
| `resultado-1-*.jpg` | `img/referencia-trabalho.png` (dividida) | comparador antes/depois 1 |
| `resultado-2-*.jpg` | `img/referencia-trabalho2.png` (dividida) | comparador antes/depois 2 |

As pastas `img/` e `video/` na raiz são as referências originais e **não são usadas pelo build**.

## Ainda para ajustar
- **Sobre mim**: o texto atual é um rascunho (marcado com comentário `EDITE ESTE TEXTO`
  no `index.html`). Substitua pela história/experiência reais do proprietário.
- **Vídeo de fundo da home**: quando a geração do Higgsfield terminar, salve o arquivo
  como `public/media/hero-bg.mp4`.

## Contato configurado
- WhatsApp: (11) 98713-9462 → `https://wa.me/5511987139462`
- Instagram: @perfectar.oficial
