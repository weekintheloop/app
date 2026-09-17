# Week In The Loop

## Visão geral

Week In The Loop é uma aplicação web desenvolvida para o Google Apps Script, com foco em coleta, organização, análise e visualização de dados de acompanhamento. O projeto reúne módulos para registros de pupilometria, variabilidade da frequência cardíaca (HRV), eletroencefalografia (EEG) e atividade eletrodérmica (EDA), além de painéis combinados, relatórios e rotinas administrativas. A aplicação utiliza páginas HTML servidas pelo `HtmlService` e serviços `.gs` executados no ambiente do Google, sendo adequada para implantação em `script.google.com`.

## Estrutura essencial

O ponto de entrada do servidor está concentrado em `Code.gs`, enquanto `Index.html`, `Header.html`, `Footer.html`, `Sidebar.html` e `Stylesheet.html` compõem a interface. A comunicação entre navegador e servidor ocorre por chamadas do cliente para funções Apps Script, apoiadas por `FrontendApi.gs`, `ApiEndpoints.gs` e `ApiClient.html`.

Os serviços de dados incluem `DataService.gs`, `DataProcessor.gs`, `DataAggregatorService.gs`, `DataAnalysisService.gs` e `DataVisualizationService.gs`. Os arquivos `DataChartsEEG.html`, `DataChartsEDA.html`, `DataChartsHRV.html`, `DataChartsPupilometry.html` e `DataChartsCombined.html` oferecem visualizações especializadas. Relatórios são tratados por `ReportService.gs`, `ReportGeneratorService.gs`, `ReportScheduler.gs` e suas respectivas telas.

## Configuração e dados

Antes da publicação, revise `Config.gs`, `PropertiesService.gs`, `SettingsService.gs` e `appsscript.json`. IDs de planilhas, pastas do Drive, chaves de APIs e demais segredos devem ser armazenados em `PropertiesService`, nunca diretamente em arquivos HTML ou no código versionado. O projeto possui integrações com Sheets, Drive, Docs, Forms, Calendar, Tasks, Groups, serviços de tradução, fala e diversos serviços Google Cloud. Somente APIs realmente utilizadas devem ser habilitadas no projeto Google Cloud associado.

O acesso aos dados deve passar pelos serviços e utilitários existentes, especialmente `SpreadsheetUtils.gs`, `SheetService.gs`, `GoogleSheetsService.gs` e `LockService.gs`. Operações concorrentes ou em lote precisam respeitar as cotas do Apps Script. Cache, filas e bloqueios devem ser usados para evitar leituras repetidas e colisões de escrita.

## Boas práticas de codificação

- Mantenha `FrontendApi.gs` e `ApiEndpoints.gs` como fronteira pública do backend. Evite chamar serviços internos diretamente a partir de várias páginas e centralize `google.script.run` em um cliente com handlers de sucesso, falha e estado de carregamento.
- Retorne respostas previsíveis, por exemplo `{ ok, data, error, meta }`, sem enviar objetos `Error`, dados clínicos ou detalhes internos ao navegador.
- Use `const` por padrão, `let` somente quando houver reatribuição e nomes `camelCase` para funções e variáveis, `PascalCase` para tipos conceituais e `UPPER_SNAKE_CASE` para constantes.
- Documente funções públicas e estruturas de dados com JSDoc. Prefira funções curtas, com uma responsabilidade, retornos antecipados e no máximo poucos níveis de aninhamento.
- Leia intervalos completos com `getValues()`, processe em memória e grave com `setValues()`. Não intercale `getValue()` e `setValue()` dentro de loops.
- Proteja atualizações concorrentes com `LockService`, sempre liberando o bloqueio em `finally`. Use cache apenas para dados reconstruíveis e defina TTL explícito.
- Valide tipo, formato, faixa, unidade, identidade e autorização no servidor. A validação do HTML melhora a experiência, mas não é uma barreira de segurança.
- Registre identificador de correlação, operação, duração e resultado; não registre tokens, chaves, conteúdo biométrico bruto ou informações pessoais desnecessárias.
- Crie testes para agregações, filtros, importações, permissões e contratos de resposta. Mudanças nos gráficos devem ser verificadas com dados vazios, extremos e parcialmente ausentes.

## Implantação

1. Crie ou abra um projeto em `script.google.com`.
2. Transfira os arquivos mantendo seus nomes e extensões.
3. Ajuste o manifesto `appsscript.json`, o fuso horário e os escopos OAuth.
4. Configure propriedades, planilhas e pastas necessárias.
5. Execute manualmente uma função de inicialização para conceder autorizações.
6. Publique em **Implantar > Nova implantação > Aplicativo da Web**.
7. Defina cuidadosamente quem executa o aplicativo e quem pode acessá-lo.

## Segurança e operação

Autenticação e sessão são atendidas por `AuthService.gs`, `AuthUtils.gs` e `SessionManager.gs`. Entradas devem ser validadas e higienizadas por `Validation.gs`, `FormValidationService.gs` e `HtmlSanitizer.gs`. Revise permissões administrativas antes de expor páginas `Admin*`. Logs, auditoria, backup, saúde do sistema e tratamento de falhas estão distribuídos entre `Logger.gs`, `AdminAuditLog.html`, `BackupService.gs`, `AdminSystemHealth.html` e `ErrorHandling.gs`. Para manutenção, consulte também `arquitetura_projeto.md` e `INTEGRATION.md`.
