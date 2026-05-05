export const fallbackCategories = [
  { id: 1, name: 'Web Development' },
  { id: 2, name: 'Design' },
  { id: 3, name: 'Copywriting' },
  { id: 4, name: 'Data Analysis' },
  { id: 5, name: 'Mobile Development' },
];

export function getCategories() {
  return Promise.resolve({ data: { categories: fallbackCategories } });
}
