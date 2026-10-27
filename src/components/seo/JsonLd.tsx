/**
 * JsonLd — insere dados estruturados (schema.org) na página
 * ------------------------------------------------------------
 * Componente de servidor. O "<" é trocado por \u003c para o conteúdo
 * nunca conseguir fechar a tag <script> (segurança).
 */

type Props = { dados: Record<string, unknown> | Record<string, unknown>[] };

export default function JsonLd({ dados }: Props) {
  const json = JSON.stringify(dados).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
