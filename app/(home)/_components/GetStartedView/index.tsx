import { DebuggingInfo, MediaDisplay } from "./components";
import { IssuanceModal } from "./components/IssuanceModal";
import { getMediaAsset } from "./utils/media";

export const GetStartedView = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      {/* Media Display Section */}
      <div className="w-full max-w-md">
        <MediaDisplay
          src={getMediaAsset("heroVideo")}
          alt="Credential issuance preview"
          type="auto"
          className="max-h-64 object-cover"
        />
      </div>
      
      {/* Issuance Modal */}
      <IssuanceModal />
      
      {/* Debugging Info */}
      <DebuggingInfo />
    </div>
  );
};
