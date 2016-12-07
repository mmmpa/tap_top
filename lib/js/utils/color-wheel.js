export const colors = [
  '#0086AB', '#0098A6',
  '#00A199', '#009C7F',
  '#009767', '#009250',
  '#059C30', '#0BA60B',
  '#3BB111', '#6FBB18',
  '#A4C520', '#B6D11B',
  '#CBDC15', '#E4E80F',
  '#F3EB08', '#FFE600',
  '#FBDA02', '#F8CF05',
  '#F4C107', '#F1B709',
  '#EDAD0B', '#E58611',
  '#DE6316', '#D6431B',
  '#CF2620', '#C7243A',
  '#C42245', '#C01F52',
  '#BD1D5D', '#B91B67',
  '#B61972', '#AF1C74',
  '#A81F76', '#A12275',
  '#9A2475', '#932674',
  '#953095', '#7F3B97',
  '#6C469A', '#5F519C',
  '#5D639E', '#4D5FA3',
  '#3B60A8', '#2962AD',
  '#156BB2', '#007AB7',
  '#007CB5', '#0080B2',
  '#0081B0', '#0085AD'
];
const colorLength = colors.length

export function textToColor (s) {
  return colors[(s.charCodeAt(1) + s.charCodeAt(2)) % colorLength]
}

export function numToColor (n) {
  return colors[n % colorLength]
}