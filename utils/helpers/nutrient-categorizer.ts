export type NutrientCategory = 'macro' | 'minerals' | 'vitamins' | 'aminoacids' | 'other';

export const categorizeNutrient = (name: string): NutrientCategory => {
  const n = name.toLowerCase();

  // Macros (Italian and English just in case)
  if (
    n.includes('proteine') ||
    n.includes('grassi') ||
    n.includes('carboidrati') ||
    n.includes('zuccheri') ||
    n.includes('fibre') ||
    n.includes('acqua') ||
    n.includes('alcol') ||
    n.includes('amido') ||
    n.includes('energy') ||
    n.includes('energia') ||
    n.includes('lipidi') ||
    n.includes('proteina') ||
    n.includes('carboidrato')
  ) {
    return 'macro';
  }

  // Minerals
  if (
    n.includes('calcio') ||
    n.includes('ferro') ||
    n.includes('magnesio') ||
    n.includes('fosforo') ||
    n.includes('potassio') ||
    n.includes('sodio') ||
    n.includes('zinco') ||
    n.includes('rame') ||
    n.includes('manganese') ||
    n.includes('selenio') ||
    n.includes('iodio') ||
    n.includes('cloro') ||
    n.includes('zolfo')
  ) {
    return 'minerals';
  }

  // Vitamins
  if (
    n.includes('vitamina') ||
    n.includes('tiamina') ||
    n.includes('riboflavina') ||
    n.includes('niacina') ||
    n.includes('folati') ||
    n.includes('folico') ||
    n.includes('retinolo') ||
    n.includes('carotene') ||
    n.includes('tocoferolo') ||
    n.includes('biotina') ||
    n.includes('acido pantotenico') ||
    n.includes('acido ascorbico')
  ) {
    return 'vitamins';
  }

  // Aminoacids
  if (
    n.includes('lisina') ||
    n.includes('metionina') ||
    n.includes('triptofano') ||
    n.includes('isoleucina') ||
    n.includes('leucina') ||
    n.includes('valina') ||
    n.includes('treonina') ||
    n.includes('fenilalanina') ||
    n.includes('istidina') ||
    n.includes('arginina') ||
    n.includes('acido aspartico') ||
    n.includes('acido glutammico') ||
    n.includes('alanina') ||
    n.includes('cistina') ||
    n.includes('glicina') ||
    n.includes('prolina') ||
    n.includes('serina') ||
    n.includes('tirosina')
  ) {
    return 'aminoacids';
  }

  return 'other';
};
