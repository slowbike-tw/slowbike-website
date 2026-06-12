import { statusTone } from "@/lib/logistics";
import type { AssemblyStatus, DeliveryStatus, LogisticsStatus } from "@/types/logistics";

export function StatusBadge({
  status,
}: {
  status: LogisticsStatus | AssemblyStatus | DeliveryStatus;
}) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ${statusTone(status)}`}>
      {status}
    </span>
  );
}

