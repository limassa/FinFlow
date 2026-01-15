# Instruções para Assets do App

O app precisa de alguns arquivos de imagem para funcionar corretamente. Você pode criar ou baixar os seguintes assets:

## 📁 Assets Necessários

Crie uma pasta `assets/` na raiz do projeto mobile com os seguintes arquivos:

### 1. `icon.png`
- **Tamanho**: 1024x1024 pixels
- **Formato**: PNG
- **Descrição**: Ícone do aplicativo
- **Cor de fundo**: #4a67af (azul primário)

### 2. `splash.png`
- **Tamanho**: 1242x2436 pixels (ou proporcional)
- **Formato**: PNG
- **Descrição**: Tela de splash (tela inicial)
- **Cor de fundo**: #4a67af (azul primário)
- **Conteúdo**: Logo do FinFlow centralizado

### 3. `adaptive-icon.png` (Android)
- **Tamanho**: 1024x1024 pixels
- **Formato**: PNG
- **Descrição**: Ícone adaptativo para Android
- **Cor de fundo**: #4a67af (azul primário)

### 4. `favicon.png` (Web)
- **Tamanho**: 48x48 pixels
- **Formato**: PNG
- **Descrição**: Favicon para versão web

## 🎨 Cores Sugeridas

- **Cor primária**: #4a67af
- **Cor de fundo**: #ffffff
- **Cor do texto**: #222222

## 🛠️ Como Criar os Assets

### Opção 1: Usar o Expo Asset Generator
```bash
npx expo-asset-generator
```

### Opção 2: Criar Manualmente
1. Use um editor de imagens (Photoshop, GIMP, Figma, etc.)
2. Crie as imagens com os tamanhos especificados
3. Salve na pasta `assets/`

### Opção 3: Usar Templates Online
- [App Icon Generator](https://www.appicon.co/)
- [Icon Kitchen](https://icon.kitchen/)

## 📝 Nota

Se você não tiver os assets prontos, o app ainda funcionará, mas você verá avisos no console. Os assets são necessários apenas quando você fizer o build para produção.

## 🚀 Teste Rápido

Para testar sem assets, você pode usar imagens temporárias ou deixar os arquivos vazios. O Expo usará imagens padrão.

