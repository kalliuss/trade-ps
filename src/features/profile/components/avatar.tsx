import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Text, useTheme } from '@/components/ui';
import { layout, radius } from '@/constants/theme';

type AvatarProps = {
  uri: string | null;
  name: string;
  size?: number;
};

export function Avatar({ uri, name, size = layout.avatar }: AvatarProps) {
  const { colors } = useTheme();
  const shape = { width: size, height: size, borderRadius: radius.pill };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[shape, styles.frame, { borderColor: colors.line2 }]}
        contentFit="cover"
        accessibilityLabel={`${name} profil fotoğrafı`}
      />
    );
  }

  return (
    <View
      accessibilityLabel={`${name} profil fotoğrafı yok`}
      style={[shape, styles.frame, styles.placeholder, { backgroundColor: colors.bgRaised, borderColor: colors.line2 }]}>
      <Text variant="title" tone="ink2">
        {name.charAt(0).toLocaleUpperCase('tr-TR')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: layout.borderWidth,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
