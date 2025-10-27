export async function generateStaticParams() {
  // For now, return empty array since we don't have static tokens
  // In production, you might want to pre-generate some static paths
  return [];
}

export default function PublicProposalTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <div>
      <h1>Public Proposal</h1>
      <p>Public proposal view will be implemented here.</p>
    </div>
  );
}
