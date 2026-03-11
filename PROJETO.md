# Documentação do Projeto: CanteenPay

## 1. Visão Geral
O **CanteenPay** é uma plataforma digital desenhada para modernizar a gestão de consumo em cantinas escolares. O sistema resolve o problema de inadimplência e falha na comunicação entre a escola e os responsáveis, permitindo que os alunos consumam de forma fluida enquanto os pais mantêm controle total em tempo real e recebem faturas consolidadas mensalmente.

## 2. Personas
- **Operador da Cantina:** Registra as compras dos alunos de forma rápida durante o intervalo.
- **Responsáveis (Pais):** Visualizam o extrato de consumo e recebem notificações para pagamento.
- **Aluno:** Identifica-se na cantina (via QR Code ou nome) para realizar a compra.

## 3. Principais Funcionalidades
- **Registro de Consumo:** Interface simplificada para o atendente da cantina lançar produtos e valores.
- **Gestão de Alunos:** Cadastro básico de alunos vinculados a um responsável.
- **Extrato Mensal Automático:** Consolidação de todos os gastos do mês.
- **Simulação de Notificação:** Sistema de "envio" de fatura via e-mail/WhatsApp (simulado no protótipo).
- **Dashboard Financeiro:** Visão clara de quanto foi gasto e o que está pendente de pagamento.
- **Histórico de Registros (V2):** Tabela detalhada na interface principal com o log de todas as vendas diárias e mensais para auditoria imediata.

## 4. Arquitetura do Protótipo
O protótipo foi construído utilizando tecnologias web modernas:
- **HTML5:** Estrutura semântica e acessível.
- **CSS3 (Custom Properties & Flexbox/Grid):** Design premium com foco em UX, utilizando uma estética *Glassmorphism* e paleta de cores vibrante (Indigo & Teal).
- **Vanilla JavaScript (ES6+):** Lógica de estado para gerenciar o carrinho de compras, lista de alunos e geração de faturas sem necessidade de frameworks pesados.

## 5. Instruções de Uso
1. Abra o arquivo `index.html` em qualquer navegador moderno.
2. Na tela da "Cantina", selecione um aluno e adicione itens ao seu consumo.
3. Navegue até a aba de "Relatórios" para ver o fechamento do mês.
4. Clique em "Enviar Fatura" para simular a comunicação com os pais.
