export async function GET() {
  return new Response(
    JSON.stringify({ hasKey: !!process.env.GOOGLE_API_KEY }),
    { headers: { "Content-Type": "application/json" } }
  );
}
