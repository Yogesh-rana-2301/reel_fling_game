import CloudflareMoviesExample from "../components/CloudflareMoviesExample";

export const metadata = {
  title: "Movies via Cloudflare Worker",
  description:
    "Browse and search movies using our Cloudflare Worker TMDb API proxy",
};

export default function CloudflareMoviesPage() {
  return (
    <main className="min-h-screen py-8">
      <CloudflareMoviesExample />
    </main>
  );
}
