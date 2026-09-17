import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

interface WaitingCardProps {
  message: string;
  description?: string;
}

export default function WaitingCard({
  message,
  description = 'The service information will appear here automatically when it is ready.',
}: WaitingCardProps) {
  return (
    <View
      className="
        mb-6
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-card
      "
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        elevation: 2,
      }}
    >
      <View
        className="
          flex-row
          items-center
          px-4
          py-4
        "
      >
        <View
          className="
            mr-3
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-primary/10
          "
        >
          <ActivityIndicator
            size="small"
            color="#C1272D"
          />
        </View>

        <View
          className="
            min-w-0
            flex-1
          "
        >
          <Text
            className="
              text-base
              font-semibold
              text-foreground
            "
          >
            {message}
          </Text>

          <Text
            className="
              mt-1
              text-sm
              leading-5
              text-muted-foreground
          "
          >
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
}