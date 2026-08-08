import { useLocalSearchParams } from 'expo-router';

import { DeleteCategory } from '@/screens/delete-category';

export default function DeleteCategoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <DeleteCategory categoryId={id} />;
}
