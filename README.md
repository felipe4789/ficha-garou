# Ficha Garou

Aplicativo Android de ficha editável para **Lobisomem: O Apocalipse, segunda edição**, em português. Interface grafite, sem imagens decorativas, com informações e edição como prioridade. Funciona sem conexão e sem conta.

## Usar no Android

O instalador de desenvolvimento está em `output/ficha-garou.apk`. Requer Android 8.0 (API 26) ou superior e Android System WebView atualizado (98 ou superior). O APK é assinado com chave local de desenvolvimento; não é uma publicação na Play Store.

As fichas são salvas automaticamente no armazenamento privado do aplicativo. Para transferir os dados ou protegê-los antes de desinstalar, use **Meus personagens → Exportar backup**. A importação adiciona cópias, sem substituir fichas existentes. Desinstalar o aplicativo apaga as fichas locais.

## Navegação

- **Ficha:** identidade, recursos permanentes e temporários, vitalidade, posto e experiência.
- **Traços:** atributos base e efetivos, habilidades, especializações, antecedentes, outras características e renome.
- **Dons:** dons, rituais e fetiches, com nível e anotações editáveis.
- **Combate:** atributos da forma, vitalidade, armas e manobras, armadura, cicatrizes e deformidade. Ao final, Tabela de Briga para consulta com Morder, Encontrão, Garra, Engalfinhar, Chutar e Socar; inclui teste, dificuldade, dano e indicação de dano agravado.
- **Notas:** anotações gerais em destaque, ocupando a área inicial disponível; abaixo, notas da crônica, história, personalidade e aparência, em uma coluna. As anotações gerais têm um campo separado e não substituem os textos antigos da crônica.

Os cinco botões fixos selecionam Hominídeo, Glabro, Crinos, Hispo e Lupino. Usam os desenhos originais de corpo inteiro em contorno acima dos nomes, recortados da opção 2 aprovada, sem redesenho. A origem e os recortes estão registrados em `assets/forms/source-crops.json`, e os arquivos usados pelo app ficam em `web/forms/`. O fundo da prancha é mesclado por CSS. Os modificadores são derivados dos atributos base, sem acumular bônus ao alternar entre formas. Na edição dos atributos, os círculos representam a base; o número ao lado mostra o valor efetivo. Aparência é zero em Crinos e atributos não ficam negativos. A forma não gasta Fúria nem executa testes automaticamente.

O ícone do aplicativo é o lobo branco uivando sobre rocha, com arco e fundo grafite escurecido aprovado. A imagem selecionada fica em `assets/app-icon-selected.png` e a versão preparada em `assets/app-icon.png`. O script `scripts/prepare-launcher-icon.mjs` exporta as densidades Android e o ícone adaptativo. Os prompts da exploração e da edição do ícone estão em `assets/IMAGE_PROMPTS.md`.

A engrenagem abaixo das formas abre Configurações. O tema grafite está fixo nesta versão; as demais preferências serão definidas com o usuário. Os cinco botões de categorias podem ser reorganizados segurando por cerca de meio segundo e arrastando. A ordem fica salva neste aparelho, separadamente das fichas. No teclado, use Alt + setas sobre um botão.

O gesto de voltar pelas duas bordas usa a navegação do Android. Primeiro fecha a janela aberta, depois retorna à categoria anterior e à posição de rolagem anterior. Na tela inicial, o Android fecha a atividade normalmente. O teclado é tratado pelo próprio sistema. Home e aplicativos recentes continuam sendo gestos do sistema.

Em Dons ou Rituais, **Adicionar** abre um catálogo em ordem alfabética com busca sem distinção de acentos e maiúsculas. A busca aceita nome, origem/categoria e nível. O catálogo reúne **196 registros de dons (221 entradas por origem)** e **40 rituais**, incluindo seis pequenos rituais. Nomes, níveis e referências de páginas foram transcritos do PDF fornecido; descrições integrais não foram incorporadas. Dons de mesmo nome e nível reúnem suas origens; versões de níveis diferentes permanecem separadas. O nível do Ritual do Novo Despertar não está indicado na entrada consultada e fica vazio, sem inventar um valor. É possível criar registros personalizados.

