#!/bin/bash

# Script para descobrir o IP da máquina na rede local
# Use este IP na configuração da API do app mobile

echo "🔍 Descobrindo o IP da sua máquina na rede local..."
echo ""

# Tentar diferentes métodos para descobrir o IP
if command -v ip &> /dev/null; then
    # Linux com ip command
    IP=$(ip route get 8.8.8.8 2>/dev/null | awk '{print $7; exit}' | head -1)
elif command -v ifconfig &> /dev/null; then
    # macOS/Linux com ifconfig
    IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
else
    echo "❌ Não foi possível descobrir o IP automaticamente."
    echo "   Execute 'ifconfig' ou 'ip addr' manualmente"
    exit 1
fi

if [ -z "$IP" ]; then
    echo "❌ Não foi possível determinar o IP automaticamente."
    echo "   Execute 'ifconfig' ou 'ip addr' e procure pelo IP da sua interface de rede"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 CONFIGURE NO APP:"
echo ""
echo "   Edite: mobile/src/config/api.js"
echo "   Altere para:"
echo ""
echo "   return 'http://$IP:3001';"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Dica: Certifique-se de que:"
echo "   - O backend está rodando na porta 3001"
echo "   - Seu dispositivo e computador estão na mesma rede Wi-Fi"
echo "   - O firewall permite conexões na porta 3001"
echo ""

