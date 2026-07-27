"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Recycle,
  Truck,
  ShieldCheck,
} from "lucide-react";

import "@/styles/reverse-logistics.css";

const services = [
  {
    icon: Truck,
    title: "Coleta Programada",
    description:
      "Planejamento e execução de coleta seletiva para empresas, órgãos públicos e instituições.",
  },
  {
    icon: Recycle,
    title: "Destinação Correta",
    description:
      "Encaminhamento ambientalmente adequado de resíduos recicláveis e reaproveitáveis.",
  },
  {
    icon: Building2,
    title: "Parcerias Institucionais",
    description:
      "Soluções sustentáveis voltadas para responsabilidade socioambiental corporativa.",
  },
  {
    icon: ShieldCheck,
    title: "Indicadores ESG",
    description:
      "Relatórios de impacto ambiental e apoio às metas de sustentabilidade organizacional.",
  },
];

export default function ReverseLogisticsSection() {
  return (
    <section className="reverse">
      <div className="reverse__bg" />

      <div className="reverse__container">
        <div className="reverse__layout">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="reverse__left"
          >
            <span className="reverse__tag">Logística Reversa</span>

            <h2 className="reverse__title">
              Soluções ambientais para empresas, instituições e parceiros.
            </h2>

            <p className="reverse__description">
              A ACMRB atua no desenvolvimento de ações de logística reversa,
              coleta seletiva e destinação ambientalmente adequada de resíduos,
              fortalecendo práticas sustentáveis e metas ESG.
            </p>

            <div className="reverse__features">
              <div className="reverse__feature">
                <h3>Gestão Sustentável</h3>
                <p>
                  Estruturação de processos sustentáveis para descarte e
                  reaproveitamento de materiais recicláveis.
                </p>
              </div>

              <div className="reverse__feature">
                <h3>Responsabilidade Ambiental</h3>
                <p>
                  Apoio a organizações que buscam fortalecer ações ambientais e
                  indicadores ESG.
                </p>
              </div>
            </div>

            <a href="#contato" className="reverse__btn">
              Solicitar parceria
              <ArrowRight size={18} />
            </a>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="reverse__services"
          >
            {services.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="reverse__service"
                >
                  <div className="reverse__service-icon">
                    <Icon size={24} />
                  </div>

                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
