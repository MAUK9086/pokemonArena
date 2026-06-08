export const TYPE_COLORS = {
  normal:   { primary: '#A8A878', secondary: '#C6C6A7', particle: '#A8A878' },
  fire:     { primary: '#F08030', secondary: '#F5AC78', particle: '#FF6B00' },
  water:    { primary: '#6890F0', secondary: '#9DB7F5', particle: '#4FC3F7' },
  electric: { primary: '#F8D030', secondary: '#FAE078', particle: '#FFD700' },
  grass:    { primary: '#78C850', secondary: '#A7DB8D', particle: '#66BB6A' },
  ice:      { primary: '#98D8D8', secondary: '#BCE6E6', particle: '#B2EBF2' },
  fighting: { primary: '#C03028', secondary: '#D67873', particle: '#EF5350' },
  poison:   { primary: '#A040A0', secondary: '#C183C1', particle: '#BA68C8' },
  ground:   { primary: '#E0C068', secondary: '#EBD69D', particle: '#D4A017' },
  flying:   { primary: '#A890F0', secondary: '#C6B7F5', particle: '#B39DDB' },
  psychic:  { primary: '#F85888', secondary: '#FA92B2', particle: '#F06292' },
  bug:      { primary: '#A8B820', secondary: '#C6D16E', particle: '#AED581' },
  rock:     { primary: '#B8A038', secondary: '#D1C17D', particle: '#A1887F' },
  ghost:    { primary: '#705898', secondary: '#A292BC', particle: '#9575CD' },
  dragon:   { primary: '#7038F8', secondary: '#A27DFA', particle: '#7B1FA2' },
  dark:     { primary: '#705848', secondary: '#A29288', particle: '#5D4037' },
  steel:    { primary: '#B8B8D0', secondary: '#D1D1E0', particle: '#90A4AE' },
  fairy:    { primary: '#EE99AC', secondary: '#F4BDC9', particle: '#F48FB1' },
};

export function getTypeColor(typeName) {
  return TYPE_COLORS[typeName?.toLowerCase()] ?? TYPE_COLORS.normal;
}

export function typeToGradient(typeName, opacity = 0.35) {
  const { primary } = getTypeColor(typeName);
  const hex = primary.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
