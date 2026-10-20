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

O saldo é **estimado**, calculado somente para dias completos com registros: total trabalhado menos a meta diária em dias úteis, com tolerância de **±10 minutos por dia**, inclusive nos limites. Diferenças dentro dessa faixa geram saldo zero; acima dela, a diferença conta por inteiro (com meta de 8 horas: 7h50 e 8h10 zeram o saldo; 7h49 gera −11 min e 8h11 gera +11 min). A tolerância é aplicada antes de somar o saldo mensal e também vale no CSV. As horas trabalhadas, o progresso e a previsão de saída mantêm os valores reais. Aos sábados e domingos, todo o tempo conta como extra. Dias vazios ou pendentes não geram débito. A consulta não fornece feriados, justificativas ou regras de banco de horas. Jornadas que atravessam dias distintos precisam ser conferidas na Senior, pois o agrupamento é diário.

Os tipos preservam os metadados da resposta da API. Campos opcionais têm estados de ausência na interface; versões de aplicativo, plataformas e situações aceitam novos valores. Listas vazias do exemplo usam `unknown[]`, sem presumir um formato não demonstrado. Todas as páginas da consulta são carregadas antes da atualização do painel.

## Acesso

Entre com usuário e senha Senior ou com um token obtido na plataforma. O token de acesso fica em um cookie deste navegador, conforme a implementação de autenticação do projeto. O botão **Sair** remove o token e os registros carregados da sessão.

O aplicativo consulta registros; as marcações continuam sendo feitas na Senior.

## Desenvolvimento

Use Node.js 22.13+ na série 22, Node.js 24 ou Node.js 26+, e Yarn 1.22.22.

```sh
yarn install
yarn dev
```

```sh
yarn test
yarn build
yarn lint
```

Os testes cobrem cálculos de tempo, pendências, previsão de saída, fusos, dias válidos de cada mês, mapeamento e paginação. A resposta de exemplo e seus dados pessoais não são incluídos no repositório.

A atualização e a auditoria das dependências estão registradas em [DEPENDENCY_AUDIT.md](DEPENDENCY_AUDIT.md).

## Docker

A imagem usa Node.js 24 e Yarn 1.22.22 para gerar o build, e Nginx Alpine para servir os arquivos estáticos na porta **80**. O Nginx atende as rotas do React Router, incluindo o acesso direto a `/historico`. Os arquivos com hash em `/assets/` recebem cache de um ano; HTML, service worker e manifest são revalidados para receber novas versões da PWA.

Para executar localmente:

```sh
docker compose up --build -d
```

Acesse <http://localhost:8080>. Para acompanhar os logs e encerrar:

```sh
docker compose logs -f web
docker compose down
```

Também é possível usar a imagem sem Compose:

```sh
docker build -t hmtiw-senior .
docker run --rm -p 127.0.0.1:8080:80 hmtiw-senior
```

O endpoint `GET /health` retorna **200** quando o Nginx consegue servir o `index.html`. O health check já está definido no Dockerfile. A aplicação não precisa de volumes ou variáveis de ambiente para o build atual: as URLs da Senior e do gateway de login estão em `src/services/senior/axios-senior.ts`.

## Deploy no Coolify com GitHub Actions

O workflow [docker-publish.yml](.github/workflows/docker-publish.yml) executa os testes e o lint, compila a aplicação no Docker, publica a imagem no GitHub Container Registry (GHCR) para `linux/amd64` e `linux/arm64` e chama o webhook autenticado do Coolify. O build ocorre no GitHub Actions.

| Branch | Environment do GitHub | Imagem publicada |
| --- | --- | --- |
| `main` | `production` | `ghcr.io/hevertonfreitas/hmtiw-senior:latest` |
| `homolog` | `homolog` | `ghcr.io/hevertonfreitas/hmtiw-senior:homolog` |

Cada publicação também recebe uma tag com o SHA completo do commit, que pode ser usada para fixar uma versão ou fazer rollback. O nome da imagem acompanha o proprietário e o nome do repositório no GitHub, em letras minúsculas.

### Configurar o Coolify

1. Crie uma aplicação do tipo **Docker Image** no servidor e projeto desejados.
2. Configure a imagem `ghcr.io/hevertonfreitas/hmtiw-senior` e a tag `latest` para produção, ou `homolog` em outra aplicação para homologação.
3. Em **Ports Exposes**, use **80**. Configure o domínio com HTTPS; o proxy do Coolify cuida do certificado. Use a porta interna 80 também no health check, caso o configure no painel, com o caminho `/health`.
4. Se o pacote no GHCR for privado, autentique o servidor no registry `ghcr.io` com seu usuário GitHub e um token com permissão `read:packages`. A conexão do repositório com o GitHub não substitui essa autenticação. Consulte [Docker Registries](https://coolify.io/docs/applications/builds/docker-registries).
5. Habilite o acesso à API nas configurações da instância, crie um token com permissão de deploy em **Keys & Tokens > API Tokens** e copie o **Deploy webhook URL** da aplicação em **Webhooks**.

O arquivo `compose.yaml` serve para execução local. Para esse fluxo de publicação, o recurso no Coolify deve consumir a imagem do GHCR.

### Configurar o GitHub

Em **Settings > Environments**, crie `production` e, se usar a branch `homolog`, crie também `homolog`. Adicione os seguintes **environment secrets** em cada ambiente:

| Secret | Valor |
| --- | --- |
| `COOLIFY_WEBHOOK` | URL do webhook de deploy da aplicação correspondente no Coolify. |
| `COOLIFY_TOKEN` | Token da API do Coolify com permissão de deploy. |

O login para publicar no GHCR usa o `GITHUB_TOKEN` fornecido pelo Actions, com `packages: write` definido no workflow. Se a organização restringir essa permissão, libere a publicação de pacotes para o repositório.

Após configurar o recurso e os secrets, um push na branch correspondente publica a imagem e solicita o deploy no Coolify. A conclusão do workflow confirma a chamada ao webhook; o resultado do deploy deve ser acompanhado em **Deployments** no Coolify. Referência: [GitHub Actions no Coolify](https://coolify.io/docs/applications/sources/github/actions).
