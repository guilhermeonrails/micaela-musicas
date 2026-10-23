# Spec — Mica Playlist (webapp de cifras para celular)

## 1. Objetivo

Webapp feito só com **HTML, CSS e JavaScript puro** (sem framework, sem build), pensado **exclusivamente para celular em modo retrato**. Mostra uma cifra por vez, ocupando toda a tela. Arrastar para o lado troca de música.

A cifra mostra apenas **acordes organizados em compassos e seções**, sem letra, no estilo visual do [chordsheet.com](https://www.chordsheet.com/) (veja a imagem de referência "Your Song").

## 2. Escopo

### Dentro
- Visualização de cifras em tela cheia, sem rolagem.
- Navegação por swipe horizontal entre músicas.
- Título e tom da música visíveis na cifra.
- Cifras armazenadas em arquivos de texto, um por música.

### Fora
- Letras.
- Layout para desktop/tablet e modo paisagem.
- Offline, PWA e service worker (é só uma página web).
- Transposição, índice de músicas, BPM, contador de posição e Wake Lock.
- Login, backend e banco de dados.

## 3. Repertório (ordem do swipe)

1. Autumn Leaves
2. Somewhere Only We Know
3. Love Me Tender — Elvis Presley (anotação original: 187 / 76 bpm)
4. She Will Be Loved
5. Paradise — Coldplay
6. Just the Way You Are — Bruno Mars
7. Viva la Vida
8. All of Me
9. Só os Loucos Sabem
10. When I Was Your Man — Bruno Mars (anotação original: "solinho torto")
11. Evidências
12. Borboletas
13. Tu Trevo
14. Amei Te Ver
15. Coisa Linda
16. Velha Infância
17. Hey Brother
18. Everybody Wants to Rule the World
19. Vou Deixar
20. Baby
21. Meu Erro

Os nomes foram corrigidos de typos ("Autuum", "Everybody's want"). As anotações entre parênteses vão para o campo `notes` do arquivo e não aparecem na tela, a menos que sejam pedidas depois.

## 4. Estrutura do projeto

```
mica-playlist/
├── index.html
├── css/style.css
├── js/
│   ├── app.js        # swipe, carregamento e estado
│   ├── parser.js     # texto -> objeto da música
│   ├── render.js     # objeto -> DOM da cifra
│   └── fit.js        # auto-ajuste de fonte
├── songs/
│   ├── index.txt     # ordem das músicas (um slug por linha)
│   ├── autumn-leaves.txt
│   ├── your-song.txt
│   └── ...
└── spec.md
```

As cifras são carregadas com `fetch()`, então o app precisa de um servidor HTTP estático (ex.: `python3 -m http.server`). Abrir via `file://` não funciona.

## 5. Formato do arquivo de música (`songs/*.txt`)

Formato próprio, inspirado no ChordPro. Cabeçalho em `chave: valor`, seguido de seções.

```
title: Your Song
artist: Elton John
key: Eb
capo: 3
time: 4/4
notes:

[Intro]
| C | F/C | G/C | F/C |

[Verse] repeat
| C | Fma7 | G/B | Em |
| Am | Am/G | Am/F# | Fma7 |
| C/G | G | E7 | Am |
| C | Dm7 | F | G :1 |
| C :2 |

[Chorus] repeat
| G/B | Am | Dm | F |

[Outro]
| C | F/C | G/C | F/C | C/G fermata |
```

### Regras do parser
- Compassos separados por `|`. Uma linha é uma linha da cifra.
- Dois acordes no mesmo compasso são separados por espaço (ex.: `| C G |`).
- `[Nome]` abre uma seção. O sufixo `repeat` desenha repetição `||: ... :||`.
- `:1` e `:2` marcam casas de repetição (1ª e 2ª vez).
- Marcadores opcionais ao fim do compasso: `fermata`, `D.C.`, `coda`.
- Acorde com baixo: `X/Y`, com `Y` em subscrito.
- Qualidades: `m`, `ma7` (renderiza `MA⁷`), `7`, `m7`, `sus4`, etc., com o sufixo em sobrescrito.
- Linhas inválidas: log no console e a música ainda renderiza o que foi parseado.

## 6. Visual da cifra (estilo chordsheet.com)

Reproduzir o layout da imagem de referência:

- **Cabeçalho:** `key of Eb` pequeno no canto superior esquerdo, **título da música** em small-caps abaixo, artista à direita.
- Linha fina separando o cabeçalho do corpo.
- **Rótulo de seção** (Intro, Verse, Chorus, Coda, Outro) em caixa com borda, sans-serif bold.
- **Compassos** em grade de **4 por linha**, separados por barras verticais.
- **Barras especiais:** dupla no início e fim de seção, `||:` e `:||` para repetição, colchetes `1.` / `2.` acima das casas de repetição.
- **Acordes grandes e em negrito**, em fonte de aparência manuscrita (alternativa livre à fonte da referência: *Patrick Hand*, *Architects Daughter* ou similar). As fontes ficam locais, sem CDN.
- Sufixos (`ma7`, `7`) em sobrescrito, baixos (`/G`) menores e abaixados.
- Preto sobre branco, alto contraste, para leitura em palco.
- Marcador de fim: fermata sobre o último acorde e barra final grossa.

**Tom e título:** mostrar `key of X` (e `Capo N` no título quando houver) e o nome da música. Nenhum outro metadado fica visível.

## 7. Layout em tela cheia e auto-ajuste

- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- Cada música ocupa `100dvh × 100vw`, com `overflow: hidden`, sem barra de rolagem e com `env(safe-area-inset-*)` respeitado.
- **Auto-ajuste (`fit.js`):** depois de renderizar, o app mede a altura do conteúdo e escala o tamanho de fonte base (busca binária entre um mínimo e um máximo) até que a cifra preencha o máximo da tela sem estourar altura nem largura. Roda ao carregar, ao mudar de música e em `resize`.
- Músicas curtas crescem. Músicas longas encolhem até um piso legível (~11px).
- O tamanho é definido por uma variável CSS `--u`, com todo o resto em `em`/`calc(var(--u) * n)`.
- Orientação travada em retrato quando o navegador permitir (`screen.orientation.lock`, com fallback silencioso).

## 8. Navegação por swipe

- Carrossel horizontal com `scroll-snap-type: x mandatory`, um slide por música. O swipe fica nativo e fluido.
- Alternativa se o scroll-snap se mostrar insuficiente: touch events com limiar de 50px e transição `transform`.
- Só o slide atual e os dois vizinhos ficam no DOM. Os demais são montados sob demanda, para que 21 músicas não pesem.
- Swipe para a esquerda avança, para a direita volta.
- Nas pontas (primeira e última) não há loop. O slide só dá um leve "elástico".
- Sem botões na tela, só gesto.
- A música atual é salva em `localStorage` e reaberta na próxima visita.

## 9. Geração das cifras

As 21 cifras ainda não existem. Elas devem ser criadas como arquivos `songs/*.txt`:

1. Avaliar o repositório https://github.com/morluto/rea e verificar se ele fornece dados de acordes ou progressões reaproveitáveis. Usá-lo como fonte quando útil.
2. Para as músicas que o repositório não cobrir, escrever a progressão a partir do conhecimento da harmonia da música.
3. Seguir o mesmo nível de detalhe da imagem de referência: seções (Intro, Verse, Chorus, Bridge, Solo, Outro), compassos, baixos invertidos e extensões (`ma7`, `m7`, `7`).
4. Registrar o tom real e o capo. Músicas em português (Evidências, Borboletas, Tu Trevo etc.) usam as progressões mais conhecidas dos tons tocados no violão.
5. Sinalizar com `notes: revisar` as cifras de que não houver confiança, para que o usuário revise antes do uso ao vivo.

> As cifras são uma transcrição de harmonia, sem letra nem melodia. O usuário deve revisar de ouvido, pois diferentes versões usam harmonias diferentes.

## 10. Requisitos não funcionais

- Roda em Safari iOS e Chrome Android recentes.
- Zero dependências externas em runtime (fontes e scripts locais).
- Carrega a primeira cifra em menos de 1s em 4G.
- Toque sem atraso (`touch-action: pan-x`, sem zoom por duplo toque).
- `user-select: none` e sem menu de contexto, para o swipe não selecionar texto.

## 11. Critérios de aceite

- [ ] Abrir o app mostra a primeira música em tela cheia, sem rolagem, em retrato.
- [ ] Título e `key of X` aparecem em cada cifra, sem letras.
- [ ] Swipe lateral troca para a próxima ou anterior música com snap.
- [ ] A cifra renderizada é visualmente equivalente à imagem de referência (seções em caixa, 4 compassos por linha, repetições, casas 1/2, `ma7` em sobrescrito, baixos com `/`).
- [ ] Todas as 21 músicas têm arquivo em `songs/` e aparecem na ordem de `songs/index.txt`.
- [ ] A fonte se ajusta sozinha em telas de 360×640 até 430×932 sem corte nem rolagem.
- [ ] Reabrir o app volta à última música vista.

## 12. Plano de implementação

1. Estrutura de pastas, `index.html` e CSS base em tela cheia.
2. Parser do formato `.txt` com testes manuais em `Your Song`.
3. Renderizador de compassos, seções, repetições e casas.
4. Auto-ajuste de fonte.
5. Carrossel com swipe e carregamento sob demanda.
6. Escrita das 21 cifras (seção 9).
7. Teste em celular real, ou emulação mobile do DevTools, e ajuste fino do visual.
