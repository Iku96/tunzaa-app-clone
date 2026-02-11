import { Text, StyleSheet, TextProps } from 'react-native';

interface PriceTagProps extends TextProps {
    price: number;
    currency?: string;
    color?: string;
    size?: number;
    bold?: boolean;
}

export default function PriceTag({
    price,
    currency = 'Tsh.',
    color = '#4A55A2', // Brand Blue 
    size = 14,
    bold = true,
    style,
    ...props
}: PriceTagProps) {

    const formattedPrice = new Intl.NumberFormat('en-US').format(price);

    return (
        <Text
            style={[
                styles.text,
                { color: color, fontSize: size, fontWeight: bold ? 'bold' : 'normal' },
                style
            ]}
            {...props}
        >
            {currency} {formattedPrice}
        </Text>
    );
}

const styles = StyleSheet.create({
    text: {
        includeFontPadding: false,
    }
});
