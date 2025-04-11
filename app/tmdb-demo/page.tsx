import TmdbSearchExample from "../components/TmdbSearchExample";

export const metadata = {
  title: "TMDB API Proxy Demo",
  description: "Demonstration of the TMDB API proxy implementation",
};

export default function TmdbDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">TMDB API Proxy Demo</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          This page demonstrates how to use the TMDB API proxy to bypass ISP
          restrictions.
        </p>

        <TmdbSearchExample />

        <div className="mt-12 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <p className="mb-4">
            This demo uses a serverless API route to proxy requests to the TMDB
            API. The serverless function:
          </p>
          <ol className="list-decimal list-inside space-y-2 mb-6">
            <li>Receives requests from the frontend with query parameters</li>
            <li>
              Adds the TMDB API key (stored securely in environment variables)
            </li>
            <li>Makes a server-side request to the TMDB API</li>
            <li>Returns the response to the frontend</li>
          </ol>
          <p>
            This approach keeps your API key secure and bypasses any ISP-level
            restrictions on accessing the TMDB API directly from the client.
          </p>
        </div>
      </div>
    </div>
  );
}
