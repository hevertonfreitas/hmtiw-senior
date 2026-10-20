# HMTIW Senior

Visualizador de marcações de ponto da Senior, feito com React, TypeScript e Chakra UI.

## O que você acompanha

- Painel diário com horas trabalhadas, intervalos, progresso da meta e previsão de saída.
- Meta calculada a partir da jornada `employee.timeTable`, com ajuste salvo no navegador. Sem jornada informada, o padrão é de 8 horas.
- Linha do tempo com detalhes de cada registro: origem, NSR, dispositivo, conexão, assinatura, localização e sincronização.
- Resumo do mês e gráfico dos últimos sete dias.
- Histórico por mês, ano e situação, com opção de mostrar dias sem registros e exportar os dias filtrados em CSV.
- Dados de empresa, matrícula, turno e centro de custo, além de temas claro e escuro.

## Como os cálculos funcionam

As marcações são ordenadas pelo instante real, respeitando o offset `timeZone`, e agrupadas pela data `dateEvent` informada pela Senior. O dia atual segue o fuso da empresa, com `America/Sao_Paulo` como padrão. Entradas e saídas são inferidas por pares na ordem das marcações; a consulta não informa essa classificação.

Um dia atual com quantidade ímpar de registros acumula tempo até agora, com atualização do contador a cada 30 segundos. Dias anteriores com marcações pendentes contam apenas os pares completos. A previsão de saída considera o tempo restante da meta, sem novas pausas.

O saldo é **estimado**, calculado somente para dias completos com registros: total trabalhado menos a meta diária em dias úteis; aos sábados e domingos, todo o tempo conta como extra. Dias vazios ou pendentes não geram débito. A consulta não fornece feriados, justificativas, tolerâncias ou regras de banco de horas. Jornadas que atravessam dias distintos precisam ser conferidas na Senior, pois o agrupamento é diário.

Os tipos preservam os metadados da resposta da API. Campos opcionais têm estados de ausência na interface; versões de aplicativo, plataformas e situações aceitam novos valores. Listas vazias do exemplo usam `unknown[]`, sem presumir um formato não demonstrado. Todas as páginas da consulta são carregadas antes da atualização do painel.

## Acesso

Entre com usuário e senha Senior ou com um token obtido na plataforma. O token de acesso fica em um cookie deste navegador, conforme a implementação de autenticação do projeto. O botão **Sair** remove o token e os registros carregados da sessão.

O aplicativo consulta registros; as marcações continuam sendo feitas na Senior.

## Desenvolvimento

```sh
yarn install
yarn dev
```

```sh
yarn test --runInBand
yarn build
yarn lint
```

Os testes cobrem cálculos de tempo, pendências, previsão de saída, fusos, dias válidos de cada mês, mapeamento e paginação. A resposta de exemplo e seus dados pessoais não são incluídos no repositório.
