/** Título padrão das seções da página /transparencia */

type Props = { tag: string; titulo: string; texto?: string };

export default function TranspSecaoTitulo({ tag, titulo, texto }: Props) {
  return (
    <header className="tp-secao__cab">
      <span className="tp-secao__tag">{tag}</span>
      <h2 className="tp-secao__titulo">{titulo}</h2>
      {texto && <p className="tp-secao__texto">{texto}</p>}
    </header>
  );
}
