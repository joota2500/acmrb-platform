/**
 * Conteúdo de reserva (fallback) da página /quem-somos
 * ------------------------------------------------------------
 * São os MESMOS textos reais que estavam na página e que o arquivo
 * supabase/migrations/20261020150000_quem_somos.sql grava no banco.
 * A página usa este conteúdo quando o Supabase está fora do ar, demora
 * mais de 10s ou a tabela quem_somos_conteudo ainda não existe/está vazia.
 * Ao alterar um texto aqui, altere também na migration (e vice-versa).
 */

import type { QuemSomosBloco } from "@/types/quemSomos";

export const QUEM_SOMOS_FALLBACK: QuemSomosBloco[] = [
  {
    "secao": "hero",
    "ordem": 1,
    "rotulo": null,
    "titulo": "Transformando vidas por meio da reciclagem, da dignidade e da inclusão social",
    "subtitulo": "Associação Reciclaê • ACMRB",
    "texto": "A Associação dos Catadores de Materiais Recicláveis de Baturité nasceu da luta diária de trabalhadores que, durante anos, sobreviveram em condições extremamente difíceis no antigo lixão municipal.",
    "icone": null
  },
  {
    "secao": "hero",
    "ordem": 2,
    "rotulo": null,
    "titulo": null,
    "subtitulo": null,
    "texto": "Hoje, a ACMRB representa uma nova oportunidade para dezenas de famílias que buscam renda, reconhecimento, estrutura, inclusão social e valorização do trabalho ambiental.",
    "icone": null
  },
  {
    "secao": "citacao",
    "ordem": 1,
    "rotulo": null,
    "titulo": null,
    "subtitulo": null,
    "texto": "A reciclagem mudou não apenas o meio ambiente, mas também a história de dezenas de famílias em Baturité.",
    "icone": null
  },
  {
    "secao": "historia",
    "ordem": 1,
    "rotulo": null,
    "titulo": "Da luta no lixão à construção de um futuro digno",
    "subtitulo": null,
    "texto": "Uma trajetória marcada pela resistência, pela organização e pela esperança dos catadores de Baturité.",
    "icone": null
  },
  {
    "secao": "timeline",
    "ordem": 1,
    "rotulo": "Décadas anteriores",
    "titulo": "Trabalho no lixão a céu aberto",
    "subtitulo": null,
    "texto": "Por muitos anos, dezenas de famílias sobreviveram coletando materiais recicláveis no antigo lixão municipal de Baturité, enfrentando condições precárias, riscos à saúde e falta de estrutura.",
    "icone": null
  },
  {
    "secao": "timeline",
    "ordem": 2,
    "rotulo": "Processo de organização",
    "titulo": "A união dos catadores",
    "subtitulo": null,
    "texto": "Com o apoio da Secretaria de Meio Ambiente, da Autarquia Municipal e de parceiros, os catadores começaram a se organizar em busca de reconhecimento, dignidade e melhores condições de trabalho.",
    "icone": null
  },
  {
    "secao": "timeline",
    "ordem": 3,
    "rotulo": "2024 – 2025",
    "titulo": "Fechamento do lixão e transição",
    "subtitulo": null,
    "texto": "Com a inauguração do Aterro Sanitário Regional do Maciço de Baturité (2024) e a desativação do antigo lixão, os catadores iniciaram a transição para um modelo de coleta e triagem mais organizado e sustentável.",
    "icone": null
  },
  {
    "secao": "timeline",
    "ordem": 4,
    "rotulo": "10 de julho de 2025",
    "titulo": "Fundação oficial da ACMRB",
    "subtitulo": null,
    "texto": "Nasce formalmente a Associação dos Catadores de Materiais Recicláveis de Baturité (ACMRB – Reciclaê), consolidando a luta por inclusão social, renda digna e valorização do trabalho ambiental.",
    "icone": null
  },
  {
    "secao": "timeline",
    "ordem": 5,
    "rotulo": "Hoje e amanhã",
    "titulo": "Construindo o futuro",
    "subtitulo": null,
    "texto": "A ACMRB segue fortalecendo a coleta seletiva, a educação ambiental, as parcerias ESG e a geração de renda para as famílias associadas, transformando a realidade de Baturité.",
    "icone": null
  },
  {
    "secao": "valor",
    "ordem": 1,
    "rotulo": null,
    "titulo": "Dignidade",
    "subtitulo": null,
    "texto": "Valorizamos cada trabalhador e a sua história de vida.",
    "icone": "Heart"
  },
  {
    "secao": "valor",
    "ordem": 2,
    "rotulo": null,
    "titulo": "Sustentabilidade",
    "subtitulo": null,
    "texto": "Cuidamos do meio ambiente e do futuro das próximas gerações.",
    "icone": "Leaf"
  },
  {
    "secao": "valor",
    "ordem": 3,
    "rotulo": null,
    "titulo": "Inclusão",
    "subtitulo": null,
    "texto": "Promovemos oportunidades reais de renda e reconhecimento.",
    "icone": "Handshake"
  },
  {
    "secao": "valor",
    "ordem": 4,
    "rotulo": null,
    "titulo": "Transparência",
    "subtitulo": null,
    "texto": "Atuamos com clareza, ética e responsabilidade social.",
    "icone": "Scale"
  },
  {
    "secao": "valor",
    "ordem": 5,
    "rotulo": null,
    "titulo": "Trabalho coletivo",
    "subtitulo": null,
    "texto": "A união dos catadores é a base de toda a nossa força.",
    "icone": "Users"
  },
  {
    "secao": "valor",
    "ordem": 6,
    "rotulo": null,
    "titulo": "Educação ambiental",
    "subtitulo": null,
    "texto": "Conscientizamos a comunidade sobre a importância da reciclagem.",
    "icone": "Sun"
  },
  {
    "secao": "atuacao",
    "ordem": 1,
    "rotulo": null,
    "titulo": "Reciclagem e coleta seletiva",
    "subtitulo": null,
    "texto": "Coleta, triagem e destinação correta de materiais recicláveis em Baturité.",
    "icone": "Recycle"
  },
  {
    "secao": "atuacao",
    "ordem": 2,
    "rotulo": null,
    "titulo": "Logística reversa",
    "subtitulo": null,
    "texto": "Retorno de materiais e embalagens ao ciclo produtivo, fortalecendo a economia circular.",
    "icone": "Building2"
  },
  {
    "secao": "atuacao",
    "ordem": 3,
    "rotulo": null,
    "titulo": "Educação ambiental",
    "subtitulo": null,
    "texto": "Ações de conscientização da comunidade sobre o descarte correto dos resíduos.",
    "icone": "Sun"
  },
  {
    "secao": "atuacao",
    "ordem": 4,
    "rotulo": null,
    "titulo": "Valorização humana",
    "subtitulo": null,
    "texto": "Geração de renda, inclusão social e reconhecimento do trabalho dos catadores.",
    "icone": "HeartHandshake"
  },
  {
    "secao": "futuro",
    "ordem": 1,
    "rotulo": "Próximos passos",
    "titulo": "Expansão institucional e novas ações ambientais",
    "subtitulo": null,
    "texto": "A ACMRB busca ampliar sua atuação com educação ambiental, coleta seletiva, novas parcerias ESG, capacitações técnicas, profissionalização operacional e fortalecimento da economia circular em Baturité.",
    "icone": null
  }
];
