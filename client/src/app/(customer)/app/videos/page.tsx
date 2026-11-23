import type { Metadata } from "next";
import { videos } from "@/data/videos";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SavedVideos } from "@/components/video/saved-videos";

export const metadata: Metadata = { title: "Videos" };

export default function AppVideosPage() {
  return (
    <PageContainer size="wide">
      <PageHeader title="Video library" description="Manufacturer demos, independent reviews, installation and maintenance — every video linked to the products it covers. Sponsored videos are always labelled." />
      <SavedVideos videos={videos} />
    </PageContainer>
  );
}
