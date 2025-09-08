import Nav from "@/components/nav";
import { SearchPage } from "@/components/search/SearchPage";

export const metadata = {
  title: "Search Songs | Music Player",
  description: "Search and discover songs on the platform",
};

export default async function Page() {
  return (
    <div>
      <Nav />
      <SearchPage />
    </div>
  );
}