Ao escolher **Nova ficha**, há dois modos: **Livre**, com edição manual sem contabilidade obrigatória, e **Gastando pontos**, com etapas persistentes de identidade, atributos (7/5/3), habilidades (13/9/5; máximo 3 nesta fase), antecedentes (5), três dons iniciais de origem e 15 pontos de bônus. As prioridades são escolhidas antes de distribuir a categoria. Restrições de Lupinos, Garras Vermelhas e antecedentes tribais são aplicadas; Presas de Prata exigem Raça Pura 3. Recursos iniciais vêm da raça, augúrio e tribo. Impuros exigem deformidade e usam Gnose 3, conforme a seção detalhada da p. 86. Por decisão do usuário, Philodox começa com Honra 3; Galliard com Glória 2/Sabedoria 1. Rituais iniciais respeitam o antecedente e Conhecimento Rituais. Bônus pode ser desfeito em ordem inversa, sem retirar pontos da distribuição inicial.

Em **Ficha → Evolução → Gastar XP**, o app mostra a melhoria, o custo e os saldos antes da confirmação. A compra desconta XP disponível e aumenta XP gasto. Custos: atributo atual ×4; habilidade atual ×2 (nova habilidade: 3); Fúria/Força de Vontade atuais ×1; Gnose atual ×2; dom próprio nível ×3, alheio ×5, com opção +1 se ensinado por outro Garou. Posto limita o nível do dom. A mesma característica só sobe uma vez por história; **Encerrar história** libera a próxima evolução após confirmação. A ficha por pontos protege a edição direta de características permanentes e dons; o modo Livre continua manual. Antecedentes e rituais não recebem um custo de XP inventado.

Fera Interior (p. 156) é calculada pela diferença positiva entre Fúria permanente e Força de Vontade permanente. O app exibe a redução de dados dos testes de interação social em Ficha, Traços e Combate, e a prévia ao comprar recursos. Não altera atributos e não usa pontos temporários. A ficha não faz rolagens de dados.

Textos de dons e rituais são anotações do usuário; não há biblioteca de descrições integrais do livro. Ferimentos e pontos temporários continuam manuais.

## Desenvolvimento local

O código da interface está em `web/`; a camada Android em `android/app/src/main/`. O Android usa um WebView com arquivos locais interceptados em uma origem HTTPS reservada, armazenamento privado e seletor nativo de documentos. Não solicita permissão de internet ou de acesso geral aos arquivos.

As ferramentas estão em `.tools/` e são ignoradas pelo Git. A construção usa JDK 21, SDK Platform 35 e Build Tools 35.0.0, sem Gradle ou dependências de interface externas. O script assina o APK com `.tools/debug.keystore`; preserve essa chave para instalar atualizações sobre esta versão.

```powershell
# Abrir o emulador preparado nesta máquina
.\scripts\open-emulator.ps1

# Compilar, instalar e iniciar; mantenha apenas um Android conectado
.\scripts\run-android.ps1

# Somente compilar
.\scripts\build-android.ps1

# Testes das regras e validação de backup
node --test tests/*.test.js

# Testes de integração no APK já aberto no emulador
node tests/android-e2e.mjs
node tests/catalog-android.mjs
node tests/navigation-android.mjs
node tests/back-android.mjs
node tests/progression-android.mjs
node tests/layout-android.mjs
```

Os testes de integração criam uma ficha temporária, exercitam a interface dentro do WebView do APK e restauram os dados anteriores ao terminar. Não edite fichas durante a execução dos testes. O WebView permite depuração remota nesta compilação de desenvolvimento.

Para servir a interface no computador sem Android: `python -m http.server 4173 --directory web`, depois abra `http://localhost:4173`. A interface precisa ser servida por HTTP, pois utiliza módulos JavaScript. O salvamento da versão de navegador é separado do Android.

## Escopo da revisão

Os relatórios de integração e capturas do emulador são gravados em `output/`. A verificação de instalação, interface e persistência em emuladores não substitui testes em aparelhos físicos de diferentes fabricantes.

O PDF fornecido é material de consulta local e não é incorporado ao APK. Aplicativo pessoal, sem vínculo oficial com os titulares do jogo.
