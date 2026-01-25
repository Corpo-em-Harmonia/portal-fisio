
# Portal Fisio

Este projeto é um portal de avaliação e gestão para clínicas de fisioterapia, desenvolvido em Angular, com foco em usabilidade, responsividade e segurança de dados.

## Funcionalidades
- Formulário de Avaliação Fisioterapêutica dinâmico
- Cadastro e listagem de pacientes (leads)
- Navegação entre módulos (avaliação, pacientes, agenda, etc.)
- Upload de arquivos e campos dinâmicos
- Interface moderna baseada em Figma
- Suporte a SSR (Server Side Rendering)

## Estrutura do Projeto
- `src/app/features/avaliacao` — Módulo de avaliação fisioterapêutica
- `src/app/features/pacientes` — Módulo de pacientes/leads
- `src/app/features/agenda` — Módulo de agenda
- `src/app/shared` — Modelos e serviços compartilhados
- `src/styles.scss` — Utilitários e estilos globais

## Como rodar
1. Instale as dependências:
	```bash
	npm install
	```
2. Rode o projeto:
	```bash
	npm start
	```

## Aviso Legal
**Este projeto é proprietário. Não copie, distribua ou reutilize o código-fonte, componentes, estilos ou qualquer parte deste repositório sem autorização expressa do autor.**

O uso não autorizado pode resultar em sanções legais conforme a legislação vigente.

---

# ENGLISH

**This project is proprietary. Do not copy, distribute, or reuse any part of this repository without explicit permission from the author. Unauthorized use may result in legal action.**

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
