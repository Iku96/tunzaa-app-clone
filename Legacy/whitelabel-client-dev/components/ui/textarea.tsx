import { TextInput, type TextInputProps, Platform } from 'react-native';
import { cn } from '@/lib/utils';
import { typography } from '@/styles/theme/typography';

function Textarea({
  className,
  multiline = true,
  numberOfLines = 4,
  placeholderClassName,
  ...props
}: TextInputProps & {
  ref?: React.RefObject<TextInput>;
}) {
  const nativeStyle = Platform.OS !== 'web' ? { fontFamily: typography.fontFamily.regular } : {};

  return (
    <TextInput
      className={cn(
        'web:flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base lg:text-sm native:text-lg native:leading-loose text-foreground web:ring-offset-background placeholder:text-muted-foreground web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
        props.editable === false && 'opacity-50 web:cursor-not-allowed',
        className
      )}
      placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical='top'
      style={[nativeStyle, props.style]}
      {...props}
    />
  );
}

export { Textarea };
