#!/usr/bin/env python3
"""
Script para gerar imagens do Play Store:
- Feature Graphic (1024x500px)
- Screenshots placeholder (para referência)
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Cores do FinFlow
COR_AZUL_PRINCIPAL = (74, 103, 175)  # #4a67af
COR_AZUL_ESCURO = (45, 25, 156)      # #2d199c
COR_BRANCO = (255, 255, 255)
COR_CINZA_CLARO = (245, 247, 250)

def criar_gradiente_azul(largura, altura):
    """Cria uma imagem com gradiente azul"""
    img = Image.new('RGB', (largura, altura), COR_AZUL_PRINCIPAL)
    draw = ImageDraw.Draw(img)
    
    # Criar gradiente horizontal
    for x in range(largura):
        # Interpolação linear entre as duas cores
        ratio = x / largura
        r = int(COR_AZUL_PRINCIPAL[0] * (1 - ratio) + COR_AZUL_ESCURO[0] * ratio)
        g = int(COR_AZUL_PRINCIPAL[1] * (1 - ratio) + COR_AZUL_ESCURO[1] * ratio)
        b = int(COR_AZUL_PRINCIPAL[2] * (1 - ratio) + COR_AZUL_ESCURO[2] * ratio)
        draw.line([(x, 0), (x, altura)], fill=(r, g, b))
    
    return img

def criar_feature_graphic():
    """Cria o recurso gráfico (feature graphic) 1024x500px"""
    largura = 1024
    altura = 500
    
    # Criar imagem base com gradiente
    img = criar_gradiente_azul(largura, altura)
    draw = ImageDraw.Draw(img)
    
    # Tentar carregar fonte (fallback para padrão se não encontrar)
    try:
        # Tentar usar fonte do sistema
        font_titulo = ImageFont.truetype("arial.ttf", 80)
        font_subtitulo = ImageFont.truetype("arial.ttf", 40)
        font_credito = ImageFont.truetype("arial.ttf", 20)
    except:
        try:
            font_titulo = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 80)
            font_subtitulo = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 40)
            font_credito = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 20)
        except:
            # Fallback para fonte padrão
            font_titulo = ImageFont.load_default()
            font_subtitulo = ImageFont.load_default()
            font_credito = ImageFont.load_default()
    
    # Carregar logo se existir
    logo_path = "../assets/icon.png"
    logo = None
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path)
            # Redimensionar logo para ~200px de altura
            logo_height = 200
            logo_width = int(logo.width * (logo_height / logo.height))
            logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
        except:
            logo = None
    
    # Desenhar logo (esquerda, centralizado verticalmente)
    if logo:
        logo_x = 50
        logo_y = (altura - logo_height) // 2
        # Se logo tem transparência, converter para RGB
        if logo.mode == 'RGBA':
            # Criar fundo branco para logo
            logo_bg = Image.new('RGB', logo.size, COR_BRANCO)
            logo_bg.paste(logo, mask=logo.split()[3] if logo.mode == 'RGBA' else None)
            logo = logo_bg
        img.paste(logo, (logo_x, logo_y))
    
    # Texto principal "FinFlow"
    texto_titulo = "FinFlow"
    texto_x = 300 if logo else 100
    texto_y = altura // 2 - 80
    draw.text((texto_x, texto_y), texto_titulo, fill=COR_BRANCO, font=font_titulo)
    
    # Subtítulo
    texto_subtitulo = "Controle Financeiro Simplificado"
    subtitulo_x = texto_x
    subtitulo_y = texto_y + 100
    draw.text((subtitulo_x, subtitulo_y), texto_subtitulo, fill=COR_BRANCO, font=font_subtitulo)
    
    # Ícones/emoji (usando texto)
    emojis = "💰  📊  📅  🔒"
    emojis_x = subtitulo_x
    emojis_y = subtitulo_y + 60
    try:
        # Tentar usar fonte que suporta emoji
        font_emoji = ImageFont.truetype("C:/Windows/Fonts/seguiemj.ttf", 40)
    except:
        font_emoji = font_subtitulo
    draw.text((emojis_x, emojis_y), emojis, fill=COR_BRANCO, font=font_emoji)
    
    # Crédito (canto inferior direito)
    credito = "Desenvolvido por Liz Softwares"
    bbox = draw.textbbox((0, 0), credito, font=font_credito)
    credito_width = bbox[2] - bbox[0]
    credito_x = largura - credito_width - 30
    credito_y = altura - 40
    draw.text((credito_x, credito_y), credito, fill=COR_BRANCO, font=font_credito)
    
    return img

def criar_placeholder_screenshot(largura, altura, titulo):
    """Cria um placeholder para screenshot"""
    img = Image.new('RGB', (largura, altura), COR_CINZA_CLARO)
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 60)
    except:
        font = ImageFont.load_default()
    
    # Texto centralizado
    bbox = draw.textbbox((0, 0), titulo, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = (largura - text_width) // 2
    text_y = (altura - text_height) // 2
    
    draw.text((text_x, text_y), titulo, fill=COR_AZUL_PRINCIPAL, font=font)
    
    # Adicionar instrução
    try:
        font_pequeno = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 30)
    except:
        font_pequeno = ImageFont.load_default()
    
    instrucao = "Substitua por screenshot real do app"
    bbox_inst = draw.textbbox((0, 0), instrucao, font=font_pequeno)
    inst_width = bbox_inst[2] - bbox_inst[0]
    inst_x = (largura - inst_width) // 2
    inst_y = text_y + text_height + 40
    draw.text((inst_x, inst_y), instrucao, fill=(150, 150, 150), font=font_pequeno)
    
    return img

def main():
    """Função principal"""
    # Criar diretório de saída
    output_dir = "../assets/play-store"
    os.makedirs(output_dir, exist_ok=True)
    
    print("🎨 Gerando imagens para Play Store...")
    
    # 1. Feature Graphic (1024x500px)
    print("📐 Criando Feature Graphic (1024x500px)...")
    feature_graphic = criar_feature_graphic()
    feature_path = os.path.join(output_dir, "feature-graphic.png")
    feature_graphic.save(feature_path, "PNG", optimize=True)
    print(f"✅ Feature Graphic salvo em: {feature_path}")
    
    # 2. Placeholders para screenshots (1080x1920 para telefone vertical)
    print("📱 Criando placeholders para screenshots...")
    screenshots = [
        ("Login", "Tela de Login"),
        ("Dashboard", "Tela Principal/Dashboard"),
        ("Receitas", "Tela de Receitas"),
        ("Despesas", "Tela de Despesas"),
        ("Calendario", "Calendário de Vencimentos"),
        ("Graficos", "Gráficos e Relatórios"),
    ]
    
    for nome, titulo in screenshots:
        screenshot = criar_placeholder_screenshot(1080, 1920, titulo)
        screenshot_path = os.path.join(output_dir, f"screenshot-{nome.lower()}.png")
        screenshot.save(screenshot_path, "PNG", optimize=True)
        print(f"✅ Screenshot placeholder '{nome}' salvo")
    
    print("\n✨ Todas as imagens foram geradas!")
    print(f"📁 Localização: {output_dir}")
    print("\n📝 Próximos passos:")
    print("1. Use o feature-graphic.png no Play Console")
    print("2. Substitua os placeholders por screenshots reais do app")
    print("3. Screenshots devem ser capturados do app em execução")

if __name__ == "__main__":
    main()

