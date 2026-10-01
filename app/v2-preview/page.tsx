import { V2PortfolioTemplate } from "@/app/components/v2-portfolio/V2PortfolioTemplate";
import { v2PreviewData } from "@/app/components/v2-portfolio/demoData";

export default function V2PreviewPage() {
  return <V2PortfolioTemplate data={v2PreviewData} mode="preview" />;
}
