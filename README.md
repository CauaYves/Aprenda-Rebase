# Aprenda Rebase (Simulador de Git Rebase)

Bem-vindo ao **Aprenda Rebase**, uma plataforma interativa de aprendizado visual focada em desmistificar o funcionamento do `git rebase`. Construído com tecnologias modernas da web, este projeto oferece uma maneira prática e visual de entender um dos comandos mais poderosos e temidos do Git.

## 🚀 Funcionalidades Principais

- **Grafo de Commits Interativo**: Visualização em tempo real de commits, branches e da árvore do repositório. Durante um rebase, você acompanha passo a passo a recriação de commits (com animações fluidas e visualização de "ghost nodes") para entender que o rebase *cria novos hashes* em vez de apenas mover os antigos.
- **Terminal Embutido**: Um terminal in-app que aceita comandos Git básicos (`git commit`, `git checkout`, `git rebase`, etc.) para interagir com o repositório simulado de forma natural.
- **Rebase Interativo Direto no Navegador**: Ao executar `git rebase -i`, um modal interativo se abre, reproduzindo a experiência de um editor de texto para permitir `pick`, `squash`, `drop`, `edit` e `reword` em seus commits, de forma visual e intuitiva.
- **Sistema de Níveis e Desafios**: Progressão gamificada onde você resolve cenários específicos de rebase. Cada nível traz objetivos claros, dicas e um sistema de validação em tempo real para confirmar se você atingiu o estado esperado do repositório.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes ferramentas:

- **[Next.js](https://nextjs.org/) (App Router)** - Framework React para construção da interface e estrutura da aplicação.
- **[React 19](https://react.dev/)** - Biblioteca principal para construção da UI.
- **[Framer Motion](https://www.framer.com/motion/)** - Motor de animações utilizado para as transições de commits e nós do grafo, tornando o aprendizado do rebase visualmente claro.
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização utilitária elegante e design responsivo.
- **[Shadcn/UI](https://ui.shadcn.com/) & [Base UI](https://base-ui.com/)** - Componentes acessíveis e bem desenhados como base para modais e interações complexas.
- **[Lucide React](https://lucide.dev/)** - Ícones limpos e modernos.

## 🧠 Arquitetura Core

O coração do simulador se encontra em `src/lib/git-engine/`. Nós construímos uma engine personalizada do zero que simula o comportamento interno do Git no navegador, gerenciando state do repositório, histórico, referências (HEAD, branches) e o motor de passo-a-passo (step by step) do rebase interativo.

## 🚦 Como Rodar Repositório

### Pré-requisitos
- Node.js (preferencialmente versão LTS)
- NPM, Yarn, pnpm ou Bun

### Passos

1. Instale as dependências:
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

3. Acesse no seu navegador através de [http://localhost:3000](http://localhost:3000).

## 🗂 Estrutura do Projeto

- `src/app/`: Páginas e layout global do Next.js.
- `src/components/`: Componentes da interface.
  - `/challenge/`: Componentes do painel de dicas e desafios.
  - `/graph/`: Renderizador visual da árvore de commits com SVG e Framer Motion.
  - `/rebase/`: Modais para operação de rebase interativo.
  - `/terminal/`: Componente de simulação de terminal.
- `src/hooks/`: Custom hooks utilizados para integrar o Git Engine ao UI global (ex.: `useRepository`, `useTerminal`, `useLevel`).
- `src/lib/git-engine/`: Motor central responsável por todo o state management que imita o backend do Git, validadores e comandos lógicos.
- `src/lib/levels/`: Definições, descrições e estados iniciais para cada nível/desafio de aprendizado.

