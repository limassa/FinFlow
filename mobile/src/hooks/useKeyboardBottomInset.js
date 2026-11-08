import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Keyboard, Platform, StatusBar } from 'react-native';

/**
 * Altura do teclado — útil em Modal/bottom-sheet no Android,
 * onde KeyboardAvoidingView sozinho costuma falhar.
 */
export function useKeyboardBottomInset() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvt, (e) => {
      setHeight(e?.endCoordinates?.height || 0);
    });
    const onHide = Keyboard.addListener(hideEvt, () => setHeight(0));
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  return height;
}

/**
 * Estilo do bottom-sheet de formulário com teclado aberto no Android.
 *
 * Com softwareKeyboardLayoutMode=resize a janela já encolhe. Somar
 * marginBottom = altura do teclado empurra o sheet para fora da tela
 * (só sobram 1–2 campos no topo e a lista aparece no meio).
 */
export function useFormSheetKeyboardStyle(safeBottom = 16) {
  const keyboardInset = useKeyboardBottomInset();

  return useMemo(() => {
    const paddingBottom = Math.max(safeBottom, 16);

    if (Platform.OS !== 'android' || keyboardInset <= 0) {
      return {
        paddingBottom,
        marginBottom: 0,
        maxHeight: '90%',
      };
    }

    const window = Dimensions.get('window');
    const screen = Dimensions.get('screen');
    const statusBar = StatusBar.currentHeight || 0;
    const topGap = statusBar + 12;

    // Se a window já perdeu altura ~equivalente ao teclado, o resize agiu:
    // não aplicar marginBottom de novo.
    const usableScreen = screen.height - statusBar;
    const alreadyResized =
      window.height <= usableScreen - keyboardInset * 0.35;

    if (alreadyResized) {
      return {
        paddingBottom,
        marginBottom: 0,
        maxHeight: Math.max(280, window.height - 12),
      };
    }

    // Modal transparente que não redimensiona: sobe o sheet manualmente.
    return {
      paddingBottom,
      marginBottom: keyboardInset,
      maxHeight: Math.max(300, window.height - keyboardInset - topGap),
    };
  }, [keyboardInset, safeBottom]);
}
