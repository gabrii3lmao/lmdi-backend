# LetMeDoIt - Backend (Projeto Integrador)

Este repositório contém o backend do **LetMeDoIt**, um sistema automatizado de correção de provas e gestão escolar desenvolvido como parte da disciplina de **Projeto Integrador**.

O objetivo principal deste projeto é otimizar o tempo de docentes através da automação de processos repetitivos, utilizando Inteligência Artificial e processamento assíncrono.

## 🚀 O Problema que Resolvemos

A correção manual de gabaritos (testes de múltipla escolha) é um dos processos mais exaustivos e suscetíveis a erros na rotina de um professor.

**Os principais desafios atacados são:**

1. **Desperdício de Tempo:** Professores gastam horas conferindo gabarito por gabarito.
2. **Erro Humano:** A fadiga leva a erros de contagem ou interpretação das marcações dos alunos.
3. **Escalabilidade:** Corrigir provas para centenas de alunos de uma só vez é um gargalo operacional.
4. **Falta de Centralização:** Dificuldade em manter um histórico organizado de notas por turma e exame.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com uma stack moderna focada em performance e escalabilidade:

- **Node.js & TypeScript:** Runtime e linguagem para um ambiente tipado e seguro.
- **Express:** Framework web para construção da API REST.
- **MongoDB & Mongoose:** Banco de dados NoSQL para armazenamento flexível de exames e submissões.
- **Redis & BullMQ:** Gestão de filas assíncronas para processamento pesado (IA), garantindo que a API nunca trave.
- **Google Gemini AI (Generative AI):** Utilizado para o processamento de OCR e análise semântica das imagens dos gabaritos.
- **Cloudinary:** Armazenamento e transformação de imagens na nuvem.
- **Zod:** Validação rigorosa de esquemas de dados.
- **Nodemailer:** Sistema de recuperação de senhas e notificações por e-mail.

## 🏗️ Arquitetura e Diferenciais Técnicos

Este backend implementa conceitos avançados de engenharia, tais como:

- **Processamento Assíncrono:** Ao enviar fotos das provas, o usuário não precisa esperar a IA responder. O trabalho é delegado para uma fila (Redis), processado em background e o status é atualizado via banco de dados.
- **Pipeline de Imagem:** Antes de enviar para a IA, aplicamos filtros de contraste e escala de cinza via Cloudinary para aumentar a precisão da leitura.
- **Segurança:** Autenticação robusta com hashes Bcrypt e middlewares de proteção de rotas.
- **Padronização:** Arquitetura baseada em Services e Repositories, facilitando a manutenção e testes.

## 📋 Como Rodar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/gabrii3lmao/lmdi-api-backend.git
    npm install
    cd lmdi-api-backend
    ```

2. Configure as Variáveis de Ambiente: Crie um arquivo .env na raiz seguindo o modelo:

    ```
    MONGO_URL: Sua string de conexão do MongoDB.
    REDIS_URL: URL do seu servidor Redis.
    GEMINI_API_KEY: Sua chave da API do Google Gemini.
    CLOUDINARY_URL: Configurações do Cloudinary.
    EMAIL_USER / EMAIL_PASS: Credenciais para envio de e-mail.
    ```

## 🧑‍💻 Autor
Desenvolvido por Gabriel como projeto de estudo e aplicação prática para o Projeto Integrador.
