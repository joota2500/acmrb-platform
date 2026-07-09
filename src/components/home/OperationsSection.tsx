"use client";

import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Factory,
  FileBarChart,
  Handshake,
  Route,
  Scale,
} from "lucide-react";

const steps = [
  {
    title: "Diagnóstico",
    description:
      "Mapeamento dos pontos de geração, tipos de resíduos e rotina de coleta mais adequada para cada parceiro.",
    icon: ClipboardCheck,
  },
  {
    title: "Coleta seletiva",
    description:
      "Organização do recebimento, separação e pesagem dos materiais recicláveis com acompanhamento operacional.",
    icon: Route,
  },
  {
    title: "Triagem e valorização",
    description:
      "Classificação dos materiais por categoria, valor estimado e destino ambientalmente correto.",
    icon: Scale,
  },
  {
    title: "Relatório ESG",
    description:
      "Consolidação de indicadores públicos para apoiar transparência, parcerias e prestação de contas.",
    icon: FileBarChart,
  },
];

const audiences = [
  {
    label: "Empresas",
    text: "logística reversa, comprovação ambiental e apoio a metas ESG.",
    icon: Factory,
  },
  {
    label: "Comunidade",
    text: "educação ambiental, geração de renda e fortalecimento da coleta seletiva.",
    icon: Handshake,
  },
];

export default function OperationsSection() {
  return (
    <section className="section-spacing bg-white">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-28"
          >
            <div className="section-tag mb-6">
              Operação integrada
            </div>

            <h2 className="section-title">
              Do resíduo ao indicador: uma rotina preparada para parceiros,
              comunidade e transparência.
            </h2>

            <p className="section-description mt-7">
              A ACMRB conecta coleta seletiva, controle de materiais,
              valorização do trabalho dos catadores e dados de impacto em uma
              jornada simples de acompanhar.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {audiences.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-5"
                  >
                    <Icon className="text-emerald-700" size={24} />
                    <h3 className="mt-4 text-lg font-black text-zinc-900">
                      {item.label}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="grid gap-5">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: index * 0.06 }}
                  viewport={{ once: true }}
                  className="grid gap-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-[4.5rem_1fr]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#E8F3EE] text-[#2E5E4E]">
                    <Icon size={28} />
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-emerald-700">
                        0{index + 1}
                      </span>
                      <h3 className="text-2xl font-black text-zinc-900">
                        {step.title}
                      </h3>
                    </div>

                    <p className="mt-3 max-w-2xl leading-8 text-zinc-600">
                      {step.description}
                    </p>
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
