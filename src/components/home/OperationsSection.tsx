"use client";

import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Route,
  Scale,
  FileBarChart,
  Factory,
  Users,
} from "lucide-react";

import "@/styles/operations-section.css";

const steps = [
  {
    number: "01",
    title: "Diagnóstico",
    description:
      "Mapeamento dos pontos de geração, tipos de resíduos e rotina de coleta mais adequada para cada parceiro.",
    icon: ClipboardCheck,
  },
  {
    number: "02",
    title: "Coleta Seletiva",
    description:
      "Organização do recebimento, separação e pesagem dos materiais recicláveis com acompanhamento operacional.",
    icon: Route,
  },
  {
    number: "03",
    title: "Triagem e Valorização",
    description:
      "Classificação dos materiais por categoria, valor estimado e destino ambientalmente correto.",
    icon: Scale,
  },
  {
    number: "04",
    title: "Relatório ESG",
    description:
      "Consolidação de indicadores públicos para apoiar transparência, parcerias e prestação de contas.",
    icon: FileBarChart,
  },
];

const audiences = [
  {
    label: "Empresas",
    text: "Logística reversa, comprovação ambiental e apoio a metas ESG.",
    icon: Factory,
  },
  {
    label: "Comunidade",
    text: "Educação ambiental, geração de renda e fortalecimento da coleta seletiva.",
    icon: Users,
  },
];

export default function OperationsSection() {
  return (
    <section className="operations">
      <div className="operations__container">
        <div className="operations__layout">
          {/* Lado Esquerdo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="operations__left"
          >
            <span className="operations__tag">Operação Integrada</span>

            <h2 className="operations__title">
              Do resíduo ao indicador: uma rotina preparada para parceiros,
              comunidade e transparência.
            </h2>

            <p className="operations__description">
              A ACMRB conecta coleta seletiva, controle de materiais,
              valorização do trabalho dos catadores e dados de impacto em uma
              jornada simples de acompanhar.
            </p>

            <div className="operations__audiences">
              {audiences.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="operations__audience"
                  >
                    <div className="operations__audience-icon">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h4>{item.label}</h4>
                      <p>{item.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Lado Direito - Passos */}
          <div className="operations__steps">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="operations__step"
                >
                  <div className="operations__step-icon">
                    <Icon size={26} />
                  </div>

                  <div className="operations__step-content">
                    <div className="operations__step-header">
                      <span>{step.number}</span>
                      <h3>{step.title}</h3>
                    </div>
                    <p>{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
