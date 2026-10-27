/**
 * /privacidade — como o site trata dados (LGPD), em linguagem simples
 */

import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PreferenciaPrivacidade from "@/components/privacidade/PreferenciaPrivacidade";
import { CONTATO } from "@/lib/contatoInstitucional";
import "@/styles/pagina-privacidade.css";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Como a ACMRB conta as visitas do site e protege os dados de quem se cadastra.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacidadePage() {
  return (
    <>
      <Header />
      <main className="pv">
        <div className="pv__container">
          <h1 className="pv__titulo">Privacidade e cookies</h1>
          <p className="pv__intro">
            A ACMRB respeita a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018). Esta página explica, sem
            complicação, o que o site guarda e por quê.
          </p>

          <h2>Contagem anônima de visitas</h2>
          <p>
            Para saber quantas pessoas visitam o site e quais páginas ajudam mais, guardamos no seu navegador um
            número aleatório (não é seu nome nem seu e-mail) e registramos:
          </p>
          <ul>
            <li>as páginas abertas e quanto tempo você ficou;</li>
            <li>de onde veio (por exemplo, Google ou Instagram);</li>
            <li>tipo de aparelho e navegador (celular, computador, Chrome…);</li>
            <li>cidade, estado e país aproximados.</li>
          </ul>
          <p>
            <strong>Não guardamos o seu endereço de IP.</strong> Quem não criou conta tem esses registros apagados
            automaticamente depois de 24 horas; só ficam totais por dia, que não identificam ninguém.
          </p>
          <PreferenciaPrivacidade />

          <h2>Quem cria uma conta</h2>
          <p>
            Ao se cadastrar, guardamos os dados que você informa (nome, e-mail, telefone, cidade e nascimento) para
            que você use a área de visitantes, peça coletas e converse com a associação. Os acessos feitos enquanto
            você está logado ficam ligados à sua conta e são vistos apenas pelo administrador responsável. Por
            segurança, também registramos tentativas de login (com e-mail parcialmente escondido e sem IP).
          </p>

          <h2>Seus direitos</h2>
          <p>
            Você pode pedir acesso, correção ou exclusão dos seus dados, e a exclusão da sua conta, a qualquer
            momento. Fale com a gente pelo e-mail{" "}
            <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a> ou pelo WhatsApp {CONTATO.whatsappExibicao}.
          </p>

          <h2>Segurança</h2>
          <p>
            As senhas ficam protegidas pelo serviço de autenticação (nunca em texto aberto), as conexões usam HTTPS e
            apenas o administrador autorizado acessa os dados dos visitantes.
          </p>

          <p className="pv__data">Atualizado em outubro de 2026.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
