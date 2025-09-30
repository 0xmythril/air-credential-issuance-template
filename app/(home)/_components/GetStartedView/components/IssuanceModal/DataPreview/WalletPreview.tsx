import { formatKey, formatValue } from "@/lib/utils";

interface WalletPreviewProps {
  response: Record<string, unknown>;
}

export const WalletPreview = ({ response }: WalletPreviewProps) => {
  return (
    <div className="space-y-2 text-center max-w-md">
      {Object.entries(response).map(([key, value]) => {
        // Skip the is_test_address field from display
        if (key === "is_test_address") return null;

        const isTestAddress = Boolean(response.is_test_address);
        const isAddressField = key === "address";

        return (
          <div
            key={key}
            className={isAddressField && isTestAddress ? "text-orange-600 font-semibold" : ""}
          >
            {formatKey(key, isTestAddress)}: {formatValue(key, value)}
          </div>
        );
      })}
    </div>
  );
};
