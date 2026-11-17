/**
 * PaginaInterna — moldura das páginas da área do visitante e da coleta
 * ------------------------------------------------------------
 * Header + faixa de título (etiqueta, título, texto e botão opcionais)
 * + conteúdo + Footer. Usada em /mensagens, /minha-conta, /minhas-coletas,
 * /agendar-coleta e /calendario-coleta.
 */
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";

type Props = {
  etiqueta: string;
  titulo: string;
  descricao?: string;
  /** Botão ou link logo abaixo do texto */
  acao?: React.ReactNode;
  /** Conteúdo mais largo (ex.: lista de coletas); o padrão é a coluna estreita */
  largo?: boolean;
  children: React.ReactNode;
};

export default function PaginaInterna({ etiqueta, titulo, descricao, acao, largo = false, children }: Props) {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] bg-[linear-gradient(180deg,#f0fdf4_0%,#fff_40%)] pb-10 pt-22 sm:pb-16 lg:pt-28">
        <Container tamanho={largo ? "largo" : "estreito"} className={largo ? "max-w-6xl" : "max-w-3xl"}>
          <header className="mb-7 flex flex-col items-center gap-2.5 text-center">
            <Badge tom="marca">{etiqueta}</Badge>
            <h1 className="text-2xl font-black leading-tight text-ink sm:text-3xl">{titulo}</h1>
            {descricao && <p className="max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">{descricao}</p>}
            {acao}
          </header>
          {children}
        </Container>
      </main>
      <Footer />
    </>
  );
}
