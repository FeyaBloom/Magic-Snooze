import { TextStyle } from 'react-native';

export const typography = {
  h1: {
    fontFamily: 'Cormorant_600SemiBold',
    fontSize: 32,
    fontWeight: '600',
  } as TextStyle,
  
  h2: {
    fontFamily: 'Cormorant_600SemiBold',
    fontSize: 22,
    fontWeight: '600',
  } as TextStyle,
  
  quote: {
    fontFamily: 'Cormorant_600Regular_Italic',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
  } as TextStyle,
  
  button: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    fontWeight: '700',
  } as TextStyle,
  
  body: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    fontWeight: '400',
  } as TextStyle,
  
  caption: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    fontWeight: '400',
  } as TextStyle,
};