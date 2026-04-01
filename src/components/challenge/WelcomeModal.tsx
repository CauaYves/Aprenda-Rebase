"use client";

import { motion, AnimatePresence } from "framer-motion";

type WelcomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-[#1e1e2e] border border-white/10 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8 space-y-6 text-gray-300 font-sans">
              <div className="text-center pb-4 border-b border-white/5">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  Bem-vindo ao Git Rebase Simulator!
                </h1>
                <p className="text-gray-400 text-lg">
                  Entendendo a reescrita de histórico antes de colocarmos a mão na massa.
                </p>
              </div>

              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-emerald-400">#</span> O que é o Rebase?
                  </h2>
                  <p className="leading-relaxed">
                    Em sua essência, o <strong>Git Rebase</strong> pega uma série de commits de uma branch antiga e os <span className="text-emerald-300">"reaplica"</span> um por um em cima de uma nova base de código. Em vez de criar um commit de junção (como o <code className="bg-black/30 px-1.5 py-0.5 rounded text-sm text-emerald-400 font-mono">git merge</code> faz), o rebase literalmente <em>reescreve a história</em> daquele projeto, deixando tudo em uma linha reta limpa.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-cyan-400">#</span> Para que serve?
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-300">
                    <li><strong>Histórico Limpo:</strong> Evita rastros verbosos de <code className="bg-black/30 px-1.5 py-0.5 rounded text-sm text-cyan-400 font-mono">Merge branch 'main' into ...</code> que dificultam a leitura do log do Git.</li>
                    <li><strong>Resolução de Conflitos Previa:</strong> Se várias pessoas mexeram na `main`, ao fazer rebase da sua feature em cima dela, você resolve os conflitos na sua própria área antes de tentar abrir um Pull Request.</li>
                    <li><strong>Aprovação Rápida:</strong> Históricos lineares (uma bolinha depois da outra, sem teias de aranha complexas) facilitam a vida de quem está revisando código via Code Review.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-amber-400">#</span> Quando utilizar?
                  </h2>
                  <p className="leading-relaxed mb-4">
                    Utilize o Git Rebase em <strong>branches locais e particulares</strong> que ainda não foram revisadas ou mescladas por outras pessoas. <br/>
                    A Regra de Ouro do Rebase é: <strong className="text-amber-400">NUNCA faça rebase sobre branches públicas como a `main`</strong>. O Rebase muda hashes de commits. Modificar a base que outras pessoas já baixaram resulta num pandemônio de conflitos!
                  </p>
                </section>

                <section className="bg-black/20 p-5 rounded-lg border border-white/5">
                  <h2 className="text-xl font-bold text-white mb-3">Exemplo Prático</h2>
                  <p className="text-sm mb-3">
                    Imagine que você clonou a `main` e criou uma branch seguindo um padrão rigoroso corporativo:
                  </p>
                  <div className="bg-[#181825] p-3 rounded font-mono text-xs text-gray-400 mb-4 pb-3 border-l-2 border-emerald-400">
                    <span className="text-emerald-400">~/repo $</span> git switch -c user/eu/15843-user-story-integracao/17323-task-para-tal-coisa
                  </div>

                  <p className="text-sm mb-3">
                    Você comitou duas vezes nela, mas enquanto isso, seus colegas de trabalho enviaram três novas alterações para a `main`. Sua branch está velha! Em vez de usar merge pra trazer as fofocas, o fluxo ensinado pelas maiores empresas como Google ou Microsoft é:
                  </p>
                  <div className="bg-[#181825] p-3 rounded font-mono text-xs text-gray-400 border-l-2 border-emerald-400 space-y-1">
                    <div><span className="text-gray-500"># Baixe os commits novos que vieram da sua equipe</span></div>
                    <div><span className="text-emerald-400">~/repo $</span> git fetch origin</div>
                    <div><span className="text-gray-500"># Atualize a main da sua máquina</span></div>
                    <div><span className="text-emerald-400">~/repo $</span> git switch main && git pull</div>
                    <div><span className="text-gray-500"># Volte para a sua branch longa corporativa</span></div>
                    <div><span className="text-emerald-400">~/repo $</span> git switch user/eu/15843-user-story-integracao/17323-task-para-tal-coisa</div>
                    <div><span className="text-gray-500"># Desmonte seus dois commits originários, pule para a ponta atualizada da main, e recrie seus commits lá em cima magicamente!</span></div>
                    <div><span className="text-emerald-400">~/repo $</span> git rebase main</div>
                  </div>
                </section>
              </div>

              <div className="pt-6 flex justify-center border-t border-white/5 mt-4">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-colors duration-200 outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#1e1e2e]"
                >
                  Entendi, bora codar!
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
